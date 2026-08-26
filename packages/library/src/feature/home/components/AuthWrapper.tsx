import { Outlet } from "react-router";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useMaintenanceRedirect } from "@/hooks/useMaintenanceRedirect";
import { useConfig } from "@/provider";
import { RoleEnum } from "@/enum/RoleEnum";
import { Loader, Paper, Title, Text, Button, Container, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface AuthWrapperProps {
    requireAdmin?: boolean;
    requireTeacher?: boolean;
    children?: React.ReactNode;
    redirectTo?: string | undefined;
    registerTo?: string | undefined;
    /**
     * If true, automatically redirects to login screen when not authenticated.
     * If false, shows a login notice screen instead.
     * @default true
     */
    redirectToLogin?: boolean;
}

/**
 * AuthWrapper - Handles authentication and authorization checks
 * Use this to protect routes that require user authentication
 */
export const AuthWrapper = ({
    requireAdmin = false,
    requireTeacher = false,
    redirectTo,
    registerTo,
    redirectToLogin = true,
    children,
}: AuthWrapperProps) => {
    const { t } = useTranslation();
    const maintenanceLoader = useMaintenanceRedirect();
    const appConfig = useConfig();

    const { loading, user, isAuthenticated } = useAuthRedirect({
        requireAdmin,
        redirectTo: redirectTo || "/",
        redirectToLogin,
    });

    if (maintenanceLoader) {
        return maintenanceLoader;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader color="aceBlue" type="bars" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Container size="sm">
                    <Paper shadow={"md"} radius="lg" p="xl" className="text-center">
                        <Stack gap="lg">
                            <div>
                                <Title order={2} className="text-gray-800 mb-2">
                                    {t("Authentication Required")}
                                </Title>
                                <Text size="md" c="dimmed" className="mt-2">
                                    {t("Please log in to access this content and continue your journey.")}
                                </Text>
                            </div>

                            {redirectTo && (
                                <Button
                                    size="lg"
                                    color="blue"
                                    radius="md"
                                    onClick={() => {
                                        const isExternalUrl =
                                            redirectTo.startsWith("http://") || redirectTo.startsWith("https://");
                                        if (isExternalUrl) {
                                            const currentUrl = encodeURIComponent(window.location.href);
                                            const separator = redirectTo.includes("?") ? "&" : "?";
                                            window.location.href = `${redirectTo}${separator}redirectTo=${currentUrl}`;
                                        } else {
                                            window.location.href = redirectTo;
                                        }
                                    }}
                                    className="w-full"
                                >
                                    {t("Login")}
                                </Button>
                            )}
                            {registerTo && (
                                <Button
                                    size="lg"
                                    color="blue"
                                    radius="md"
                                    variant="outline"
                                    onClick={() => {
                                        const isExternalUrl =
                                            registerTo.startsWith("http://") || registerTo.startsWith("https://");
                                        if (isExternalUrl) {
                                            const currentUrl = encodeURIComponent(window.location.href);
                                            const separator = registerTo.includes("?") ? "&" : "?";
                                            window.location.href = `${registerTo}${separator}redirectTo=${currentUrl}`;
                                        } else {
                                            window.location.href = registerTo;
                                        }
                                    }}
                                    className="w-full"
                                >
                                    {t("Sign Up")}
                                </Button>
                            )}
                        </Stack>
                    </Paper>
                </Container>
            </div>
        );
    }

    if (requireAdmin && !user?.roles?.includes(RoleEnum.ADMIN)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <Container size="sm">
                    <Paper shadow="md" radius="lg" p="xl" className="text-center">
                        <Stack gap="lg">
                            <div>
                                <Title order={2} className="text-gray-800 mb-2">
                                    {t("Access Denied")}
                                </Title>
                                <Text size="md" c="dimmed" className="mt-2">
                                    {t(
                                        "This area requires administrator privileges. Please contact your system administrator if you believe you should have access."
                                    )}
                                </Text>
                            </div>

                            <div className="flex items-center justify-center py-4">
                                <svg
                                    className="w-24 h-24 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </Stack>
                    </Paper>
                </Container>
            </div>
        );
    }

    if (requireTeacher && !user?.roles?.includes(RoleEnum.TEACHER) && !user?.roles?.includes(RoleEnum.ADMIN)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <Container size="sm">
                    <Paper shadow="md" radius="lg" p="xl" className="text-center">
                        <Stack gap="lg">
                            <div>
                                <Title order={2} className="text-gray-800 mb-2">
                                    {t("Access Denied")}
                                </Title>
                                <Text size="md" c="dimmed" className="mt-2">
                                    {t(
                                        "This area requires teacher or administrator privileges. Please contact your system administrator if you believe you should have access."
                                    )}
                                </Text>
                            </div>

                            <div className="flex items-center justify-center py-4">
                                <svg
                                    className="w-24 h-24 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </Stack>
                    </Paper>
                </Container>
            </div>
        );
    }

    return children || <Outlet />;
};
