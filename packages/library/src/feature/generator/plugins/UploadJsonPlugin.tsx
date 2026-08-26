import React, { createContext, useCallback, useContext } from "react";
import { Button, FileButton } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { toast } from "react-toastify/unstyled";
import type { IExerciseContentJsonData } from "@acessment/generator-panel";
import type { TFunction } from "i18next";

export interface UploadJsonPluginContextType {
    exerciseDispatch: React.Dispatch<any>;
    setExercises: (exercises: IExerciseContentJsonData[]) => void;
    setCurrentExerciseIndex: (index: number) => void;
    t: TFunction;
}

export const UploadJsonPluginContext = createContext<UploadJsonPluginContextType | undefined>(undefined);

interface UploadJsonPluginProps {
    variant?: "default" | "light" | "filled" | "outline" | "subtle";
    color?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
}

export const UploadJsonPlugin: React.FC<UploadJsonPluginProps> = ({
    variant = "light",
    color = "aceBlue",
    size = "md",
    className = "",
}) => {
    const context = useContext(UploadJsonPluginContext);

    if (!context) {
        throw new Error("UploadJsonPlugin must be used within UploadJsonPluginContext.Provider");
    }

    const { exerciseDispatch, setExercises, setCurrentExerciseIndex, t } = context;

    const handleJsonUpload = useCallback(
        (file: File | null) => {
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonContent = JSON.parse(e.target?.result as string);

                    // Check if the JSON content is an array of exercises
                    if (Array.isArray(jsonContent)) {
                        if (jsonContent.length === 0) {
                            toast.error(t("The JSON array is empty. Please provide valid exercise data."));
                            return;
                        }

                        // Handle array of exercises - set first exercise as current
                        const firstExercise = jsonContent[0] as IExerciseContentJsonData;
                        exerciseDispatch({
                            type: "SET_EXERCISE_CONTENT",
                            payload: firstExercise,
                        });

                        // Set all exercises in the array
                        setExercises(jsonContent as IExerciseContentJsonData[]);
                        setCurrentExerciseIndex(0);

                        toast.success(t(`Successfully loaded ${jsonContent.length} exercise(s) from JSON file!`));
                    } else {
                        // Handle single exercise object
                        exerciseDispatch({
                            type: "SET_EXERCISE_CONTENT",
                            payload: jsonContent as IExerciseContentJsonData,
                        });

                        // Reset to single exercise mode
                        setExercises([jsonContent as IExerciseContentJsonData]);
                        setCurrentExerciseIndex(0);

                        toast.success(t("JSON file uploaded successfully!"));
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    toast.error(t("Invalid JSON file. Please check the file format."));
                }
            };
            reader.readAsText(file);
        },
        [exerciseDispatch, setExercises, setCurrentExerciseIndex, t]
    );

    return (
        <FileButton onChange={handleJsonUpload} accept=".json">
            {(props) => (
                <Button
                    {...props}
                    color={color}
                    variant={variant}
                    size={size}
                    leftSection={<IconUpload size={16} />}
                    className={className}
                >
                    {t("Upload JSON")}
                </Button>
            )}
        </FileButton>
    );
};
