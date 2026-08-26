import { Outlet } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireRole } from "@acessment/core-oes/server";
import { RoleEnum } from "@acessment/core-oes";

/**
 * Protected Admin API route wrapper for server-side authentication and authorization
 * Returns JSON responses with proper HTTP status codes instead of HTML redirects
 * Use this to protect API endpoints that require ADMIN role
 */
export async function loader({ request }: LoaderFunctionArgs) {
    const apiDomain = process.env.VITE_REACT_BASE_URL || "http://localhost:8080";
    const authDomain = process.env.VITE_AUTH_DOMAIN || "http://localhost:5173";

    console.log("🔐 [ProtectedAdminApiWrapper] Checking admin API authentication...");

    const authResult = await requireRole(request, apiDomain, RoleEnum.ADMIN, authDomain);

    // If authResult is a Response (redirect for pages), convert to JSON 403 for APIs
    if (authResult instanceof Response) {
        console.log("❌ [ProtectedAdminApiWrapper] Not authorized, returning 403");
        return Response.json(
            {
                error: "Forbidden",
                message: "Admin role required to access this API endpoint",
            },
            {
                status: 403,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    const user = authResult;
    console.log(`✅ [ProtectedAdminApiWrapper] Admin ${user.id} authenticated for API access`);

    // Return user data so child API routes can access it via useRouteLoaderData
    return { user };
}

/**
 * Simple wrapper component - maintains route structure
 * Admin authentication is handled by the loader above
 */
export default function ProtectedAdminApiWrapper() {
    return <Outlet />;
}
