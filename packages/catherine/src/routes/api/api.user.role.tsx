import { updateUserRoleAction, adminAuthMiddleware } from "@acessment/core-oes/server";

// Apply admin auth middleware - only admins can update user roles
export const middleware = [adminAuthMiddleware];

export { updateUserRoleAction as action };
