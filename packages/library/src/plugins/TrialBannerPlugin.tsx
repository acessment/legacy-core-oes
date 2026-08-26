import { AntiPaywallGate, withPaywall } from "@/feature/payment";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { Box, Button, Text, Title } from "@mantine/core";
import { IconHeart, IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const PaywalledButton = withPaywall(Button);
export const TrialBannerPlugin = () => {
    const { t } = useTranslation();
    return (
        <AntiPaywallGate productIndex={[0]}>
            <div className="relative p-0.5 rounded-xl bg-linear-to-br from-blue-400 via-pink-400  to-indigo-400 bg-[length:300%_300%] animate-[gradientShift_6s_ease_infinite]">
                <style>{`
                    @keyframes gradientShift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}</style>
                <div className="bg-linear-to-br from-blue-50 via-pink-50 to-purple-50 rounded-[10px] p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <IconHeart size={24} className="text-pink-400 fill-pink-400" />
                        <Title order={3} className="">
                            {t("trialBanner.title")}
                        </Title>
                    </div>

                    <Text size="sm" className="mb-4! text-gray-600! font-medium!">
                        {t("trialBanner.description")}
                    </Text>

                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-start gap-2">
                            <IconCheck size={18} className="mt-0.5 shrink-0 text-indigo-500" />
                            <Text size="sm" className="flex-1">
                                {t("trialBanner.features.dailyExercise")}
                            </Text>
                        </div>
                        <div className="flex items-start gap-2">
                            <IconCheck size={18} className="mt-0.5 shrink-0 text-indigo-500" />
                            <Text size="sm" className="flex-1">
                                {t("trialBanner.features.curriculumAligned")}
                            </Text>
                        </div>
                        <div className="flex items-start gap-2">
                            <IconCheck size={18} className="mt-0.5 shrink-0 text-indigo-500" />
                            <Text size="sm" className="flex-1">
                                {t("trialBanner.features.relevantTopics")}
                            </Text>
                        </div>
                        <div className="flex items-start gap-2">
                            <IconCheck size={18} className="mt-0.5 shrink-0 text-indigo-500" />
                            <Text size="sm" className="flex-1">
                                {t("trialBanner.features.markingExplanation")}
                            </Text>
                        </div>
                    </div>

                    <PaywalledButton color="aceBlue" variant="gradient" gradient={{from: "violet", to: "blue"}} className="w-full hover:from-violet-600 hover:to-blue-600">
                        {t("trialBanner.button")}
                    </PaywalledButton>
                </div>
            </div>
        </AntiPaywallGate>
    );
};
