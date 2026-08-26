import User from "@/models/User";
import { ActionFunctionArgs } from "react-router";
import z from "zod";
import { getFirebaseAdmin } from "./firebaseAdmin.server";
import { randomBytes } from "node:crypto";
import { validateRequest } from "@/feature/homework/utils/zodRequestValidator.server";
import { SanitizedActionInput, withInputSanitization } from "@/middleware/inputSanitizer.server";
import { serialize } from "cookie";

/**
 * Validation schema for login/session creation action
 */
const sessionSchema = z.object({
    idToken: z.string().min(1, "ID token is required"),
    username: z.string().optional(),
});

/**
 * Server action for creating user sessions (login flow).
 * Note: Origin, CSRF, and rate limiting are handled by the route middleware.
 * This action focuses on Firebase authentication and session creation.
 */
export const createSessionAction = withInputSanitization<ActionFunctionArgs>(
    async (args, sanitized: SanitizedActionInput): Promise<Response> => {
        try {
            const { body } = validateRequest({
                schema: {
                    bodySchema: sessionSchema,
                },
                reqBody: sanitized.body,
            });

            let res;
            try {
                const admin = getFirebaseAdmin();
                res = await admin.auth().verifyIdToken(body?.idToken ?? "");
            } catch (err: any) {
                console.warn("[Session action] verifyIdToken failed:", err?.message || String(err));
                return new Response(JSON.stringify({ error: "Authentication failed" }), {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // 7. Create session cookie from ID token
            const sessionCookie = await getFirebaseAdmin()
                .auth()
                .createSessionCookie(body?.idToken!, {
                    expiresIn: 5 * 24 * 60 * 60 * 1000, // 5 days
                });
            const isSecure = process.env.NODE_ENV === "production";

            // 8. Create CSRF token (double-submit pattern) — readable by JS (not httpOnly)
            const csrf = randomBytes(16).toString("hex");

            // Do NOT set domain attribute - cookies will be specific to each subdomain
            // This prevents cookie sharing between a.domain.com and b.domain.com

            const cookieOptions = {
                httpOnly: true,
                secure: isSecure,
                maxAge: 5 * 24 * 60 * 60, // 5 days
                path: "/",
                sameSite: "lax",
            } as const;

            // Clear existing cookies first (use past date to delete)
            const pastDate = new Date(0); // Thu, 01 Jan 1970 00:00:00 GMT
            const clearCookieOptions = {
                httpOnly: true,
                secure: isSecure,
                expires: pastDate,
                path: "/",
                sameSite: "lax",
            } as const;

            const clearOldSession = serialize("session", "", {
                ...clearCookieOptions,
                httpOnly: true,
            });

            const clearOldCsrf = serialize("csrf", "", {
                ...clearCookieOptions,
                httpOnly: false,
            });

            const clearOldAuthorization = serialize("authorization", "", {
                ...clearCookieOptions,
                httpOnly: true,
            });

            // Set new cookies
            const setCookieSession = serialize("session", sessionCookie, {
                ...cookieOptions,
                httpOnly: true,
            });

            const setCookieCsrf = serialize("csrf", csrf, {
                ...cookieOptions,
                httpOnly: false,
            });

            console.log("🍪 [createSessionAction] Clearing old cookies and setting new ones:");
            console.log("   Clearing old session, csrf, and authorization cookies");
            console.log("   New Session cookie:", setCookieSession.substring(0, 50) + "...");
            console.log("   New CSRF cookie:", setCookieCsrf);
            console.log("   CSRF token value:", csrf);

            const headers = new Headers();
            headers.set("Content-Type", "application/json");

            // Clear old cookies first
            headers.append("Set-Cookie", clearOldSession);
            headers.append("Set-Cookie", clearOldCsrf);
            headers.append("Set-Cookie", clearOldAuthorization);

            // Then set new cookies
            headers.append("Set-Cookie", setCookieSession);
            headers.append("Set-Cookie", setCookieCsrf);

            // Return CSRF token in response body so client can use it immediately
            return new Response(JSON.stringify({ ok: true, csrfToken: csrf }), { status: 200, headers });
        } catch (err: any) {
            console.error(`[Session action] Error creating session: ${err?.message || String(err)}`);
            console.error(`domain ${process.env.COOKIE_DOMAIN}`);
            return new Response(JSON.stringify({ error: "Session creation failed" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
);
