import { ActionFunctionArgs } from "react-router";
import { withInputSanitization, type SanitizedActionInput } from "@/middleware/inputSanitizer.server";
import { serialize } from "cookie";

/**
 * Logout action
 * Clears session and CSRF cookies to log the user out
 * Protected against CSRF attacks by validating CSRF token
 */
export const logoutAction = withInputSanitization<ActionFunctionArgs>(
    async (args, sanitized: SanitizedActionInput): Promise<Response> => {
        try {
            // Prepare cookie clearing options
            const isSecure = process.env.NODE_ENV === "production";
            const cookieDomain = process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN : undefined;

            // Use a past date to ensure cookie deletion
            const pastDate = new Date(0); // Thu, 01 Jan 1970 00:00:00 GMT

            const headers = new Headers();
            headers.set("Content-Type", "application/json");

            const domainsToCheck = [];

            if (isSecure) {
                // Always clear .acessment.ai in production
                domainsToCheck.push(".acessment.ai");

                // If COOKIE_DOMAIN is set and different, also clear that
                if (cookieDomain && cookieDomain !== ".acessment.ai") {
                    const normalizedDomain = cookieDomain.startsWith(".") ? cookieDomain : `.${cookieDomain}`;
                    domainsToCheck.push(normalizedDomain);
                }
            } else {
                // In non-production, only use COOKIE_DOMAIN if set
                if (cookieDomain) {
                    domainsToCheck.push(cookieDomain);
                }
            }

            // Also clear subdomain-specific cookies (no domain attribute)
            domainsToCheck.push(undefined);

            console.log("🍪 [logoutAction] Clearing cookies for domains:", domainsToCheck);

            // Clear cookies for each domain
            domainsToCheck.forEach((domain) => {
                const cookieOptions = {
                    httpOnly: true,
                    secure: isSecure,
                    expires: pastDate,
                    path: "/",
                    sameSite: "lax",
                    ...(domain && { domain }),
                } as const;

                // Clear session cookie
                const clearSessionCookie = serialize("session", "", {
                    ...cookieOptions,
                    httpOnly: true,
                });

                // Clear CSRF cookie
                const clearCsrfCookie = serialize("csrf", "", {
                    ...cookieOptions,
                    httpOnly: false,
                });

                headers.append("Set-Cookie", clearSessionCookie);
                headers.append("Set-Cookie", clearCsrfCookie);

                console.log(`   Cleared cookies for domain: ${domain || "(subdomain-specific)"}`);
            });

            return new Response(JSON.stringify({ ok: true, message: "Logged out successfully" }), {
                status: 200,
                headers,
            });
        } catch (error) {
            console.error("Failed to logout:", error);
            return new Response(JSON.stringify({ error: "Logout failed" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
);
