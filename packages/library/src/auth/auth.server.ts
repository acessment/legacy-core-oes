import { redirect } from "react-router";
import type { ICurrentUser } from "@/provider/types";
import { RoleEnum } from "@/enum/RoleEnum";
import { getFirebaseAdmin } from "./firebaseAdmin.server";

/**
 * Extract cookies from request headers
 */
function getCookiesFromRequest(request: Request): Record<string, string> {
    const cookieHeader = request.headers.get("Cookie");
    if (!cookieHeader) return {};

    return cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, ...valueParts] = cookie.trim().split("=");
        const value = valueParts.join("=");
        if (key && value) {
            acc[key] = decodeURIComponent(value);
        }
        return acc;
    }, {} as Record<string, string>);
}

/**
 * Verify session with Firebase Admin SDK by decoding session cookie
 * Returns user object if authenticated, null otherwise
 */
export async function verifySession(request: Request, apiDomain?: string) {
    try {
        const cookies = getCookiesFromRequest(request);
        const sessionCookie = cookies["authorization"] || cookies["session"];

        console.log("🔐 [Server] Verifying session...", {
            apiDomain,
            hasCookies: !!request.headers.get("Cookie"),
            hasSessionCookie: !!sessionCookie,
        });

        if (!sessionCookie) {
            console.warn("❌ [Server] No session cookie found");
            return { user: null, error: "No session cookie" };
        }

        // Decode session cookie using Firebase Admin SDK
        const admin = getFirebaseAdmin();
        const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);

        console.log("✅ [Server] Session cookie verified:", {
            uid: decodedToken.uid,
            email: decodedToken.email,
        });

        // Extract user data from decoded token
        const user = {
            id: decodedToken.uid,
            email: decodedToken.email || "",
            institutionId: (decodedToken as any).institutionId,
            roles: (decodedToken as any).roles || [],
            // Add other fields as needed from your ICurrentUser interface
        };

        console.log("✅ [Server] User authenticated:", user);

        return { user, error: null };
    } catch (error) {
        console.error("❌ [Server] Session verification error:", error);
        return {
            user: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Require authentication for a route
 * Returns user if authenticated, or redirect Response
 */
export async function requireAuth(request: Request, apiDomain: string, redirectTo?: string) {
    const { user, error } = await verifySession(request, apiDomain);

    if (!user) {
        console.warn("⚠️ [Server] Authentication required, redirecting...");
        const currentUrl = new URL(request.url);
        const returnUrl = encodeURIComponent(currentUrl.toString());
        console.log("⚠️ [Server] Redirecting to login with returnUrl:", returnUrl);
        const authUrl = redirectTo || "/";
        const separator = authUrl.includes("?") ? "&" : "?";
        return redirect(`${authUrl}${separator}redirectTo=${returnUrl}`);
    }

    return user;
}

/**
 * Require specific role for a route
 * Returns user if authorized, or redirect Response
 */
export async function requireRole(request: Request, apiDomain: string, role: RoleEnum, redirectTo?: string) {
    const authResult = await requireAuth(request, apiDomain, redirectTo);

    // If already a redirect response, return it
    if (authResult instanceof Response) {
        return authResult;
    }

    const user = authResult;

    if (!user.roles?.includes(role)) {
        console.warn(`⚠️ [Server] User lacks required role: ${role}`);
        const currentUrl = new URL(request.url);
        const returnUrl = encodeURIComponent(currentUrl.toString());
        const authUrl = redirectTo || "/";
        const separator = authUrl.includes("?") ? "&" : "?";
        return redirect(`${authUrl}${separator}redirectTo=${returnUrl}`);
    }

    return user;
}

/**
 * Check if user is authenticated (doesn't redirect, just returns boolean)
 */
export async function isAuthenticated(request: Request, apiDomain: string): Promise<boolean> {
    const { user } = await verifySession(request, apiDomain);
    return !!user;
}
