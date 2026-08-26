// AntiPaywallGate.tsx
import React, { useContext, useEffect } from "react";
import { useFetcher } from "react-router";
import type { SubscriptionLoaderData } from "../loader/subscriptionLoader.server";
import { PaywallContext } from "../provider/PaywallContext";
import { AuthContext } from "@/provider/AuthContext";
import { useConfig } from "@/provider";
import { Loader } from "@mantine/core";

interface AntiPaywallGateProps {
    children: React.ReactNode;
    productIndex: number[];
    loadingComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
    subscribedComponent?: React.ReactNode;
    subscribedContent?: React.ReactNode;
    hideWhenSubscribed?: boolean;
    requireAuth?: boolean;
}

export function AntiPaywallGate({ 
    children, 
    productIndex,
    loadingComponent,
    errorComponent,
    subscribedComponent,
    subscribedContent,
    hideWhenSubscribed = true,
    requireAuth = false
}: AntiPaywallGateProps) {
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
        if (userId && targetProductIds.length > 0) {
            subscriptionFetcher.load(
                `/api/subscription-check?productIds=${productIdsParam}&userId=${userId}`
            );
        }
    }, [productIdsParam, userId]);

    // 1. Wait for authentication to complete
    if (isAuthLoading) {
        return loadingComponent || <div>Loading...</div>;
    }

    // 2. Handle unauthenticated users
    if (!userId || !userContext.user) {
        if (requireAuth) {
            // Redirect to login if auth is required
            const returnUrl = encodeURIComponent(window.location.href);
            window.location.href = `${appConfig.viteAuthDomain}?redirectTo=${returnUrl}`;
            return loadingComponent || <div>Redirecting to login...</div>;
        }
        // Show children for non-authenticated users (they're not subscribed)
        return <>{children}</>;
    }

    // 3. Loading subscription state
    // Show loader if: actively loading OR we have user but no data yet (first render)
    const isCheckingSubscription = 
        subscriptionFetcher.state === "loading" || 
        (userId && targetProductIds.length > 0 && !subscriptionFetcher.data);
    
    if (isCheckingSubscription) {
        return loadingComponent || <Loader type="dots" size={"sm"}/>;
    }

    // 4. Error state  
    if (subscriptionFetcher.data?.error) {
        return errorComponent || <div>Something went wrong. Please try again later.</div>;
    }

    // 5. IS subscribed - hide or show alternative
    if (subscriptionFetcher.data?.isSubscribed) {
        // If subscribedContent is provided, show it
        if (subscribedContent) {
            return <>{subscribedContent}</>;
        }

        // Otherwise use subscribedComponent or hide based on hideWhenSubscribed
        if (hideWhenSubscribed) {
            return subscribedComponent || null;
        }
        return subscribedComponent || null;
    }

    // 6. NOT subscribed - show children
    return <>{children}</>;
}
