import Stripe from "stripe";
import User, { ISubscription, IUser } from "@/models/User";
import { PaymentStatusEnum } from "@/enum/PaymentStatus.enum";

export type SubscriptionSyncResult = {
    success: boolean;
    subscriptionsChecked: number;
    subscriptionsCreated: number;
    subscriptionsUpdated: number;
    subscriptionsSkipped: number;
    errors: string[];
    details: Array<{
        subscriptionId: string;
        userId: string;
        action: 'created' | 'updated' | 'skipped' | 'error';
        message?: string;
    }>;
};

/**
 * Creates a new subscription in MongoDB User model
 * This adds a new subscription to the user's subscriptions array
 *
 * @param sessionId - The Stripe checkout session ID (optional, uses subscription.id as fallback)
 * @param subscription - The Stripe subscription object
 * @param userId - The user ID to associate with the subscription
 * @returns The updated user document with the new subscription
 */
export async function syncCreateSubscriptionToMongo(
    sessionId: string | null,
    subscription: Stripe.Subscription,
    userId: string
): Promise<any> {
    try {
        // Extract product IDs from subscription items
        const productIds: string[] = [];

        for (const item of subscription.items.data) {
            const price = item.price;

            // Handle both expanded and non-expanded price.product
            // Stripe may return product as string (ID) or full object
            if (typeof price.product === "string") {
                productIds.push(price.product);
            } else if (price.product && typeof price.product === "object") {
                productIds.push(price.product.id);
            }
        }

        // Build subscription data object matching ISubscription interface
        const subscriptionData: ISubscription = {
            sessionId: sessionId || subscription.id, // Use subscription.id as fallback during reconciliation
            subscriptionId: subscription.id,
            productIds: productIds,
            // Handle both string and object customer types from Stripe
            customerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
            status: subscription.status as PaymentStatusEnum,
            // Convert Unix timestamps (seconds) to JavaScript Date objects (milliseconds)
            // Period dates are on the first subscription item
            currentPeriodStart: subscription.items.data[0]?.current_period_start ? new Date(subscription.items.data[0].current_period_start * 1000) : null,
            currentPeriodEnd: subscription.items.data[0]?.current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000) : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            createdAt: new Date(subscription.created * 1000),
            updatedAt: new Date(),
        };

        // Upsert logic: If subscription with same subscriptionId exists, replace it; otherwise push new
        // Step 1: Try to update existing subscription using positional operator
        const updateResult = await User.findOneAndUpdate(
            {
                _id: userId,
                "subscriptions.subscriptionId": subscription.id, // Match user with this subscription
            },
            {
                $set: {
                    "subscriptions.$": subscriptionData, // Replace matched subscription with new data
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        // Step 2: If no existing subscription found, push new one
        if (!updateResult) {
            const pushResult = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        subscriptions: {
                            $each: [subscriptionData],
                            $position: 0, // Add to beginning of array
                        },
                    },
                },
                {
                    new: true,
                    runValidators: true,
                    upsert: false, // Don't create user if not found
                }
            );

            if (!pushResult) {
                throw new Error(`User ${userId} not found`);
            }

            console.log(`Created new subscription ${subscription.id} for User ${userId}`);
            return pushResult;
        }

        console.log(`Updated existing subscription ${subscription.id} for User ${userId}`);
        return updateResult;
    } catch (error) {
        console.error("Error syncing subscription to MongoDB:", error);
        throw error;
    }
}

/**
 * Updates an existing subscription in User model
 * Uses MongoDB positional operator ($) for atomic array element updates
 * This is more efficient than fetching the document, modifying, and saving
 *
 * @param subscription - The updated Stripe subscription object
 * @param userId - The user ID who owns the subscription
 * @returns The updated user document
 */
export async function syncUpdateSubscriptionToMongo(subscription: Stripe.Subscription, userId: string): Promise<any> {
    try {
        // Use findOneAndUpdate with positional operator ($) for atomic update
        // Query filter: Find user by ID AND find the subscription in the array
        // The $ operator represents the matched array element position

        // Extract product IDs from subscription items
        const productIds: string[] = [];
        for (const item of subscription.items.data) {
            const price = item.price;
            // Handle both expanded and non-expanded price.product
            if (typeof price.product === "string") {
                productIds.push(price.product);
            } else if (price.product && typeof price.product === "object") {
                productIds.push(price.product.id);
            }
        }

        const currentPeriodStart = subscription.items.data[0]?.current_period_start;
        const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
        
        console.log("Updating subscription in MongoDB:", { 
            userId, 
            subscriptionId: subscription.id, 
            productIds,
            currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null 
        });
        const result = await User.findOneAndUpdate(
            {
                _id: userId,
                "subscriptions.subscriptionId": subscription.id, // Find the matching subscription
            },
            {
                $set: {
                    // Update only the matched array element using $ positional operator
                    "subscriptions.$.productIds": productIds,
                    "subscriptions.$.status": subscription.status as PaymentStatusEnum,
                    "subscriptions.$.currentPeriodStart": currentPeriodStart
                        ? new Date(currentPeriodStart * 1000)
                        : null,
                    "subscriptions.$.currentPeriodEnd": currentPeriodEnd
                        ? new Date(currentPeriodEnd * 1000)
                        : null,
                    "subscriptions.$.cancelAtPeriodEnd": subscription.cancel_at_period_end,
                    "subscriptions.$.canceledAt": subscription.canceled_at
                        ? new Date(subscription.canceled_at * 1000)
                        : null,
                    "subscriptions.$.updatedAt": new Date(),
                },
            },
            {
                new: true, // Return the updated document
                runValidators: true, // Validate the updated fields
            }
        );
        
        if (!result) {
            throw new Error(`User ${userId} or subscription ${subscription.id} not found`);
        }

        console.log(`Updated subscription ${subscription.id} for User ${userId}`);
        return result;
    } catch (error) {
        console.error("Error updating subscription in MongoDB:", error);
        throw error;
    }
}

/**
 * Marks a subscription as cancelled in User model
 * Updates the specific subscription in the subscriptions array using positional operator
 *
 * @param userId - The user ID who owns the subscription
 * @param subscriptionId - The Stripe subscription ID to mark as cancelled
 */
export async function deleteSubscriptionFromMongo(userId: string, subscriptionId: string): Promise<void> {
    try {
        // Use positional $ operator to update only the matched subscription
        const result = await User.findOneAndUpdate(
            {
                _id: userId,
                "subscriptions.subscriptionId": subscriptionId, // Find the matching subscription
            },
            {
                $set: {
                    "subscriptions.$.status": PaymentStatusEnum.CANCELED,
                    "subscriptions.$.canceledAt": new Date(),
                    "subscriptions.$.updatedAt": new Date(),
                },
            },
            { new: true }
        );

        if (!result) {
            throw new Error(`User ${userId} or subscription ${subscriptionId} not found`);
        }

        console.log(`Marked subscription ${subscriptionId} as cancelled for user ${userId}`);
    } catch (error) {
        console.error("Error deleting subscription from MongoDB:", error);
        throw error;
    }
}

/**
 * Gets active subscriptions for a user from MongoDB
 * Queries for subscriptions matching both status and productIds (if provided)
 * Uses MongoDB $elemMatch to filter at database level for efficiency
 * 
 * @param userId - The user ID
 * @param productIds - Optional array of product IDs to filter by
 * @param statuses - Subscription statuses to filter by (defaults to active/trialing/wts_paid)
 * @returns Array of matching subscriptions (empty array if none found)
 */
export async function getActiveSubscriptionsFromMongo(
    userId: string,
    productIds?: string[],
    statuses: PaymentStatusEnum[] = [
        PaymentStatusEnum.ACTIVE,
        PaymentStatusEnum.TRIALING,
        PaymentStatusEnum.WTS_PAID
    ]
): Promise<ISubscription[]> {
    try {
        // Build MongoDB query with $elemMatch to filter subscriptions at database level
        const query: any = {
            _id: userId,
            subscriptions: {
                $elemMatch: {
                    status: { $in: statuses },
                    // Add productIds filter only if provided
                    ...(productIds && productIds.length > 0 && {
                        productIds: { $in: productIds }
                    })
                }
            }
        };

        const user = await User.findOne(query).exec();
        
        if (!user || !user.subscriptions) {
            return [];
        }

        // Filter subscriptions in JS to return only matching ones
        // (MongoDB $elemMatch only checks if at least one matches, doesn't filter the array)
        return user.subscriptions.filter((sub: ISubscription) => {
            const statusMatches = statuses.includes(sub.status);
            const productMatches = !productIds || productIds.length === 0 || 
                sub.productIds.some(pid => productIds.includes(pid));
            return statusMatches && productMatches;
        });
        
    } catch (error) {
        console.error("Error fetching subscription from MongoDB:", error);
        throw error;
    }
}

/**
 * Reconciliation: Sync recent Stripe subscriptions to MongoDB
 * Used on server startup to catch missed webhook events
 * 
 * Use cases:
 * - Server was down and missed subscription webhooks
 * - Webhook processing failed
 * - Data integrity check after deployment
 * 
 * This function:
 * 1. Fetches recent Stripe subscriptions (created/updated in last X hours)
 * 2. Checks if each subscription exists in MongoDB
 * 3. Creates or updates subscriptions as needed
 * 
 * @param hoursBack - How many hours back to check (default: 48)
 * @param dryRun - If true, only reports what would be changed (default: false)
 * @returns Sync results with details
 */
export async function syncRecentSubscriptions(
    hoursBack: number = 48,
    dryRun: boolean = false
): Promise<SubscriptionSyncResult> {
    const result: SubscriptionSyncResult = {
        success: true,
        subscriptionsChecked: 0,
        subscriptionsCreated: 0,
        subscriptionsUpdated: 0,
        subscriptionsSkipped: 0,
        errors: [],
        details: [],
    };

    try {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY environment variable is not set');
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-12-15.clover',
        });

        // Calculate timestamp for filtering
        const sinceTimestamp = Math.floor(Date.now() / 1000) - (hoursBack * 3600);
        
        console.log(`\n🔄 Starting subscription reconciliation (${dryRun ? 'DRY RUN' : 'LIVE MODE'})`);
        console.log(`📅 Checking subscriptions from last ${hoursBack} hours\n`);

        // Fetch recent subscriptions from Stripe
        // Note: Don't expand product here (4-level limit), fetch it separately when needed
        const subscriptions = await stripe.subscriptions.list({
            created: { gte: sinceTimestamp },
            limit: 100,
            expand: ['data.customer'],
        });

        console.log(`📦 Found ${subscriptions.data.length} Stripe subscriptions\n`);

        // Process each subscription
        for (const subscription of subscriptions.data) {
            result.subscriptionsChecked++;

            try {
                // Get customer and extract userId
                const customer = typeof subscription.customer === 'string'
                    ? await stripe.customers.retrieve(subscription.customer)
                    : subscription.customer;

                if ('deleted' in customer && customer.deleted) {
                    result.details.push({
                        subscriptionId: subscription.id,
                        userId: 'unknown',
                        action: 'skipped',
                        message: 'Customer is deleted',
                    });
                    result.subscriptionsSkipped++;
                    console.log(`⚠️  Subscription ${subscription.id} - customer deleted, skipping`);
                    continue;
                }

                const userId = customer.metadata?.userId;

                if (!userId) {
                    result.details.push({
                        subscriptionId: subscription.id,
                        userId: 'unknown',
                        action: 'skipped',
                        message: 'No userId in customer metadata',
                    });
                    result.subscriptionsSkipped++;
                    console.log(`⚠️  Subscription ${subscription.id} - no userId in metadata, skipping`);
                    continue;
                }

                // Check if subscription exists in MongoDB
                const user = await User.findOne({
                    _id: userId,
                    'subscriptions.subscriptionId': subscription.id,
                }).exec();

                if (!user) {
                    // Subscription doesn't exist in MongoDB - CREATE
                    if (dryRun) {
                        result.details.push({
                            subscriptionId: subscription.id,
                            userId,
                            action: 'created',
                            message: `Would create subscription for user ${userId}`,
                        });
                        result.subscriptionsCreated++;
                        console.log(`🔍 [DRY RUN] Would create subscription ${subscription.id} for user ${userId}`);
                    } else {
                        // Fetch full subscription with expanded product details
                        const fullSubscription = await stripe.subscriptions.retrieve(subscription.id, {
                            expand: ['items.data.price.product'],
                        });
                        
                        await syncCreateSubscriptionToMongo(null, fullSubscription, userId);
                        result.subscriptionsCreated++;
                        result.details.push({
                            subscriptionId: subscription.id,
                            userId,
                            action: 'created',
                            message: 'Successfully created',
                        });
                        console.log(`✅ Created subscription ${subscription.id} for user ${userId}`);
                    }
                } else {
                    // Subscription exists - check if needs UPDATE
                    const existingSub = user.subscriptions?.find(
                        (sub: ISubscription) => sub.subscriptionId === subscription.id
                    );

                    if (!existingSub) {
                        result.subscriptionsSkipped++;
                        result.details.push({
                            subscriptionId: subscription.id,
                            userId,
                            action: 'skipped',
                            message: 'Subscription exists but not found in array (race condition?)',
                        });
                        continue;
                    }

                    // Check if status or dates are different
                    const needsUpdate =
                        existingSub.status !== subscription.status ||
                        existingSub.cancelAtPeriodEnd !== subscription.cancel_at_period_end ||
                        (subscription.canceled_at && 
                         (!existingSub.canceledAt || 
                          existingSub.canceledAt.getTime() !== subscription.canceled_at * 1000));

                    if (needsUpdate) {
                        if (dryRun) {
                            result.details.push({
                                subscriptionId: subscription.id,
                                userId,
                                action: 'updated',
                                message: `Would update: status=${subscription.status}`,
                            });
                            result.subscriptionsUpdated++;
                            console.log(`🔍 [DRY RUN] Would update subscription ${subscription.id} for user ${userId}`);
                        } else {
                            // Fetch full subscription with expanded product details for update
                            const fullSubscription = await stripe.subscriptions.retrieve(subscription.id, {
                                expand: ['items.data.price.product'],
                            });
                            
                            await syncUpdateSubscriptionToMongo(fullSubscription, userId);
                            result.subscriptionsUpdated++;
                            result.details.push({
                                subscriptionId: subscription.id,
                                userId,
                                action: 'updated',
                                message: 'Successfully updated',
                            });
                            console.log(`✅ Updated subscription ${subscription.id} for user ${userId}`);
                        }
                    } else {
                        result.subscriptionsSkipped++;
                        result.details.push({
                            subscriptionId: subscription.id,
                            userId,
                            action: 'skipped',
                            message: 'Already synced and up-to-date',
                        });
                        console.log(`✓ Subscription ${subscription.id} already synced`);
                    }
                }
            } catch (error: any) {
                const errorMsg = `Failed to process subscription ${subscription.id}: ${error.message}`;
                result.errors.push(errorMsg);
                result.details.push({
                    subscriptionId: subscription.id,
                    userId: 'unknown',
                    action: 'error',
                    message: error.message,
                });
                console.error(`❌ ${errorMsg}\n`);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 SUBSCRIPTION RECONCILIATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Mode:              ${dryRun ? '🔍 DRY RUN' : '🔴 LIVE'}`);
        console.log(`Subscriptions checked: ${result.subscriptionsChecked}`);
        console.log(`Subscriptions created: ${result.subscriptionsCreated}`);
        console.log(`Subscriptions updated: ${result.subscriptionsUpdated}`);
        console.log(`Subscriptions skipped: ${result.subscriptionsSkipped}`);
        console.log(`Errors:                ${result.errors.length}`);
        console.log('='.repeat(60) + '\n');

        if (result.errors.length > 0) {
            result.success = false;
        }

        return result;

    } catch (error: any) {
        console.error('❌ Subscription reconciliation failed:', error.message);
        result.success = false;
        result.errors.push(error.message);
        return result;
    }
}
