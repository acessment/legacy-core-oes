import Stripe from 'stripe';
import type { ActionFunctionArgs } from 'react-router';
import { requireAuth } from '@/auth/auth.server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Action to create Stripe customer session
 * POST to this action to get a client secret for the pricing table
 */
export async function createCustomerSessionAction({ request }: ActionFunctionArgs) {
    const apiDomain = process.env.VITE_REACT_BASE_URL || "http://localhost:8080";
    const authDomain = process.env.VITE_AUTH_DOMAIN || "http://localhost:5173";
    
    console.log("💳 [Customer Session] Creating session...");
    
    // Require authentication
    const authResult = await requireAuth(request, apiDomain, authDomain);
    if (authResult instanceof Response) {
        console.warn("⚠️ [Customer Session] Not authenticated");
        return authResult;
    }
    
    const user = authResult;
    console.log("✅ [Customer Session] User authenticated:", { userId: user.id });
    
    try {
        // Search for existing customer by userId in metadata
        const customers = await stripe.customers.search({
            query: `metadata['userId']:'${user.id}'`,
            limit: 1,
        });
        
        let customerId: string;
        
        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            console.log("✅ [Customer Session] Found existing customer:", customerId);
        } else {
            // Create new customer with userId in metadata
            const customer = await stripe.customers.create({
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            console.log("✅ [Customer Session] Created new customer:", customerId);
        }
        
        // Create customer session for pricing table
        const session = await stripe.customerSessions.create({
            customer: customerId,
            components: {
                pricing_table: { enabled: true },
            },
        });
        
        console.log("✅ [Customer Session] Session created successfully");
        
        return { clientSecret: session.client_secret };
    } catch (error) {
        console.error("❌ [Customer Session] Error:", error);
        return Response.json(
            { error: error instanceof Error ? error.message : 'Failed to create session' }, 
            { status: 500 }
        );
    }
}
