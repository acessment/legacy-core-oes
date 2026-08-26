import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import User from "../../../models/User";
import { RoleEnum } from "../../../enum/RoleEnum";
import { adminUserContext } from "../../../middleware/adminAuthMiddleware.server";

// Zod schema for validating update role request
const updateRoleSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    roles: z.array(z.nativeEnum(RoleEnum)).min(1, "At least one role is required"),
});

export type UpdateUserRoleInput = z.infer<typeof updateRoleSchema>;

/**
 * Update user roles
 * React Router v7 action for updating user roles (admin only)
 *
 * @example
 * // In your route file (catherine app only):
 * import { updateUserRoleAction, adminAuthMiddleware } from "@acessment/core-oes/server";
 *
 * export const middleware = [adminAuthMiddleware];
 * export { updateUserRoleAction as action };
 */
export const updateUserRoleAction = async (args: ActionFunctionArgs) => {
    const { request, context } = args;

    // Check for admin user (adminAuthMiddleware sets this)
    let adminUser;
    try {
        adminUser = context.get(adminUserContext);
    } catch {
        // adminUserContext not set - not using adminAuthMiddleware
    }

    if (!adminUser) {
        return new Response(JSON.stringify({ error: "Unauthorized - Admin access required" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        // Parse request body
        const body = await request.json();

        // Validate request body using Zod
        const validation = updateRoleSchema.safeParse(body);

        if (!validation.success) {
            return new Response(
                JSON.stringify({
                    error: "Validation failed",
                    details: validation.error.issues,
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const { userId, roles } = validation.data;

        // Find and update user
        const user = await User.findById(userId);

        if (!user) {
            return new Response(
                JSON.stringify({
                    error: "User not found",
                    message: `User with ID ${userId} does not exist`,
                }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Update roles
        user.roles = roles;
        user.updatedBy = adminUser.id;
        await user.save();

        return new Response(
            JSON.stringify({
                message: "User roles updated successfully",
                userId: user.id,
                roles: user.roles,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error: any) {
        console.error("Error updating user roles:", {
            error: error.stack || error.message,
        });

        return new Response(
            JSON.stringify({
                error: "Server error",
                message: error.message || "Failed to update user roles",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};
