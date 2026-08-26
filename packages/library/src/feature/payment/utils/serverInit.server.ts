import { syncRecentCheckouts } from "./syncStripeMetadata.server";
import { syncRecentSubscriptions } from "./syncSubscription.server";
import { dbConnect } from "@/database/mongoose.server";

/**
 * Database initialization
 * Establishes MongoDB connection
 *
 * Used by: 3in1app, app, catherine
 */

let dbHasInitialized = false;

export async function initializeDB() {
    // Prevent multiple initializations (in development with hot reload)
    if (dbHasInitialized) {
        console.log("⏭️  Database already initialized, skipping...");
        return;
    }

    dbHasInitialized = true;

    console.log("\n" + "=".repeat(60));
    console.log("🗄️  DATABASE INITIALIZATION");
    console.log("=".repeat(60));
    const dbName = process.env.MONGO_DB_NAME!;

    // Establish MongoDB connection early
    try {
        console.log("🔌 Connecting to MongoDB...");
        await dbConnect(dbName);
        console.log("✅ MongoDB connection established");
    } catch (error: any) {
        console.error("❌ MongoDB connection failed:", error.message);
        // Don't throw - allow server to start even if DB connection fails
    }

    console.log("=".repeat(60) + "\n");
}

/**
 * Stripe initialization
 * Syncs Stripe data (customer metadata and subscriptions)
 *
 * Used by: 3in1app, app (not catherine)
 *
 * Configuration via environment variables:
 * - AUTO_SYNC_ON_STARTUP: "true" | "false" (default: "true")
 * - AUTO_SYNC_HOURS_BACK: number (default: 48)
 */

let stripeHasInitialized = false;

export async function initializeStripe() {
    // Prevent multiple initializations (in development with hot reload)
    if (stripeHasInitialized) {
        console.log("⏭️  Stripe already initialized, skipping...");
        return;
    }

    stripeHasInitialized = true;

    console.log("\n" + "=".repeat(60));
    console.log("💳 STRIPE INITIALIZATION");
    console.log("=".repeat(60));

    // Auto-sync Stripe metadata
    const autoSync = process.env.AUTO_SYNC_ON_STARTUP || true; // Default: true
    const hoursBack = parseInt(process.env.AUTO_SYNC_HOURS_BACK || "48");

    console.log(`⚙️  Auto-sync on startup: ${autoSync}`);
    console.log(`⏳ Syncing data from last ${hoursBack} hours`);

    if (autoSync) {
        // 1. Sync customer metadata
        console.log("\n🔄 Starting customer metadata reconciliation...");

        try {
            const customerResult = await syncRecentCheckouts(hoursBack, false);

            if (customerResult.success) {
                console.log("✅ Customer metadata sync completed");
                console.log(`   Checked: ${customerResult.customersChecked} customers`);
                console.log(`   Updated: ${customerResult.customersUpdated} customers`);
            } else {
                console.error("⚠️  Customer metadata sync completed with errors");
                console.error(`   Errors: ${customerResult.errors.length}`);
                customerResult.errors.forEach((err) => console.error(`   - ${err}`));
            }
        } catch (error: any) {
            console.error("❌ Customer metadata sync failed:", error.message);
            // Don't throw - allow server to start even if sync fails
        }

        // 2. Sync subscriptions
        console.log("\n🔄 Starting subscription reconciliation...");

        try {
            const subscriptionResult = await syncRecentSubscriptions(hoursBack, false);

            if (subscriptionResult.success) {
                console.log("✅ Subscription sync completed");
                console.log(`   Checked: ${subscriptionResult.subscriptionsChecked} subscriptions`);
                console.log(`   Created: ${subscriptionResult.subscriptionsCreated} subscriptions`);
                console.log(`   Updated: ${subscriptionResult.subscriptionsUpdated} subscriptions`);
                console.log(`   Skipped: ${subscriptionResult.subscriptionsSkipped} subscriptions`);
            } else {
                console.error("⚠️  Subscription sync completed with errors");
                console.error(`   Errors: ${subscriptionResult.errors.length}`);
                subscriptionResult.errors.forEach((err) => console.error(`   - ${err}`));
            }
        } catch (error: any) {
            console.error("❌ Subscription sync failed:", error.message);
            // Don't throw - allow server to start even if sync fails
        }
    } else {
        console.log("⏭️  Automatic Stripe sync disabled (AUTO_SYNC_ON_STARTUP=false)");
    }

    console.log("=".repeat(60) + "\n");
}

/**
 * Backward-compatible wrapper for full server initialization
 * Runs both database and Stripe initialization
 *
 * @deprecated Use initializeDB() and initializeStripe() separately for better control
 */
export async function initializeServer() {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 SERVER STARTUP INITIALIZATION");
    console.log("=".repeat(60) + "\n");

    await initializeDB();
    await initializeStripe();

    console.log("=".repeat(60));
    console.log("✅ SERVER INITIALIZATION COMPLETE");
    console.log("=".repeat(60) + "\n");
}

/**
 * Reset initialization flags (useful for testing)
 */
export function resetInitialization() {
    dbHasInitialized = false;
    stripeHasInitialized = false;
}
