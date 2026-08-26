import React, { createContext, useContext, useEffect, useState } from "react";
import { Card, Text, Progress, Stack, Group, Badge, Button, ActionIcon } from "@mantine/core";
import { IconCoins, IconAlertCircle, IconX } from "@tabler/icons-react";
import { getUserGeneratorToken } from "@/feature/generator/api";
import { GeneratorTokenRes } from "@/feature/generator/type";
import { PaywallModal } from "@/feature/payment/component/PaywallModal";
import { AntiPaywallGate } from "@/feature/payment";

// Context interface for token plugin
export interface TokenPluginContextValue {
    tokenData: GeneratorTokenRes | null;
    isLoading: boolean;
    error: string | null;
    refetchToken: () => Promise<void>;
}

// Context creation
export const TokenPluginContext = createContext<TokenPluginContextValue | undefined>(undefined);

// Custom hook for accessing token context
export const useTokenPlugin = () => {
    const context = useContext(TokenPluginContext);
    if (!context) {
        throw new Error("useTokenPlugin must be used within TokenPluginProvider");
    }
    return context;
};

// Provider component
export const TokenPluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tokenData, setTokenData] = useState<GeneratorTokenRes | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchToken = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getUserGeneratorToken();
            setTokenData(res);
        } catch (err: any) {
            console.error("Error fetching token data:", err);
            setError(err.message || "Failed to fetch token data");
        } finally {
            setIsLoading(false);
        }
    };

    const refetchToken = async () => {
        await fetchToken();
    };

    useEffect(() => {
        // Initial fetch on mount
        fetchToken();
    }, []);

    const value: TokenPluginContextValue = {
        tokenData,
        isLoading,
        error,
        refetchToken,
    };

    return <TokenPluginContext.Provider value={value}>{children}</TokenPluginContext.Provider>;
};

// Plugin props interface
export interface TokenPluginProps {
    variant?: "compact" | "detailed";
    showProgress?: boolean;
    size?: "sm" | "md" | "lg";
    defaultExpanded?: boolean;
}

// Helper to calculate token usage percentage
const calculateTokenPercentage = (used: string, available: string): number => {
    const tokenLeft = parseFloat(used);
    const maxNum = parseFloat(available);

    console.log("Tokens left:", tokenLeft, "Available tokens:", maxNum);
    if (isNaN(tokenLeft) || isNaN(maxNum) || maxNum === 0) {
        return 0;
    }

    const percentage = (tokenLeft) / (maxNum) * 100;
    return Math.min(Math.max(percentage, 0), 100);
};

// Helper to format token numbers
const formatTokenNumber = (token: string): string => {
    const num = parseFloat(token);
    if (isNaN(num)) return "0";

    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(0);
};

// Main plugin component
export const TokenPlugin: React.FC<TokenPluginProps> = ({ variant = "detailed", showProgress = true, size = "md", defaultExpanded = true }) => {
    const { tokenData, isLoading, error } = useTokenPlugin();
    const [showPaywall, setShowPaywall] = useState(false);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Check if tokens are depleted - check both token (available) and maxToken
    useEffect(() => {
        if (tokenData) {
            const tokenNum = parseFloat(tokenData.token);
            const maxTokenNum = parseFloat(tokenData.maxToken);

            // Show paywall if either available tokens <= 0 or max tokens <= 0
            if ((!isNaN(tokenNum) && tokenNum <= 0) || (!isNaN(maxTokenNum) && maxTokenNum <= 0)) {
                setShowPaywall(true);
            }
        }
    }, [tokenData]);

    if (isLoading && !tokenData) {
        return (
            <Card shadow="sm" padding={size} radius="md" withBorder>
                <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                        Loading token info...
                    </Text>
                </Stack>
            </Card>
        );
    }

    if (error) {
        return (
            <Card shadow="sm" padding={size} radius="md" withBorder>
                <Stack gap="xs">
                    <Text size="sm" c="red">
                        Failed to load token data
                    </Text>
                </Stack>
            </Card>
        );
    }

    if (!tokenData) {
        return null;
    }

    const usedToken = tokenData.token;
    const availableToken = tokenData.maxToken;
    const tokenNum = parseFloat(tokenData.token);
    const maxTokenNum = parseFloat(availableToken);
    const percentage = calculateTokenPercentage(usedToken, availableToken);
    const isLowToken = percentage < 15;
    // Check if out of tokens - either available (token) or max is <= 0
    const isOutOfTokens = (!isNaN(tokenNum) && tokenNum <= 0) || (!isNaN(maxTokenNum) && maxTokenNum <= 0);

    // Collapsed state - show action button with badge
    if (!isExpanded) {
        return (
            <div className="relative">
                <ActionIcon
                    onClick={() => setIsExpanded(true)}
                    variant="light"
                    color={isOutOfTokens ? "red" : isLowToken ? "orange" : "aceBlue"}
                    size={size === "sm" ? "lg" : size === "md" ? "xl" : 42}
                    radius={"xl"}
                >
                    <IconCoins size={size === "sm" ? 18 : size === "md" ? 20 : 24} />
                </ActionIcon>
                <Badge
                    color={isOutOfTokens ? "red" : isLowToken ? "orange" : "green"}
                    variant="filled"
                    size="xs"
                    circle
                    style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        minWidth: 20,
                        height: 20,
                        padding: "0 4px",
                    }}
                >
                    {formatTokenNumber(usedToken)}
                </Badge>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <>
                <Card shadow="sm" padding={size} radius="md" withBorder>
                    <Stack gap="xs">
                        <Group justify="space-between" gap="xs">
                            <Group gap="xs" style={{ flex: 1 }}>
                                <IconCoins
                                    size={16}
                                    color={isOutOfTokens ? "#fa5252" : isLowToken ? "#fa5252" : "#12b886"}
                                />
                                <Text size="sm" fw={500}>
                                    Tokens
                                </Text>
                                <Badge
                                    color={isOutOfTokens ? "red" : isLowToken ? "red" : "green"}
                                    variant="light"
                                    size="sm"
                                >
                                    {formatTokenNumber(availableToken)} left
                                </Badge>
                            </Group>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                onClick={() => setIsExpanded(false)}
                                size="sm"
                            >
                                <IconX size={16} />
                            </ActionIcon>
                        </Group>
                        <AntiPaywallGate productIndex={[1]}>
                            <Button size="xs" color="aceBlue" onClick={() => setShowPaywall(true)} fullWidth>
                                Upgrade
                            </Button>
                        </AntiPaywallGate>
                    </Stack>
                </Card>

                {/* Stripe Paywall Modal - Same as PDF Library */}
                {showPaywall && <PaywallModal opened={showPaywall} onClose={() => setShowPaywall(false)} />}
            </>
        );
    }

    return (
        <>
            <Card shadow="sm" padding={size} radius="md" withBorder>
                <Stack gap="sm">
                    <Group justify="space-between">
                        <Group gap="xs" style={{ flex: 1 }}>
                            <IconCoins
                                size={20}
                                color={isOutOfTokens ? "#fa5252" : isLowToken ? "#fa5252" : "#12b886"}
                            />
                            <Text size="sm" fw={600}>
                                Token Usage
                            </Text>
                            {isOutOfTokens ? (
                                <Badge color="red" variant="filled" size="sm">
                                    Out of Tokens
                                </Badge>
                            ) : isLowToken ? (
                                <Badge color="red" variant="light" size="sm">
                                    Low Token
                                </Badge>
                            ) : null}
                        </Group>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => setIsExpanded(false)}
                            size="sm"
                        >
                            <IconX size={16} />
                        </ActionIcon>
                    </Group>

                    <div>
                        <Group justify="space-between" mb={4}>
                            <Text size="xs" c="dimmed">
                                Available
                            </Text>
                            <Text size="xs" fw={500}>
                                {formatTokenNumber(usedToken)}
                            </Text>
                        </Group>
                        <Group justify="space-between" mb={4}>
                            <Text size="xs" c="dimmed">
                                Maximum
                            </Text>
                            <Text size="xs" fw={500} c={isOutOfTokens ? "red" : isLowToken ? "red" : "green"}>
                                {formatTokenNumber(availableToken)}
                            </Text>
                        </Group>
                    </div>

                    {showProgress && (
                        <Progress
                            value={isOutOfTokens ? 100 : percentage}
                            color={isOutOfTokens ? "red" : isLowToken ? "red" : "green"}
                            size="sm"
                            radius="xl"
                        />
                    )}

                    {/* Always show upgrade button */}
                    <AntiPaywallGate productIndex={[1]}>
                        <Button
                            size="sm"
                            color={isOutOfTokens ? "red" : "aceBlue"}
                            onClick={() => setShowPaywall(true)}
                            fullWidth
                            variant={isOutOfTokens ? "filled" : "light"}
                        >
                            {isOutOfTokens ? "Upgrade to Continue" : "Upgrade Plan"}
                        </Button>
                    </AntiPaywallGate>

                    {tokenData.lastUpdatedAt && (
                        <Text size="xs" c="dimmed" ta="right">
                            Updated: {new Date(tokenData.lastUpdatedAt).toLocaleString()}
                        </Text>
                    )}
                </Stack>
            </Card>

            {/* Stripe Paywall Modal - Same as PDF Library */}
            {showPaywall && <PaywallModal opened={showPaywall} onClose={() => setShowPaywall(false)} />}
        </>
    );
};
