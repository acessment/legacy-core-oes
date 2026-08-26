import React, { createContext, useContext, useState, useEffect } from "react";
import { Button, FileButton, Modal, Stack, Group, TextInput, NumberInput, Image, Text, Loader } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify/unstyled";
import { usePanelContext } from "@/provider/PanelContext";
import { withPaywall } from "@/feature/payment";
import { useFetcher } from "react-router";
import { AuthContext } from "@/provider/AuthContext";
import { PaywallContext } from "@/feature/payment/provider/PaywallContext";
import type { SubscriptionLoaderData } from "@/feature/payment/loader/subscriptionLoader.server";

export interface HeaderImageSettings {
    headerThumbnail: string; // base64 (overrides logoUrl)
    headerText: string; // overrides headerText
    headerThumbnailSize: number; // overrides downloadLogoSize
}

export interface SetHeaderImagePluginContextValue {
    settings: HeaderImageSettings;
    updateSettings: (newSettings: Partial<HeaderImageSettings>) => void;
}

export const SetHeaderImagePluginContext = createContext<SetHeaderImagePluginContextValue | undefined>(undefined);

export const useSetHeaderImagePlugin = () => {
    const context = useContext(SetHeaderImagePluginContext);
    if (!context) {
        throw new Error("useSetHeaderImagePlugin must be used within SetHeaderImagePluginContext.Provider");
    }
    return context;
};

// ============================================================================
// SSR-Safe localStorage Utilities
// ============================================================================

const getLocalStorageItem = (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const setLocalStorageItem = (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Failed to set localStorage item ${key}:`, error);
        throw error;
    }
};

const dispatchStorageEvent = (): void => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("storage-settings-changed"));
};

// ============================================================================
// Image Compression Utility
// ============================================================================

const compressImage = async (file: File): Promise<string> => {
    // SSR guard
    if (typeof window === "undefined") {
        throw new Error("Image compression requires browser environment");
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new window.Image();

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }

                // Calculate scale ratio for 100px max height (2x for 50px retina display)
                const targetHeight = 100;
                const scale = targetHeight / img.height;

                // Apply ratio to both dimensions (maintain aspect ratio)
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);

                // Draw scaled image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Single compression pass with quality 0.85
                const result = canvas.toDataURL("image/jpeg", 0.85);

                // Check 5MB limit (base64 string length)
                const sizeInMB = result.length / (1024 * 1024);
                if (sizeInMB > 5) {
                    reject(new Error(`Compressed image (${sizeInMB.toFixed(2)}MB) exceeds 5MB limit`));
                } else {
                    resolve(result);
                }
            };

            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
};

// ============================================================================
// Main Plugin Component
// ============================================================================

export interface SetHeaderImagePluginProps {
    variant?: "default" | "light" | "filled" | "outline" | "subtle";
    color?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    productIndex?: number[];
}

const PaywallButton = withPaywall(Button, {
    modalTitle: "Upgrade to Premium",
    modalDescription: "Access branding settings by upgrading to a premium plan.",
}) as any;

export const SetHeaderImagePlugin: React.FC<SetHeaderImagePluginProps> = ({
    variant = "light",
    color = "aceBlue",
    size = "xs",
    className = "",
    productIndex = [1], // Default to premium plan
}) => {
    const { t } = useTranslation();
    const panelContext = usePanelContext();
    const { user } = useContext(AuthContext);
    const { productIds } = useContext(PaywallContext);
    
    // Fetcher for subscription check
    const subscriptionFetcher = useFetcher<SubscriptionLoaderData>();
    
    // Resolve product indices to IDs
    const targetProductIds = productIndex.map(i => productIds[i]).filter(Boolean);
    const productIdsParam = targetProductIds.join(',');

    // Modal state
    const [opened, setOpened] = useState(false);

    // Form state
    const [currentThumbnail, setCurrentThumbnail] = useState<string>(panelContext.logoUrl);
    const [headerTextValue, setHeaderTextValue] = useState<string>(panelContext.headerText);
    const [thumbnailSizeValue, setThumbnailSizeValue] = useState<number | string>(panelContext.downloadLogoSize || 18);

    // Loading states
    const [compressing, setCompressing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imageSize, setImageSize] = useState<number | null>(null);

    // Check subscription and load localStorage on mount
    useEffect(() => {
        if (!user?.id || targetProductIds.length === 0) return;
        
        // Fetch subscription status
        subscriptionFetcher.load(
            `/api/subscription-check?productIds=${productIdsParam}&userId=${user.id}`
        );
    }, [user?.id, productIdsParam]);
    
    // Apply localStorage settings when subscription check completes
    useEffect(() => {
        // Wait for subscription check to complete
        if (subscriptionFetcher.state === "loading") return;
        
        // If subscribed, load from localStorage
        if (subscriptionFetcher.data?.isSubscribed) {
            const thumbnail = getLocalStorageItem('ace_header_thumbnail');
            const text = getLocalStorageItem('ace_header_text');
            const size = getLocalStorageItem('ace_header_thumbnail_size');
            
            if (thumbnail) panelContext.updateLogoUrl(thumbnail);
            if (text) panelContext.updateHeaderText(text);
            if (size) {
                const numSize = Number(size);
                panelContext.updateLogoSize(numSize);
                panelContext.updateDownloadLogoSize(numSize);
            }
        }
        // If not subscribed, context keeps defaults (no action needed)
    }, [subscriptionFetcher.state, subscriptionFetcher.data?.isSubscribed]);

    // Open modal and load current values
    const handleOpen = () => {
        setCurrentThumbnail(panelContext.logoUrl);
        setHeaderTextValue(panelContext.headerText);
        setThumbnailSizeValue(panelContext.downloadLogoSize || 18);

        // Calculate current thumbnail size if it's base64
        if (panelContext.logoUrl.startsWith("data:")) {
            setImageSize(panelContext.logoUrl.length);
        } else {
            setImageSize(null);
        }

        setOpened(true);
    };

    // Handle image upload and compression
    const handleImageUpload = async (file: File | null) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error(t("Please upload a valid image file"));
            return;
        }

        setCompressing(true);

        try {
            const compressed = await compressImage(file);
            setCurrentThumbnail(compressed);
            setImageSize(compressed.length);
            toast.success(t("Image compressed successfully"));
        } catch (error) {
            console.error("Image compression error:", error);
            toast.error(t("Failed to compress image: ") + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setCompressing(false);
        }
    };

    // Save settings to localStorage
    const handleSave = async () => {
        setSaving(true);

        try {
            // Validate thumbnail size
            const size = typeof thumbnailSizeValue === "string" ? parseInt(thumbnailSizeValue) : thumbnailSizeValue;
            if (isNaN(size) || size < 1 || size > 100) {
                toast.error(t("Thumbnail size must be between 1 and 100"));
                setSaving(false);
                return;
            }

            // Save to localStorage
            setLocalStorageItem("ace_header_thumbnail", currentThumbnail);
            setLocalStorageItem("ace_header_text", headerTextValue);
            setLocalStorageItem("ace_header_thumbnail_size", String(size));

            // Update context immediately
            panelContext.updateLogoUrl(currentThumbnail);
            panelContext.updateHeaderText(headerTextValue);
            panelContext.updateLogoSize(size);
            panelContext.updateDownloadLogoSize(size);

            toast.success(t("Branding settings saved successfully"));
            setOpened(false);
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error(t("Failed to save settings. Please try again."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <PaywallButton
                variant={variant}
                color={color}
                size={size}
                leftSection={<IconSettings size={16} />}
                onClick={handleOpen}
                className={className}
                productIndex={[1]}
            >
                {t("Branding")}
            </PaywallButton>

            <Modal opened={opened} onClose={() => setOpened(false)} title={t("Branding Settings")} size="lg">
                <Stack gap="md">
                    {/* Header Thumbnail Section */}
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>
                            {t("Header Thumbnail")}
                        </Text>
                        {currentThumbnail && (
                            <Image
                                src={currentThumbnail}
                                h={50}
                                w="auto"
                                fit="contain"
                                alt="Current thumbnail"
                                style={{ border: "1px solid #e0e0e0", borderRadius: "4px", padding: "8px" }}
                            />
                        )}
                        <Group>
                            <FileButton onChange={handleImageUpload} accept="image/*" disabled={compressing}>
                                {(props) => (
                                    <Button {...props} size="sm" variant="light" disabled={compressing}>
                                        {t("Upload Image")}
                                    </Button>
                                )}
                            </FileButton>
                            {compressing && <Loader size="sm" />}
                            {imageSize && (
                                <Text size="xs" c="dimmed">
                                    {(imageSize / 1024).toFixed(0)}KB / 5MB
                                </Text>
                            )}
                        </Group>
                        <Text size="xs" c="dimmed">
                            {t("Image will be compressed to 100px height for optimal display")}
                        </Text>
                    </Stack>

                    {/* Header Text Input */}
                    <TextInput
                        label={t("Header Text")}
                        placeholder={t("Enter header text")}
                        value={headerTextValue}
                        onChange={(e) => setHeaderTextValue(e.currentTarget.value)}
                    />

                    {/* Thumbnail Size Input */}
                    <NumberInput
                        label={t("Thumbnail Size")}
                        placeholder={t("Enter size")}
                        value={thumbnailSizeValue}
                        onChange={setThumbnailSizeValue}
                        min={1}
                        max={100}
                    />

                    {/* Action Buttons */}
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setOpened(false)}>
                            {t("Cancel")}
                        </Button>
                        <Button onClick={handleSave} loading={saving}>
                            {t("Save")}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
};
