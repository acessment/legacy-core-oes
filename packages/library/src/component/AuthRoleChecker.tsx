import React, { useContext, ReactNode } from "react";
import { AuthContext } from "@/provider/AuthContext";

interface AuthRoleCheckerProps {
    children: ReactNode;
    requiredRoles: string[];
    fallback?: ReactNode;
    requireAll?: boolean; // If true, user must have ALL roles; if false, ANY role
}

/**
 * AuthRoleChecker - A wrapper component that conditionally renders children based on user roles
 *
 * @param children - Content to display if user has required role(s)
 * @param requiredRoles - Array of role strings to check against
 * @param fallback - Optional content to display if user doesn't have required role(s)
 * @param requireAll - If true, user must have ALL roles; if false (default), user needs ANY role
 *
 * @example
 * // Show content only to admin users
 * <AuthRoleChecker requiredRoles={["ADMIN"]}>
 *   <AdminPanel />
 * </AuthRoleChecker>
 *
 * @example
 * // Show content to admin or teacher
 * <AuthRoleChecker requiredRoles={["ADMIN", "TEACHER"]}>
 *   <StaffContent />
 * </AuthRoleChecker>
 *
 * @example
 * // With fallback content
 * <AuthRoleChecker
 *   requiredRoles={["ADMIN"]}
 *   fallback={<div>Access Denied</div>}
 * >
 *   <AdminSettings />
 * </AuthRoleChecker>
 */
export const AuthRoleChecker: React.FC<AuthRoleCheckerProps> = ({
    children,
    requiredRoles,
    fallback = null,
    requireAll = false,
}) => {
    const { user, loading } = useContext(AuthContext);

    // While loading, don't render anything (or you could show a loader)
    if (loading) {
        return null;
    }

    // If no user or no roles, don't render
    if (!user || !user.roles || user.roles.length === 0) {
        return <>{fallback}</>;
    }

    // Check if user has required role(s)
    const hasRequiredRole = requireAll
        ? requiredRoles.every((role) => user.roles.includes(role))
        : requiredRoles.some((role) => user.roles.includes(role));

    return hasRequiredRole ? <>{children}</> : <>{fallback}</>;
};

export default AuthRoleChecker;
