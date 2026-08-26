import { RoleEnum } from "@/enum/RoleEnum";

/**
 * Plugin to configure available roles for account creation
 * @param availableRoles - Array of roles that can be assigned when creating users
 * @returns The availableRoles array
 */
export const getAvailableRolesPlugin = (availableRoles: RoleEnum[]) => {
    return availableRoles;
};

/**
 * Default available roles for admin - includes USER and TEACHER
 */
export const ADMIN_AVAILABLE_ROLES = [RoleEnum.USER, RoleEnum.TEACHER];

/**
 * Default available roles for regular users - only USER
 */
export const USER_AVAILABLE_ROLES = [RoleEnum.USER];
