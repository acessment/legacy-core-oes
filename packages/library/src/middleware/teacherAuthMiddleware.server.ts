/**
 * React Router v7 middleware for teacher authentication
 * Extends base authentication and checks for TEACHER or ADMIN role
 */

import { createContext, redirect } from "react-router";
import User from "../models/User";
import { RoleEnum } from "../enum/RoleEnum";
import { authMiddleware, authenticatedUserContext } from "./authMiddleware.server";
import type { ICurrentUser } from "@/provider/types";

export interface TeacherUser extends ICurrentUser {
    roles: string[];
}

/**
 * Context to store authenticated teacher/admin user
 * Use context.get(teacherUserContext) in your loaders/actions to access the user
 */
export const teacherUserContext = createContext<TeacherUser>();

/**
 * Teacher authentication middleware
 * First authenticates with Firebase, then checks for TEACHER or ADMIN role
 * Stores authenticated user in context for downstream handlers
 *
 * @example
 * // In your route file:
 * import { teacherAuthMiddleware } from "@acessment/core-oes/server";
 *
 * export const middleware = [teacherAuthMiddleware];
 */
export const teacherAuthMiddleware = async ({ request, context }: { request: Request; context: any }) => {
    console.log("🔐 [teacherAuthMiddleware] Checking teacher authentication and authorization...");

    // First, run base authentication middleware
    await authMiddleware({ request, context });

    // Get authenticated user from context
    const currentUser = context.get(authenticatedUserContext);

    // Check if user has teacher or admin role in database
    try {
        const userDoc = await User.findById(currentUser.id).select("roles").lean();

        const hasValidRole = userDoc?.roles?.some(
            (role: string) => role === RoleEnum.TEACHER || role === RoleEnum.ADMIN
        );

        if (!userDoc || !hasValidRole) {
            console.log(`❌ [teacherAuthMiddleware] User ${currentUser.id} lacks teacher/admin role, returning 403`);
            redirect(process.env.AUTH_DOMAIN || "/");
        }

        console.log(
            `✅ [teacherAuthMiddleware] User ${currentUser.id} with role(s) ${userDoc.roles.join(", ")} authorized for ${request.method} request`
        );

        // Store authenticated user with roles in context
        context.set(teacherUserContext, {
            ...currentUser,
            roles: userDoc.roles,
        });

        // Middleware returns void - next() is called automatically
    } catch (error) {
        // If it's already a Response (thrown above), re-throw it
        if (error instanceof Response) {
            throw error;
        }

        console.error("❌ [teacherAuthMiddleware] Error checking user roles:", error);
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
