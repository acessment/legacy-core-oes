import { ActionFunctionArgs } from "react-router";
import { getFirebaseAdmin } from "./firebaseAdmin.server";
import { withInputSanitization, type SanitizedActionInput } from "@/middleware/inputSanitizer.server";

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
 * Get session info action
 * Returns a custom token that the client can use to initialize Firebase SDK
 * Protected against CSRF attacks by validating CSRF token
 */
export const getSessionAction = withInputSanitization<ActionFunctionArgs>(
    async (args, sanitized: SanitizedActionInput): Promise<Response> => {
        try {
            const cookies = getCookiesFromRequest(args.request);
            const sessionCookie = cookies["authorization"] || cookies["session"];

            if (!sessionCookie) {
                return new Response(JSON.stringify({ error: "No session" }), {
                    status: 407,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Validate CSRF token
            const csrfCookie = cookies["csrf"];
            const csrfHeader = args.request.headers.get("x-csrf-token") || args.request.headers.get("x-xsrf-token");

            console.log("🔐 [getSessionAction] Validating CSRF token...", { csrfCookie, csrfHeader });
            if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
                return new Response(JSON.stringify({ error: "Invalid CSRF token" }), {
                    status: 407,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Validate Firebase session cookie
            const admin = getFirebaseAdmin();
            const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);

            // Create a short-lived custom token that client can exchange for an ID token
            // Client should call `signInWithCustomToken` to obtain an ID token and initialize firebase client SDK
            const customToken = await admin.auth().createCustomToken(decodedToken.uid, {
                // Include useful claims (avoid sensitive data)
                ...((decodedToken as any).institutionId ? { institutionId: (decodedToken as any).institutionId } : {}),
                ...((decodedToken as any).roles ? { roles: (decodedToken as any).roles } : {}),
            });

            return new Response(
                JSON.stringify({
                    token: customToken,
                    uid: decodedToken.uid,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            console.error("Failed to get session info:", error);
            return new Response(JSON.stringify({ error: "Invalid session" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
);
