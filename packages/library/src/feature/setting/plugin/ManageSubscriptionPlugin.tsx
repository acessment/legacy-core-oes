import { Button, Text, Stack, Alert } from "@mantine/core";
import { IconExternalLink, IconCreditCard } from "@tabler/icons-react";
import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ContactUsBadgePlugin } from "@/feature/setting/plugin/ContactUsBadgePlugin";

interface CustomerPortalResponse {
    success: boolean;
    portalUrl?: string;
    error?: string;
}

export const ManageSubscriptionPlugin = () => {
    const { t } = useTranslation();
    const fetcher = useFetcher<CustomerPortalResponse>();
    const [error, setError] = useState<string | null>(null);

    // Handle the portal response
    useEffect(() => {
        if (fetcher.data) {
            if (fetcher.data.success && fetcher.data.portalUrl) {
                // Redirect to customer portal
                window.location.href = fetcher.data.portalUrl;
            } else if (fetcher.data.error) {
                setError(fetcher.data.error);
            }
        }
    }, [fetcher.data]);

    const handleManageSubscription = () => {
        setError(null);
        
        // Submit to the customer portal API
        fetcher.submit(
            {}, 
            { 
                method: "POST", 
                action: "/api/customer-portal" 
            }
        );
    };

    const isLoading = fetcher.state === "submitting" || fetcher.state === "loading";

    return (
        <Stack gap="md" className="pt-4">
            <hr className="text-gray-200"></hr>
            <div>
                <Text size="lg" fw={600} mb="xs">
                    {t("subscription.manage.title", "Manage Subscription")}{" "}
                    <ContactUsBadgePlugin
                        url="https://api.whatsapp.com/send/?phone=85264647085&text=%E6%83%B3%E6%9F%A5%E8%A9%A2%E8%A8%82%E9%96%B1%E4%BA%8B%E5%AE%9C"
                        text={t("subscription.manage.contactUs", "Need help?")}
                    />
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                    {t(
                        "subscription.manage.description",
                        "View and manage your subscription plans, cancel your subscription or download receipts."
                    )}
                </Text>
            </div>

            {error && (
                <Alert color="red" title={t("error.title", "Error")}>
                    {error}
                </Alert>
            )}

            <Button
                leftSection={<IconCreditCard size={16} />}
                rightSection={<IconExternalLink size={16} />}
                variant="filled"
                size="md"
                color="aceBlue"
                loading={isLoading}
                onClick={handleManageSubscription}
                disabled={isLoading}
            >
                {isLoading
                    ? t("subscription.manage.loading", "Opening Portal...")
                    : t("subscription.manage.button", "Manage Subscription")}
            </Button>
        </Stack>
    );
};
