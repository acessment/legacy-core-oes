import type { LoaderFunctionArgs } from "react-router";
import { subscriptionLoader } from "./subscriptionLoader.server";

/**
 * Reusable subscription check loader for PaywallGate
 * 
 * This loader enables the all-in-one PaywallGate component to work
 * without requiring individual page loaders to handle subscription checking.
 * 
 * Consumer usage:
 * ```tsx
 * // In consumer app - routes/subscription-check.tsx
 * import { subscriptionCheckLoader } from "@acessment/core-oes/server";
 * 
 * export const loader = subscriptionCheckLoader;
 * ```
 * 
 * Then PaywallGate works anywhere:
 * ```tsx
 * import { PaywallGate } from "@acessment/core-oes";
 * 
 * function MyComponent() {
 *   return (
 *     <PaywallGate>
 *       <ProtectedContent />
 *     </PaywallGate>
 *   );
 * }
 * ```
 */
export const subscriptionCheckLoader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const productIdsParam = url.searchParams.get('productIds') || '';
    const productIds = productIdsParam.split(',').filter(Boolean);
    
    return await subscriptionLoader({ request }, productIds);
};