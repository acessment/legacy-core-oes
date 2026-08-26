import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "@/provider/AuthContext";
import { RoleEnum } from "@/enum/RoleEnum";

type UseAuthRedirectOptions = {
    requireAdmin?: boolean;
    redirectTo?: string | undefined;
    /**
     * If true, automatically redirects to login screen when not authenticated.
     * If false, does not redirect and lets the component handle the UI.
     * @default true
     */
    redirectToLogin?: boolean;
};

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
    const { requireAdmin = false, redirectTo = "/", redirectToLogin = true } = options;
    const navigate = useNavigate();
    const { user, loading } = useContext(AuthContext);

    useEffect(() => {
        // Don't redirect while still loading auth state
        if (loading) return;

        const isExternalUrl = redirectTo?.startsWith("http://") || redirectTo?.startsWith("https://");

        if (!user) {
            console.log("❌ no user");

            // Only redirect if redirectToLogin is enabled
            if (redirectToLogin) {
                if (isExternalUrl) {
                    // Add current URL as redirectTo parameter so auth site knows where to return
                    const currentUrl = encodeURIComponent(window.location.href);
                    const separator = redirectTo.includes("?") ? "&" : "?";
                    window.location.href = `${redirectTo}${separator}redirectTo=${currentUrl}`;
                } else {
                    navigate(redirectTo);
                }
            }
            return;
        }

        if (requireAdmin && !user.roles?.includes(RoleEnum.ADMIN)) {
            // Only redirect if redirectToLogin is enabled
            if (redirectToLogin) {
                if (isExternalUrl) {
                    console.log("admin redirect");
                    // Add current URL as redirectTo parameter so auth site knows where to return
                    const currentUrl = encodeURIComponent(window.location.href);
                    const separator = redirectTo.includes("?") ? "&" : "?";
                    window.location.href = `${redirectTo}${separator}redirectTo=${currentUrl}`;
                } else {
                    navigate(redirectTo);
                }
            }
        }
    }, [user, loading, navigate, redirectTo, requireAdmin, redirectToLogin]);

    return { user, isAuthenticated: !!user, loading };
};
