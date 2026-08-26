// PaywallGate.tsx
import React, { useContext, useEffect } from "react";
import { useFetcher } from "react-router";
import { PaywallModal } from "./PaywallModal";
import type { SubscriptionLoaderData } from "../loader/subscriptionLoader.server";
import { PaywallContext } from "../provider/PaywallContext";
import { AuthContext } from "@/provider/AuthContext";
import { useConfig } from "@/provider";

interface PaywallGateProps {
    children: React.ReactNode;
    productIndex: number[];
    loadingComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
    modalTitle?: string;
    modalDescription?: string;
}

export function PaywallGate({ 
    children, 
    productIndex,
    loadingComponent,
    errorComponent,
    modalTitle,
    modalDescription
}: PaywallGateProps) {
    const { productIds } = useContext(PaywallContext);
    const userContext = useContext(AuthContext);
    const appConfig = useConfig();
    
    const userId = userContext?.user?.id;
    const isAuthLoading = userContext?.loading;
    const subscriptionFetcher = useFetcher<SubscriptionLoaderData>();
    
    // Resolve indices to actual product IDs
    const targetProductIds = productIndex.map(i => productIds[i]).filter(Boolean);
    
    // Join with comma for URL
    const productIdsParam = targetProductIds.join(',');
    
    useEffect(() => {
        // Auto-fetch subscription on mount (only if authenticated)
        console.log("PaywallGate effect checking subscription status");
        if (userId && targetProductIds.length > 0) {
            console.log("PaywallGate fetching subscription status");
            subscriptionFetcher.load(
                `/api/subscription-check?productIds=${productIdsParam}&userId=${userId}`
            );
        }
    }, [productIdsParam, userId]);

    // 1. Wait for authentication to complete
    if (isAuthLoading) {
        return loadingComponent || <div>Authenticating...</div>;
    }

    // 2. Redirect to login if not authenticated
    if (!userId || !userContext.user) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${appConfig.viteAuthDomain}?redirectTo=${returnUrl}`;
        return loadingComponent || <div>Redirecting to login...</div>;
    }

    // 3. Loading subscription state
    if (subscriptionFetcher.state === "loading") {
        return loadingComponent || <div>Checking subscription...</div>;
    }

    // 4. Error state  
    if (subscriptionFetcher.data?.error) {
        return errorComponent || <div>Something went wrong. Please try again later.</div>;
    }

    // 5. Not subscribed - show paywall
    if (!subscriptionFetcher.data?.isSubscribed) {
        return <PaywallModal title={modalTitle} description={modalDescription} />;
    }

    // 6. Subscribed - show children
    return <>{children}</>;
}
