import React, { useMemo } from "react";
import { Drawer, Textarea, Button, LoadingOverlay } from "@mantine/core";
import { IconHeadphones, IconReload } from "@tabler/icons-react";
import type { TFunction } from "i18next";

interface GeneratorSidebarProps {
    opened: boolean;
    onClose: () => void;
    articleScript: string;
    setArticleScript: (value: string) => void;
    selectedCategory: string;
    loading: boolean;
    articleLoading: boolean;
    audioLoading: boolean;
    onGenerateAudioClick: () => void;
    onRegenerateArticleScriptClick: () => void;
    onGenerateQuestionsClick: () => void;
    t: TFunction;
}

const GeneratorSidebar: React.FC<GeneratorSidebarProps> = ({
    opened,
    onClose,
    articleScript,
    setArticleScript,
    selectedCategory,
    loading,
    articleLoading,
    audioLoading,
    onGenerateAudioClick,
    onRegenerateArticleScriptClick,
    onGenerateQuestionsClick,
    t,
}) => {
    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="right"
            size={450}
            title={t("Advanced Settings")}
            className="z-9999"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                    {t("These settings provide additional control over the exercise generation process.")}
                </p>

                <div className="space-y-4">
                    <div>
                        <div className="relative">
                            {useMemo(
                                () => (
                                    <Textarea
                                        autosize
                                        minRows={10}
                                        maxRows={13}
                                        inputSize="md"
                                        label={t("Article/Script")}
                                        value={articleScript}
                                        onChange={(e) => setArticleScript(e.currentTarget.value)}
                                        placeholder={t(
                                            "The raw article or script will appear here... or paste your own content"
                                        )}
                                        disabled={!(selectedCategory === "reading" || selectedCategory === "listening")}
                                        error={
                                            !(selectedCategory === "reading" || selectedCategory === "listening")
                                                ? t("This function is only available in reading or listening")
                                                : undefined
                                        }
                                        classNames={{ input: "overflow-y-auto" }}
                                    />
                                ),
                                [articleScript, setArticleScript, selectedCategory, t]
                            )}

                            <LoadingOverlay
                                visible={loading || articleLoading}
                                zIndex={1000}
                                overlayProps={{ radius: "sm", blur: 0.1 }}
                                loaderProps={{ color: "aceBlue", type: "oval" }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full mt-4 flex gap-4 justify-end flex-wrap">
                            {selectedCategory === "listening" && (
                                <Button
                                    size="sm"
                                    variant="default"
                                    leftSection={
                                        <IconHeadphones size={16} className={audioLoading ? "animate-spin" : ""} />
                                    }
                                    onClick={onGenerateAudioClick}
                                    disabled={!articleScript.trim() || loading || audioLoading}
                                    classNames={{ label: "font-medium" }}
                                    title={t("Generate audio from script")}
                                >
                                    {t("Generate audio")}
                                </Button>
                            )}

                            <Button
                                size="sm"
                                onClick={onRegenerateArticleScriptClick}
                                disabled={
                                    !(selectedCategory === "reading" || selectedCategory === "listening") ||
                                    loading ||
                                    articleLoading
                                }
                                rightSection={<IconReload size={16} className={articleLoading ? "animate-spin" : ""} />}
                                classNames={{ label: "font-medium" }}
                                variant="outline"
                                color="aceBlue"
                            >
                                {selectedCategory === "listening" ? t("Regenerate Script") : t("Regenerate Article")}
                            </Button>

                            <Button
                                size="sm"
                                variant="filled"
                                color="aceBlue"
                                onClick={onGenerateQuestionsClick}
                                classNames={{ label: "font-medium" }}
                                disabled={
                                    !articleScript.trim() ||
                                    !(selectedCategory === "reading" || selectedCategory === "listening") ||
                                    audioLoading ||
                                    loading ||
                                    articleLoading
                                }
                            >
                                {t("Generate Questions")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    );
};

export default GeneratorSidebar;
