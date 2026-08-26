import { Paper, Title, Text, Button, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface LoginPromptProps {
    redirectTo?: string;
    registerTo?: string;
    onClose?: () => void;
}

export const LoginPrompt: React.FC<LoginPromptProps> = ({
    redirectTo,
    registerTo,
    onClose,
}) => {
    const { t } = useTranslation();

    const handleRedirect = (url: string) => {
        const isExternalUrl = url.startsWith('http://') || url.startsWith('https://');
        if (isExternalUrl) {
            const currentUrl = encodeURIComponent(window.location.href);
            const separator = url.includes('?') ? '&' : '?';
            window.location.href = `${url}${separator}redirectTo=${currentUrl}`;
        } else {
            window.location.href = url;
        }
    };

    return (
        <Paper radius="lg" p="xl" className="text-center">
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
                        onClick={() => handleRedirect(redirectTo)}
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
                        onClick={() => handleRedirect(registerTo)}
                        className="w-full"
                    >
                        {t("Sign Up")}
                    </Button>
                )}
            </Stack>
        </Paper>
    );
};
