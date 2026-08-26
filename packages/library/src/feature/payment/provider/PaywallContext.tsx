import React, { createContext, useContext } from 'react';

/**
 * PaywallContext provides a centralized list of Stripe product IDs
 * for the entire application. Components can reference products by index
 * instead of hardcoding product IDs everywhere.
 * 
 * Usage:
 * ```tsx
 * // In root.tsx or App.tsx
 * <PaywallProvider productIds={[
 *     "prod_abc123",  // index 0
 *     "prod_def456",  // index 1
 *     "prod_ghi789",  // index 2
 * ]}>
 *     <App />
 * </PaywallProvider>
 * 
 * // In any component
 * <PaywallGate productIndex={[0, 2]}>
 *     <PremiumContent />
 * </PaywallGate>
 * ```
 */

interface PaywallContextValue {
    productIds: string[];
}

const PaywallContext = createContext<PaywallContextValue>({
    productIds: [],
});

interface PaywallProviderProps {
    children: React.ReactNode;
    productIds: string[];
}

export function PaywallProvider({ children, productIds }: PaywallProviderProps) {
    return (
        <PaywallContext.Provider value={{ productIds }}>
            {children}
        </PaywallContext.Provider>
    );
}

export function usePaywallContext() {
    const context = useContext(PaywallContext);
    if (!context) {
        throw new Error('usePaywallContext must be used within PaywallProvider');
    }
    return context;
}

export { PaywallContext };
