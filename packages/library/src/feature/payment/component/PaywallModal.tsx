// PaywallModal.tsx
import React, { useContext, useEffect, useState } from "react";
import { Modal, Text, Stack, Loader, Center } from "@mantine/core";
import { AuthContext, useConfig } from "@/provider";
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "stripe-pricing-table": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

type PaywallModalProps = {
    opened?: boolean;
    onClose?: () => void;
    title?: string;
    description?: string;
};

export function PaywallModal({
    opened = true,
    onClose,
    title = "Go Premium",
    description = "Unlock this content and more with a subscription.",
}: PaywallModalProps) {
    const appConfig = useConfig();
    const userContext = useContext(AuthContext);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [secretTimestamp, setSecretTimestamp] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stripe customer sessions expire after ~30 minutes, refetch if older than 25 minutes
    const SESSION_EXPIRY_MS = 25 * 60 * 1000; // 25 minutes

    // Check if client secret is expired
    const isSecretExpired = () => {
        if (!secretTimestamp) return true;
        return Date.now() - secretTimestamp > SESSION_EXPIRY_MS;
    };

    // Fetch client secret when modal opens (only if expired or missing)
    useEffect(() => {
        if (opened && !loading && (!clientSecret || isSecretExpired())) {
            setLoading(true);
            setError(null);

            fetch("/api/customer-session", {
                method: "POST",
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setClientSecret(data.clientSecret);
                        setSecretTimestamp(Date.now());
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch customer session:", err);
                    setError("Failed to load pricing. Please try again.");
                })
                .finally(() => setLoading(false));
        } else if (opened && clientSecret && !isSecretExpired()) {
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened]); // Only re-run when modal opens/closes

    return (
        <Modal
            className=""
            classNames={{ title: "font-bold! text-2xl!" }}
            opened={opened}
            onClose={onClose || (() => {})}
            title={title}
            size="lg"
        >
            <Stack gap="lg">
                <Text size="sm">{description}</Text>

                {loading && (
                    <Center p="xl">
                        <Loader size="md" />
                    </Center>
                )}

                {error && (
                    <Text c="red" size="sm">
                        {error}
                    </Text>
                )}

                {clientSecret && !loading && (
                    <stripe-pricing-table
                        pricing-table-id={appConfig.stripePricingTableId}
                        publishable-key={appConfig.stripePublishableKey}
                        client-reference-id={userContext.user?.id}
                        customer-session-client-secret={clientSecret}
                    ></stripe-pricing-table>
                )}
            </Stack>
        </Modal>
    );
}
