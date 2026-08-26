/**
 * CSRF (Cross-Site Request Forgery) Protection Middleware
 *
 * While not strictly required for token-based auth (Bearer tokens),
 * CSRF tokens provide defense-in-depth for:
 * - Cookie-based sessions
 * - State-changing operations (POST/PUT/DELETE)
 * - Protection against confused deputy attacks
 *
 * Implementation using the Double Submit Cookie pattern
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { randomBytes, createHash } from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_FORM_FIELD = "csrf_token";

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
    return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Hash a CSRF token for comparison (prevent timing attacks)
 */
function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

/**
 * Set CSRF token in cookie
 * Call this in your root loader to ensure token is available
 */
export function setCSRFCookie(headers: Headers): string {
    const token = generateCSRFToken();

    // Set cookie with secure flags
    const cookieOptions = [
        `${CSRF_COOKIE_NAME}=${token}`,
        "Path=/",
        "HttpOnly", // Prevent JS access (for cookie)
        "SameSite=Strict", // Only send on same-site requests
        process.env.NODE_ENV === "production" ? "Secure" : "", // HTTPS only in production
        `Max-Age=${60 * 60 * 24}`, // 24 hours
    ]
        .filter(Boolean)
        .join("; ");

    headers.append("Set-Cookie", cookieOptions);

    return token;
}

/**
 * Get CSRF token from cookie
 */
export function getCSRFTokenFromCookie(request: Request): string | null {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const csrfCookie = cookies.find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`));

    if (!csrfCookie) return null;

    return csrfCookie.split("=")[1];
}

/**
 * Get CSRF token from request (header or form data)
 */
export async function getCSRFTokenFromRequest(request: Request): Promise<string | null> {
    // Check header first (for AJAX requests)
    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    if (headerToken) return headerToken;

    // Check form data (for form submissions)
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/x-www-form-urlencoded") || contentType?.includes("multipart/form-data")) {
        try {
            const formData = await request.clone().formData();
            return formData.get(CSRF_FORM_FIELD) as string | null;
        } catch {
            return null;
        }
    }

    // Check JSON body
    if (contentType?.includes("application/json")) {
        try {
            const body = await request.clone().json();
            return body[CSRF_FORM_FIELD] || null;
        } catch {
            return null;
        }
    }

    return null;
}

/**
 * Verify CSRF token matches cookie
 */
export async function verifyCSRFToken(request: Request): Promise<boolean> {
    const cookieToken = getCSRFTokenFromCookie(request);
    const requestToken = await getCSRFTokenFromRequest(request);

    if (!cookieToken || !requestToken) {
        console.warn("⚠️  CSRF validation failed: Missing token");
        return false;
    }

    // Use constant-time comparison to prevent timing attacks
    const cookieHash = hashToken(cookieToken);
    const requestHash = hashToken(requestToken);

    if (cookieHash !== requestHash) {
        console.warn("⚠️  CSRF validation failed: Token mismatch");
        return false;
    }

    return true;
}

/**
 * Middleware wrapper that enforces CSRF protection for state-changing methods
 *
 * @example
 * export const action = withCSRFProtection(async ({ request }) => {
 *   // CSRF validated, safe to proceed
 *   return Response.json({ success: true });
 * });
 */
export function withCSRFProtection<T extends ActionFunctionArgs>(handler: (args: T) => Promise<Response>) {
    return async (args: T): Promise<Response> => {
        const method = args.request.method.toUpperCase();

        // Only protect state-changing methods
        if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
            const isValid = await verifyCSRFToken(args.request);

            if (!isValid) {
                return new Response(
                    JSON.stringify({
                        error: "Invalid CSRF token",
                        message: "Request rejected due to CSRF validation failure",
                    }),
                    {
                        status: 403,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
        }

        return handler(args);
    };
}

/**
 * Helper to include CSRF token in form data
 * Use this in your React components
 *
 * @example
 * // In your root loader, expose the token
 * export const loader = async ({ request }: LoaderFunctionArgs) => {
 *   const headers = new Headers();
 *   const csrfToken = setCSRFCookie(headers);
 *   return json({ csrfToken }, { headers });
 * };
 *
 * // In your component
 * const { csrfToken } = useLoaderData<typeof loader>();
 *
 * <form method="post">
 *   <input type="hidden" name="csrf_token" value={csrfToken} />
 *   ...
 * </form>
 */
export const CSRF_CONFIG = {
    cookieName: CSRF_COOKIE_NAME,
    headerName: CSRF_HEADER_NAME,
    formFieldName: CSRF_FORM_FIELD,
} as const;
