/**
 * React Router v7 middleware for admin authentication
 * Extends base authentication and checks for admin role
 */

import { createContext, redirect } from "react-router";
import User from "../models/User";
import { RoleEnum } from "../enum/RoleEnum";
import { authMiddleware, authenticatedUserContext } from "./authMiddleware.server";
import type { ICurrentUser } from "@/provider/types";

export interface AdminUser extends ICurrentUser {
    roles: string[];
}

/**
 * Context to store authenticated admin user
 * Use context.get(adminUserContext) in your loaders/actions to access the user
 */
export const adminUserContext = createContext<AdminUser>();

/**
 * Admin authentication middleware
 * First authenticates with Firebase, then checks for ADMIN role
 * Stores authenticated admin user in context for downstream handlers
 *
 * @example
 * // In your route file:
 * import { adminAuthMiddleware } from "@acessment/core-oes/server";
 *
 * export const middleware = [adminAuthMiddleware];
 */
export const adminAuthMiddleware = async ({ request, context }: { request: Request; context: any }) => {
    console.log("🔐 [adminAuthMiddleware] Checking admin authentication and authorization...");

    // First, run base authentication middleware
    await authMiddleware({ request, context });

    // Get authenticated user from context
    const currentUser = context.get(authenticatedUserContext);
    // Check if user has admin role in database
    try {
        const userDoc = await User.findById(currentUser.id).select("roles").lean();

        if (!userDoc || !userDoc.roles?.includes(RoleEnum.ADMIN)) {
            console.log(`❌ [adminAuthMiddleware] User ${currentUser.id} lacks admin role, returning 403`);
            redirect(process.env.AUTH_DOMAIN || "/");
        }

        console.log(`✅ [adminAuthMiddleware] Admin ${currentUser.id} authorized for ${request.method} request`);

        // Store authenticated admin user with roles in context
        context.set(adminUserContext, {
            ...currentUser,
            roles: userDoc.roles,
        });

        // Middleware returns void - next() is called automatically
    } catch (error) {
        // If it's already a Response (thrown above), re-throw it
        if (error instanceof Response) {
            throw error;
        }

        console.error("❌ [adminAuthMiddleware] Error checking user roles:", error);
        throw Response.json(
            {
                error: "Internal Server Error",
                message: "Failed to verify user permissions",
            },
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
};
