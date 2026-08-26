import type { LoaderFunctionArgs } from "react-router";
import Stripe from "stripe";
import { getActiveSubscriptionsFromMongo } from "../utils/syncSubscription.server";
import { dbConnect } from "@/database/mongoose.server";

export type SubscriptionLoaderData = {
    isSubscribed: boolean;
    userId: string | null;
    productIds: string[];
    error: string | null;
};

/**
 * Server-side loader to check user subscription status via Stripe API
 *
 * Usage in routes:
 * ```ts
 * import { subscriptionLoader } from "@acessment/core-oes/server";
 *
 * export const loader = async (args: LoaderFunctionArgs) => {
 *   const subscriptionData = await subscriptionLoader(args, ["prod_abc", "prod_def"]);
 *   return { ...otherData, subscription: subscriptionData };
 * };
 * ```
 *
 * @param args - React Router loader function arguments
 * @param productIds - Array of Stripe product IDs to check (e.g., ["prod_abc123", "prod_def456"])
 * @returns Subscription status data
 */
export async function subscriptionLoader(
    { request }: LoaderFunctionArgs,
    productIds: string[] = []
): Promise<SubscriptionLoaderData> {
    try {
        // Extract userId from URL query parameters
        const url = new URL(request.url);
        const userId = url.searchParams.get("userId");

        console.log("subscriptionLoader userId:", userId);
        console.log("subscriptionLoader productIds:", productIds);

        if (!userId) {
            return {
                isSubscribed: false,
                userId: null,
                productIds,
                error: null,
            };
        }

        // Check subscription status via Stripe
        const isSubscribed = await checkUserSubscription(userId, productIds);

        return {
            isSubscribed,
            userId,
            productIds,
            error: null,
        };
    } catch (error) {
        console.error("Subscription loader error:", error);
        return {
            isSubscribed: false,
            userId: null,
            productIds,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Check if a user has an active subscription for any of the specified products
 * First checks MongoDB cache for fast response, then falls back to Stripe API
 *
 * @param userId - The user ID stored in customer metadata
 * @param productIds - Array of Stripe product IDs to check (e.g., ['prod_xxxxx', 'prod_yyyyy'])
 * @returns True if user has active subscription with any of the products
 */
async function checkUserSubscription(userId: string, productIds: string[]): Promise<boolean> {
    try {
        // Connect to MongoDB (cached, only connects once)
        await dbConnect("inst-acessment");

        // FAST PATH: Check MongoDB first with productId filtering at database level
        console.log(`[MongoDB] Checking subscriptions for userId: ${userId}`);
        const mongoSubscriptions = await getActiveSubscriptionsFromMongo(userId, productIds);

        console.log(`[MongoDB] Retrieved ${mongoSubscriptions.length} matching subscriptions`);

        if (mongoSubscriptions.length > 0) {
            // MongoDB already filtered by both status AND productIds
            console.log(`✓ [MongoDB] Found ${mongoSubscriptions.length} active subscription(s) with target products`);
            console.log(
                `[MongoDB] Subscriptions:`,
                mongoSubscriptions.map((s) => ({
                    id: s.subscriptionId,
                    status: s.status,
                    products: s.productIds,
                }))
            );
            return true;
        }

        console.log(`[MongoDB] No active subscriptions found matching target products`);

        // // FALLBACK: Query Stripe API as authoritative source
        // console.log(`[Stripe] Falling back to Stripe API for userId: ${userId}`);
        // const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

        // if (!stripeSecretKey) {
        //     console.error("STRIPE_SECRET_KEY environment variable is not set");
        //     return false;
        // }

        // const stripe = new Stripe(stripeSecretKey, {
        //     apiVersion: "2025-12-15.clover",
        // });

        // const customers = await stripe.customers.search({
        //     query: `metadata['userId']:'${userId}'`,
        //     limit: 1,
        // });

        // if (customers.data.length === 0) {
        //     console.log(`[Stripe] No Stripe customer found for userId: ${userId}`);
        //     return false;
        // }

        // const customer = customers.data[0];
        // console.log("[Stripe] Found Stripe customer:", customer.id);

        // // Get all subscriptions for this customer
        // const subscriptions = await stripe.subscriptions.list({
        //     customer: customer.id,
        //     status: "all",
        //     limit: 100,
        //     expand: ["data.items.data.price"], // Only expand to price level (3 levels)
        // });

        // console.log("[Stripe] Subscriptions retrieved:", subscriptions.data.length);

        // Check if any subscription has an active/trialing status AND contains one of the target products
        // const hasActiveSubscription = subscriptions.data.some((sub) => {
        //     // Only check active or trialing subscriptions
        //     if (sub.status !== "active" && sub.status !== "trialing") {
        //         return false;
        //     }

        //     // Check if any subscription item contains one of our target product IDs
        //     return sub.items.data.some((item) => {
        //         const product = item.price.product;
        //         const productId = typeof product === "string" ? product : product.id;

        //         const hasProduct = productIds.includes(productId);

        //         if (hasProduct) {
        //             console.log(`✓ [Stripe] Found matching product: ${productId} in subscription ${sub.id}`);
        //         }

        //         return hasProduct;
        //     });
        // });

        // console.log(`[Stripe] User ${userId} has active subscription with target products: ${hasActiveSubscription}`);
        // console.log(`[Stripe] Checked product IDs: ${productIds.join(", ")}`);
        return false;
    } catch (error) {
        console.error("Error checking subscription with Stripe:", error);
        return false;
    }
}
