import Stripe from "stripe";

export type SyncResult = {
    success: boolean;
    customersChecked: number;
    customersUpdated: number;
    errors: string[];
    details: Array<{
        customerId: string;
        clientReferenceId: string;
        action: 'updated' | 'skipped' | 'error';
        message?: string;
    }>;
};

/**
 * Manual reconciliation: sync customer metadata for recent checkouts
 * 
 * Use cases:
 * - Server was down and missed webhooks
 * - Webhook processing failed
 * - Initial setup with existing customers
 * - Data integrity check
 * 
 * This function:
 * 1. Fetches recent completed checkout sessions
 * 2. Checks if customer metadata has client_reference_id
 * 3. Updates missing metadata from checkout session
 * 
 * @param hoursBack - How many hours back to check (default: 24)
 * @param dryRun - If true, only reports what would be changed (default: false)
 * @returns Sync results with details
 */
export async function syncRecentCheckouts(
    hoursBack: number = 24,
    dryRun: boolean = false
): Promise<SyncResult> {
    const result: SyncResult = {
        success: true,
        customersChecked: 0,
        customersUpdated: 0,
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
        
        console.log(`\n🔄 Starting reconciliation (${dryRun ? 'DRY RUN' : 'LIVE MODE'})`);
        console.log(`📅 Checking sessions from last ${hoursBack} hours\n`);

        // Fetch recent completed checkout sessions
        const sessions = await stripe.checkout.sessions.list({
            created: { gte: sinceTimestamp },
            limit: 100,
            expand: ['data.customer'],
        });

        console.log(`📦 Found ${sessions.data.length} checkout sessions\n`);

        // Process each session
        for (const session of sessions.data) {
            // Skip if session is not complete or missing required data
            if (session.status !== 'complete') {
                continue;
            }

            if (!session.customer) {
                console.log(`⚠️  Session ${session.id} has no customer - skipping`);
                continue;
            }

            if (!session.client_reference_id) {
                console.log(`⚠️  Session ${session.id} has no client_reference_id - skipping`);
                continue;
            }

            const customerId = typeof session.customer === 'string' 
                ? session.customer 
                : session.customer.id;

            result.customersChecked++;

            try {
                // Fetch customer to check current metadata
                const customer = await stripe.customers.retrieve(customerId);

                if ('deleted' in customer && customer.deleted) {
                    result.details.push({
                        customerId,
                        clientReferenceId: session.client_reference_id,
                        action: 'skipped',
                        message: 'Customer is deleted',
                    });
                    continue;
                }

                // Check if metadata already has client_reference_id
                const currentMetadata = customer.metadata?.client_reference_id;

                if (currentMetadata === session.client_reference_id) {
                    // Already synced
                    result.details.push({
                        customerId,
                        clientReferenceId: session.client_reference_id,
                        action: 'skipped',
                        message: 'Already synced',
                    });
                    console.log(`✓ Customer ${customerId} already has correct metadata`);
                    continue;
                }

                // Need to update
                if (dryRun) {
                    result.details.push({
                        customerId,
                        clientReferenceId: session.client_reference_id,
                        action: 'updated',
                        message: `Would update: ${currentMetadata || '(none)'} → ${session.client_reference_id}`,
                    });
                    console.log(`🔍 [DRY RUN] Would update customer ${customerId}`);
                    console.log(`   From: ${currentMetadata || '(none)'}`);
                    console.log(`   To:   ${session.client_reference_id}\n`);
                } else {
                    // Actually update the customer
                    await stripe.customers.update(customerId, {
                        metadata: {
                            client_reference_id: session.client_reference_id,
                        },
                    });

                    result.customersUpdated++;
                    result.details.push({
                        customerId,
                        clientReferenceId: session.client_reference_id,
                        action: 'updated',
                        message: 'Successfully updated',
                    });
                    console.log(`✅ Updated customer ${customerId} with client_reference_id: ${session.client_reference_id}\n`);
                }
            } catch (error: any) {
                const errorMsg = `Failed to process customer ${customerId}: ${error.message}`;
                result.errors.push(errorMsg);
                result.details.push({
                    customerId,
                    clientReferenceId: session.client_reference_id,
                    action: 'error',
                    message: error.message,
                });
                console.error(`❌ ${errorMsg}\n`);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 RECONCILIATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Mode:              ${dryRun ? '🔍 DRY RUN' : '🔴 LIVE'}`);
        console.log(`Customers checked: ${result.customersChecked}`);
        console.log(`Customers updated: ${result.customersUpdated}`);
        console.log(`Errors:            ${result.errors.length}`);
        console.log('='.repeat(60) + '\n');

        if (result.errors.length > 0) {
            result.success = false;
        }

        return result;

    } catch (error: any) {
        console.error('❌ Reconciliation failed:', error.message);
        result.success = false;
        result.errors.push(error.message);
        return result;
    }
}

/**
 * Sync a specific customer's metadata from their most recent checkout
 * Useful when you know a specific customer needs reconciliation
 * 
 * @param customerId - The Stripe customer ID
 * @returns Sync result for this customer
 */
export async function syncSingleCustomer(customerId: string): Promise<SyncResult> {
    const result: SyncResult = {
        success: true,
        customersChecked: 1,
        customersUpdated: 0,
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

        // Get customer's most recent checkout session
        const sessions = await stripe.checkout.sessions.list({
            customer: customerId,
            limit: 1,
        });

        if (sessions.data.length === 0 || !sessions.data[0].client_reference_id) {
            throw new Error('No checkout session with client_reference_id found for this customer');
        }

        const session = sessions.data[0];
        const clientReferenceId = session.client_reference_id!;

        // Update customer metadata
        await stripe.customers.update(customerId, {
            metadata: {
                client_reference_id: clientReferenceId,
            },
        });

        result.customersUpdated = 1;
        result.details.push({
            customerId,
            clientReferenceId,
            action: 'updated',
            message: 'Successfully synced from most recent checkout',
        });

        console.log(`✅ Synced customer ${customerId} with client_reference_id: ${clientReferenceId}`);

        return result;

    } catch (error: any) {
        console.error(`❌ Failed to sync customer ${customerId}:`, error.message);
        result.success = false;
        result.errors.push(error.message);
        result.details.push({
            customerId,
            clientReferenceId: '',
            action: 'error',
            message: error.message,
        });
        return result;
    }
}