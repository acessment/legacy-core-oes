import React, { useState, useContext } from "react";
import { Button, Modal } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { toast } from "react-toastify/unstyled";
import { generatePdf } from "../../generator/api";
import { jsonDecrypt } from "@/utils/jsonEncryptionUtils";
import { downloadPdf } from "@/utils/downloadPDF";
import { BaseGeneratorContext } from "@/plugins/context/BaseGeneratorContext";
import { useConfig, usePanelContext, AuthContext } from "@/provider";
import { withPaywall } from "@/feature/payment";
import { useTranslation } from "react-i18next";
import { LoginPrompt } from "@/component/LoginPrompt";

interface DownloadHomeworkPdfPluginProps {
    onLoadingChange?: (loading: boolean) => void;
    buttonProps?: {
        size?: string;
        variant?: string;
        color?: string;
        className?: string;
        disabled?: boolean;
    };
    buttonText?: string;
    isSolution?: boolean;
    withPaywall?: boolean;
    productIndex?: number[];
}

// Use as any to preserve Mantine Button's complex polymorphic types
const PaywalledPlugin = withPaywall(Button, {}) as any;

export const DownloadHomeworkPdfPlugin: React.FC<DownloadHomeworkPdfPluginProps> = ({
    onLoadingChange,
    buttonProps = {},
    buttonText,
    isSolution = false,
    withPaywall = false,
    productIndex = [],
}) => {
    const appConfig = useConfig();
    const { user } = useContext(AuthContext);
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const context = useContext(BaseGeneratorContext);

    if (!context) {
        console.error("DownloadHomeworkPdfPlugin must be used within BaseGeneratorContext");
        return null;
    }

    const { jsonContent } = context;

    const panelContext = usePanelContext();

    const sanitizeJsonContent = (content: typeof jsonContent) => {
        const sanitized = { ...content };
        if (sanitized.reading && typeof sanitized.reading === "string") {
            sanitized.reading = sanitized.reading.replace(/&nbsp;/g, " ");
        }
        return sanitized;
    };

    const getBase64DataUrlFromUrl = async (url: string): Promise<string> => {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result); // full data URL like data:image/png;base64,....
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleDownloadPDF = async () => {

        if (!jsonContent || Object.keys(jsonContent).length === 0) {
            toast.error(t("pdf.contentNotAvailable"));
            return;
        }
        // Check authentication and show modal if needed
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        try {
            setIsGenerating(true);
            onLoadingChange?.(true);

            let headerDataUrl = "";
            if (panelContext?.logoUrl) {
                try {
                    headerDataUrl = await getBase64DataUrlFromUrl(panelContext.logoUrl);
                } catch (err) {
                    console.warn("Failed to fetch logo for PDF header", err);
                }
            }

            const sanitizedContent = sanitizeJsonContent(jsonContent);

            const pdfRequest = {
                exercise_json: "[" + JSON.stringify(sanitizedContent) + "]",
                is_solution: isSolution,
                show_index: true,
                header: headerDataUrl, // data URL string or empty
                footer: panelContext?.headerText || "",
                header_image_size: panelContext?.downloadLogoSize || 18,
            };

            const pdfResponse = await generatePdf(pdfRequest);
            const jsonData = jsonDecrypt(pdfResponse);

            const solutionText = isSolution ? "solution" : "exercise";

            const filename = jsonContent.title ? `${jsonContent.title}_${solutionText}.pdf` : `${solutionText}.pdf`;

            downloadPdf(jsonData.payload, filename);
            //TODO replace the downloadPDF method with IOS compatible method

            toast.success(t("pdf.downloadSuccess"));
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error(t("pdf.downloadFailed"));
        } finally {
            setIsGenerating(false);
            onLoadingChange?.(false);
        }
    };

    const {
        size = "sm",
        variant = "outline",
        color = "aceBlue",
        className = "",
        disabled = false,
        ...restButtonProps
    } = buttonProps;

    const displayButtonText = buttonText || t("pdf.exercisePdf");

    return (
        <>
            <Modal
                opened={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                title=""
                centered
                size="md"
            >
                <LoginPrompt
                    redirectTo={appConfig.viteAuthDomain}
                    onClose={() => setShowLoginModal(false)}
                />
            </Modal>

            {withPaywall ? (
                <PaywalledPlugin
                    productIndex={productIndex}
                    size={size}
                    variant={variant}
                    color={color}
                    className={className}
                    disabled={disabled || isGenerating}
                    loading={isGenerating}
                    leftSection={<IconDownload size={16} />}
                    onClick={handleDownloadPDF}
                    {...restButtonProps}
                >
                    {displayButtonText}
                </PaywalledPlugin>
            ) : (
                <Button
                    size={size}
                    variant={variant}
                    color={color}
                    className={className}
                    disabled={disabled || isGenerating}
                    loading={isGenerating}
                    leftSection={<IconDownload size={16} />}
                    onClick={handleDownloadPDF}
                    {...restButtonProps}
                >
                    {displayButtonText}
                </Button>
            )}
        </>
    );
};

export default DownloadHomeworkPdfPlugin;
