import type { ActionFunctionArgs } from "react-router";
import Stripe from "stripe";
import {
    syncCreateSubscriptionToMongo,
    syncUpdateSubscriptionToMongo,
    deleteSubscriptionFromMongo,
} from "../utils/syncSubscription.server";
import User from "@/models/User";
import { assignAutoExercisesForUser } from "@/server";

export type WebhookResult = {
    success: boolean;
    message: string;
    event?: string;
};

/**
 * Stripe webhook handler for checkout completion
 *
 * Handles: checkout.session.completed
 * Purpose: Updates customer metadata with client_reference_id from checkout
 *
 * Usage in consumer app routes/webhook.stripe.tsx:
 * ```ts
 * import { stripeWebhookHandler } from "@acessment/core-oes/server";
 *
 * export const action = async (args: ActionFunctionArgs) => {
 *     return await stripeWebhookHandler(args);
 * };
 * ```
 *
 * Local testing with Stripe CLI:
 * ```bash
 * stripe listen --forward-to http://localhost:3000/webhook/stripe
 * stripe trigger checkout.session.completed --add checkout_session:client_reference_id=test_user_123
 * ```
 */
export async function stripeWebhookHandler({ request }: ActionFunctionArgs): Promise<Response> {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
        console.error("Missing Stripe credentials: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
        return new Response(JSON.stringify({ error: "Configuration error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2025-12-15.clover",
    });

    let event: Stripe.Event;

    try {
        // Get raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get("stripe-signature");

        if (!signature) {
            console.error("No stripe-signature header found");
            return new Response(JSON.stringify({ error: "No signature" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Verify webhook signature
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log(`✓ Webhook signature verified: ${event.type}`);

        
    } catch (err: any) {
        console.error(`Webhook signature verification failed:`, err.message);
        return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Handle the event
    try {
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(stripe, session);
                break;

            case "customer.subscription.created":
                const createdSubscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCreated(stripe, createdSubscription);
                break;

            case "customer.subscription.updated":
                const updatedSubscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(stripe, updatedSubscription);
                break;

            case "customer.subscription.deleted":
                const deletedSubscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(stripe, deletedSubscription);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true, event: event.type }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error processing webhook:", error);
        return new Response(JSON.stringify({ error: "Processing failed", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

/**
 * Handle checkout.session.completed event
 * Updates customer metadata with client_reference_id (userId)
 * AND syncs the subscription to MongoDB
 *
 * This allows subscriptionLoader to find customers by searching:
 * metadata['userId']:'userId'
 */
async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
    console.log("Processing checkout.session.completed:", session.id);

    const customerId = session.customer as string;
    const clientReferenceId = session.client_reference_id;

    if (!customerId) {
        console.error("No customer ID in session");
        return;
    }

    if (!clientReferenceId) {
        console.warn("No client_reference_id in session - cannot link to user");
        console.warn("Make sure stripe-pricing-table has client-reference-id attribute set");
        return;
    }

    try {
        // Update customer metadata with userId
        await stripe.customers.update(customerId, {
            metadata: {
                userId: clientReferenceId,
            },
        });

        console.log(`✓ Updated customer ${customerId} with client_reference_id: ${clientReferenceId}`);

        // Sync subscription to MongoDB if subscription exists in session
        if (session.subscription) {
            const subscriptionId =
                typeof session.subscription === "string" ? session.subscription : session.subscription.id;

            // Retrieve full subscription details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
                expand: ["items.data.price.product"],
            });

            await syncCreateSubscriptionToMongo(session.id, subscription, clientReferenceId);
            console.log(`✓ Synced subscription ${subscriptionId} to MongoDB`);

            // Assign auto-exercises for previous day and current day
            try {
                const user = await User.findById(clientReferenceId).exec();
                if (user && user.grade && user.username) {
                    const result = await assignAutoExercisesForUser(clientReferenceId, user.grade, user.username);
                    console.log(
                        `✓ Auto-assigned exercises for new subscriber: ${result.homeworkCreated} exercises assigned (${result.success} successful, ${result.errors} failed)`
                    );
                } else {
                    console.warn(`Cannot auto-assign exercises: user ${clientReferenceId} missing grade or username`);
                }
            } catch (exerciseError: any) {
                console.error(`Failed to auto-assign exercises for user ${clientReferenceId}:`, exerciseError.message);
                // Don't throw - subscription was already synced successfully
            }
        }
    } catch (error: any) {
        console.error(`Failed to process checkout for customer ${customerId}:`, error.message);
        throw error;
    }
}

/**
 * Handle customer.subscription.created event
 * Creates a new subscription in MongoDB when manually created in Stripe
 *
 * Use cases:
 * - Admin manually creates subscription in Stripe dashboard
 * - Subscription created via Stripe API (not through checkout)
 * - Migration of existing subscriptions
 */
async function handleSubscriptionCreated(stripe: Stripe, subscription: Stripe.Subscription) {
    console.log("Processing subscription creation:", subscription.id);

    try {
        // Get userId from customer metadata
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        const customer = await stripe.customers.retrieve(customerId);

        if (customer.deleted) {
            console.error(`Customer ${customerId} was deleted`);
            return;
        }

        const userId = customer.metadata?.userId;

        if (!userId) {
            console.warn(`No userId in customer ${customerId} metadata - skipping sync`);
            console.warn(`Make sure customer has userId in metadata before creating subscriptions`);
            return;
        }

        // Expand product details if not already expanded
        let fullSubscription = subscription;
        if (subscription.items.data.length > 0) {
            const firstPrice = subscription.items.data[0].price;
            if (typeof firstPrice.product === "string") {
                // Need to expand product
                fullSubscription = await stripe.subscriptions.retrieve(subscription.id, {
                    expand: ["items.data.price.product"],
                });
            }
        }

        // Use null as sessionId since this wasn't created via checkout
        await syncCreateSubscriptionToMongo(null, fullSubscription, userId);
        console.log(`✓ Created subscription ${subscription.id} in MongoDB for user ${userId}`);

        // Assign auto-exercises for previous day and current day
        try {
            const user = await User.findById(userId).exec();
            if (user && user.grade && user.username) {
                const result = await assignAutoExercisesForUser(userId, user.grade, user.username);
                console.log(
                    `✓ Auto-assigned exercises for new subscriber: ${result.homeworkCreated} exercises assigned (${result.success} successful, ${result.errors} failed)`
                );
            } else {
                console.warn(`Cannot auto-assign exercises: user ${userId} missing grade or username`);
            }
        } catch (exerciseError: any) {
            console.error(`Failed to auto-assign exercises for user ${userId}:`, exerciseError.message);
            // Don't throw - subscription was already synced successfully
        }
    } catch (error: any) {
        console.error(`Failed to create subscription ${subscription.id}:`, error.message);
        throw error;
    }
}

/**
 * Handle customer.subscription.updated event
 * Updates existing subscription in MongoDB
 */
async function handleSubscriptionUpdated(stripe: Stripe, subscription: Stripe.Subscription) {
    console.log("Processing subscription update:", subscription.id);

    try {
        // Get userId from customer metadata
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        const customer = await stripe.customers.retrieve(customerId);

        if (customer.deleted) {
            console.error(`Customer ${customerId} was deleted`);
            return;
        }

        const userId = customer.metadata?.userId;

        if (!userId) {
            console.warn(`No userId in customer ${customerId} metadata - skipping sync`);
            return;
        }

        // Expand product details if not already expanded
        let fullSubscription = subscription;
        if (subscription.items.data.length > 0) {
            const firstPrice = subscription.items.data[0].price;
            if (typeof firstPrice.product === "string") {
                // Need to expand product
                fullSubscription = await stripe.subscriptions.retrieve(subscription.id, {
                    expand: ["items.data.price.product"],
                });
            }
        }

        await syncUpdateSubscriptionToMongo(fullSubscription, userId);
        console.log(`✓ Synced subscription ${subscription.id} to MongoDB for user ${userId}`);
    } catch (error: any) {
        console.error(`Failed to sync subscription ${subscription.id}:`, error.message);
        throw error;
    }
}

/**
 * Handle customer.subscription.deleted event
 * Removes the subscription from MongoDB
 */
async function handleSubscriptionDeleted(stripe: Stripe, subscription: Stripe.Subscription) {
    console.log("Processing subscription deletion:", subscription.id);

    try {
        // Get userId from customer metadata
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        const customer = await stripe.customers.retrieve(customerId);

        if (customer.deleted) {
            console.error(`Customer ${customerId} was deleted`);
            return;
        }

        const userId = customer.metadata?.userId;

        if (!userId) {
            console.warn(`No userId in customer ${customerId} metadata - skipping sync`);
            return;
        }
        await deleteSubscriptionFromMongo(userId, subscription.id);
        console.log(`✓ Cancelled subscription ${subscription.id} from MongoDB`);
    } catch (error: any) {
        console.error(`Failed to delete subscription ${subscription.id}:`, error.message);
        throw error;
    }
}
