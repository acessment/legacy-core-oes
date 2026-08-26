import { createExercise } from "@/feature/generator/api";
import { CreateExerciseRequest } from "@/feature/generator/type";
import { ExerciseInfoDialog, ExerciseInfoDto } from "@/feature/homework";
import { BaseGeneratorContext, BaseGeneratorContextValue } from "@/plugins/context/BaseGeneratorContext";
import { mapCategoryForDialog } from "@/utils/mapCategoryForDialog";
import { Button } from "@mantine/core";
import { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify/unstyled";

export interface CompleteExercisePluginContextValue{
    onGenerateThumbnailClick: () => Promise<string | null | undefined>;
    articleScript?: string;
    audioPath?: string | null;
}

export const CompleteExercisePluginContext = createContext<CompleteExercisePluginContextValue | undefined>(undefined);

export const CompleteExercisePlugin = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [exerciseInfoDialog, setExerciseInfoDialog] = useState(false);
    const baseGeneratorContext = useContext(BaseGeneratorContext);
    const { onGenerateThumbnailClick, articleScript, audioPath } = useContext(CompleteExercisePluginContext)!;

        const onCompletedGenerateExerciseClicked = async (data: ExerciseInfoDto) => {
            try {
                setLoading(true); // Show loading animation
                setExerciseInfoDialog(false); // Close the dialog after completion

                const thumbnail = await onGenerateThumbnailClick();
                console.log("Generated thumbnail:", thumbnail);

                const exerciseDataWithScript = {
                    ...baseGeneratorContext?.jsonContent,
                    script: articleScript && data.category == "listening" ? articleScript : undefined,
                };

                const req: CreateExerciseRequest = {
                    title: data.title,
                    category: data.category,
                    grade: data.grades,
                    audioSrc: audioPath ?? undefined,
                    content: JSON.stringify(exerciseDataWithScript),
                    thumbnailSrc: thumbnail ?? "",
                    welcomeExercise: data.welcomeExercise,
                };

                console.log("Exercise Request:", req);
                await createExercise(req);
                toast.success(t("Exercise created successfully!"));
            } catch (error) {
                console.error("Error completing exercise generation:", error);
                toast.error(t("Failed to complete exercise generation. Please try again."));
            } finally {
                setLoading(false);
            }
        };


    return (
        <>
            <Button
                size="xs"
                loading={loading}
                onClick={() => setExerciseInfoDialog(true)}
                variant="gradient"
                gradient={{ from: "green", to: "teal", deg: 45 }}
                classNames={{ label: "font-medium" }}
            >
                {t("Complete Exercise")}
            </Button>
            {exerciseInfoDialog && (
                <ExerciseInfoDialog
                    opened={exerciseInfoDialog}
                    onClose={() => setExerciseInfoDialog(false)}
                    data={{
                        title: baseGeneratorContext?.jsonContent?.title ?? "",
                        category: mapCategoryForDialog(baseGeneratorContext?.jsonContent?.category ?? ""),
                        grades: [],
                        welcomeExercise: false,
                    }}
                    t={t}
                    isCreating={true}
                    onSubmit={onCompletedGenerateExerciseClicked}
                />
            )}
        </>
    );
};
