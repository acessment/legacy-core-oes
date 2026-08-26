import React, { useCallback, useContext, useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { PaywallModal } from "./PaywallModal";
import type { SubscriptionLoaderData } from "../loader/subscriptionLoader.server";
import { AuthContext } from "@/provider/AuthContext";
import { PaywallContext } from "../provider/PaywallContext";
import { useConfig } from "@/provider";

interface WithPaywallOptions {
    onUnauthorized?: () => void;
    modalTitle?: string;
    modalDescription?: string;
}

export interface PaywallProps {
    productIndex?: number[];
}

// Helper type to add PaywallProps to any component type
type WithPaywallComponent<C> = C extends React.ComponentType<infer P>
    ? React.ComponentType<P & PaywallProps>
    : C;

export function withPaywall<C extends React.ComponentType<any>>(
    Wrapped: C,
    options: WithPaywallOptions = {}
): WithPaywallComponent<C> {
    const WrappedAny = Wrapped as any;

    function PaywallWrapped(props: any) {
        const { onUnauthorized, modalTitle, modalDescription } = options;
        const { productIndex, ...restProps } = props;
        const [showModal, setShowModal] = useState(false);
        const fetcher = useFetcher<SubscriptionLoaderData>();
        const busy = fetcher.state !== "idle";
        const userContext = useContext(AuthContext);
        const userId = userContext?.user?.id;
        const isAuthLoading = userContext?.loading;
        const { productIds } = useContext(PaywallContext);
        const appConfig = useConfig();
        
        // Resolve indices to actual product IDs
        const targetProductIds = (productIndex || []).map((i: number) => productIds[i]).filter(Boolean);
        const productIdsParam = targetProductIds.join(',');

        useEffect(() => {
            console.log("✅ withPaywall effect running", { isAuthLoading, userId, productIdsParam });
            
            // Wait for auth to complete AND user to be loaded, then fetch subscription
            if (!isAuthLoading && userId && targetProductIds.length > 0 && !fetcher.data) {
                console.log("🔄 withPaywall fetching subscription status");
                fetcher.load(`/api/subscription-check?productIds=${productIdsParam}&userId=${userId}`);
            } else {
                console.log("❌ withPaywall effect skipped:", {
                    isAuthLoading,
                    hasUserId: !!userId,
                    productCount: targetProductIds.length,
                    hasData: !!fetcher.data
                });
            }
            // Re-run when auth loads, userId changes, or products change
        }, [isAuthLoading, userId, productIdsParam]);

        const handleClick = (e: any) => {
            console.log("withPaywall handleClick triggered");
            
            // 1. If auth is still loading, ignore
            if (isAuthLoading) {
                console.log("🔄 withPaywall auth loading, ignoring click");
                return;
            }

            // 2. If not authenticated, redirect to login
            if (!userId || !userContext.user) {
                console.log("🔒 withPaywall user not authenticated, redirecting");
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `${appConfig.viteAuthDomain}?redirectTo=${returnUrl}`;
                return;
            }

            // 3. If busy with subscription check, ignore
            if (busy) {
                console.log("withPaywall is busy, ignoring click");
                return;
            }

            // 4. If no subscription data yet, fetch it
            if (!fetcher.data && targetProductIds.length > 0) {
                console.log("withPaywall fetching subscription status");
                fetcher.load(`/api/subscription-check?productIds=${productIdsParam}&userId=${userId}`);
                return;
            }

            // 5. If subscribed, call the original onClick
            if (fetcher.data?.isSubscribed) {
                console.log("✅ withPaywall user is subscribed, calling onClick");
                (restProps as any).onClick?.(e);
            } 
            // 6. If not subscribed, show paywall
            else {
                console.log("❌ withPaywall user not subscribed, showing paywall");
                onUnauthorized ? onUnauthorized() : setShowModal(true);
            }
        };

        return (
            <>
                <WrappedAny
                    {...restProps}
                    onClick={handleClick}
                    // only set loading if the component supports it; Mantine Button/ActionIcon do
                    loading={busy || isAuthLoading || restProps.loading}
                />
                {showModal && <PaywallModal onClose={() => setShowModal(false)} title={modalTitle} description={modalDescription} />}
            </>
        );
    }

    // Return as WithPaywallComponent to include PaywallProps in the type
    return PaywallWrapped as any as WithPaywallComponent<C>;
}
