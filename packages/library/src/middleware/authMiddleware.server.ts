/**
 * Base React Router v7 middleware for Firebase authentication
 * Checks firebase session before allowing access to protected routes
 */

import { createContext, redirect } from "react-router";
import { verifySession } from "@/auth/auth.server";
import type { ICurrentUser } from "@/provider/types";

/**
 * Context to store authenticated user
 * Use context.get(authenticatedUserContext) in your loaders/actions to access the user
 */
export const authenticatedUserContext = createContext<ICurrentUser>();

/**
 * Base authentication middleware
 * Validates session cookie and stores authenticated user in context
 *
 * @example
 * // In your route file:
 * import { authMiddleware } from "@acessment/core-oes/server";
 *
 * export const middleware = [authMiddleware];
 */
export const authMiddleware = async ({ request, context }: { request: Request; context: any }) => {
    console.log("🔐 [authMiddleware] Checking Firebase authentication...");
    console.log(`🔐 [authMiddleware] Method: ${request.method}, URL: ${request.url}`);

    const url = new URL(request.url);
    const apiDomain = url.origin;
    const { user, error } = await verifySession(request, apiDomain);

    // If no user or invalid token, redirect to auth
    if (!user) {
        console.log("❌ [authMiddleware] Not authenticated, redirecting to auth");
        const currentUrl = encodeURIComponent(url.pathname + url.search);
        throw redirect(`${process.env.AUTH_DOMAIN || "/"}?redirectTo=${currentUrl}`);
    }

    console.log(`✅ [authMiddleware] User ${user.id} authenticated for ${request.method} request`);

    // Store authenticated user in context for loaders/actions to access
    context.set(authenticatedUserContext, user);

    // Middleware returns void - next() is called automatically
};
