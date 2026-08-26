import { Outlet } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireAuth } from "@acessment/core-oes/server";

/**
 * Protected API route wrapper for server-side authentication
 * Returns JSON responses with proper HTTP status codes instead of HTML redirects
 * Use this to protect API endpoints that need authentication
 */
export async function loader({ request }: LoaderFunctionArgs) {
    const apiDomain = process.env.VITE_REACT_BASE_URL || "http://localhost:8080";
    const authDomain = process.env.VITE_AUTH_DOMAIN || "http://localhost:5173";

    console.log("🔐 [ProtectedApiWrapper] Checking API authentication...");

    const authResult = await requireAuth(request, apiDomain, authDomain);

    // If authResult is a Response (redirect for pages), convert to JSON 401 for APIs
    if (authResult instanceof Response) {
        console.log("❌ [ProtectedApiWrapper] Not authenticated, returning 401");
        return Response.json(
            {
                error: "Unauthorized",
                message: "Authentication required to access this API endpoint",
            },
            {
                status: 401,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    const user = authResult;
    console.log(`✅ [ProtectedApiWrapper] User ${user.id} authenticated for API access`);

    // Return user data so child API routes can access it via useRouteLoaderData
    return { user };
}

/**
 * Simple wrapper component - maintains route structure
 * Authentication is handled by the loader above
 */
export default function ProtectedApiWrapper() {
    return <Outlet />;
}
