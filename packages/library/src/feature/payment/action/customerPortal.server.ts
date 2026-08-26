import Stripe from 'stripe';
import type { ActionFunctionArgs } from 'react-router';
import { requireAuth } from '@/auth/auth.server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Action to create Stripe customer portal session
 * POST to this action to redirect user to their billing portal
 */
export async function createCustomerPortalAction({ request }: ActionFunctionArgs) {
    const apiDomain = process.env.VITE_REACT_BASE_URL || "http://localhost:8080";
    const authDomain = process.env.VITE_AUTH_DOMAIN || "http://localhost:5173";

    console.log(process.env.VITE_AUTH_DOMAIN);
    
    console.log("🏪 [Customer Portal] Creating portal session...");
    
    // Require authentication
    const authResult = await requireAuth(request, apiDomain, authDomain);
    if (authResult instanceof Response) {
        console.warn("⚠️ [Customer Portal] Not authenticated");
        return authResult;
    }
    
    const user = authResult;
    console.log("✅ [Customer Portal] User authenticated:", { userId: user.id });
    
    try {
        // Search for existing customer by userId in metadata
        const customers = await stripe.customers.search({
            query: `metadata['userId']:'${user.id}'`,
            limit: 1,
        });
        
        let customerId: string;
        
        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            console.log("✅ [Customer Portal] Found existing customer:", customerId);
        } else {
            // Create new customer with userId in metadata
            const customer = await stripe.customers.create({
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            console.log("✅ [Customer Portal] Created new customer:", customerId);
        }
        
        // Create customer portal session
        // Use the referer header as return URL, fallback to settings page
        const referer = request.headers.get('referer')
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: referer,
        });
        
        console.log("✅ [Customer Portal] Portal session created successfully");
        
        return Response.json({ 
            success: true,
            portalUrl: portalSession.url 
        });
        
    } catch (error) {
        console.error("❌ [Customer Portal] Error:", error);
        return Response.json(
            { 
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create portal session' 
            }, 
            { status: 500 }
        );
    }
}