import { Button } from "@mantine/core";
import { useExplanationV2 } from "@/feature/generator/api";
import { IExerciseContentJsonData, pushExplanationToJson, questionExtractor } from "@acessment/generator-panel";
import { useContext, useState } from "react";
import { IconZoomQuestion } from "@tabler/icons-react";
import { jsonDecrypt } from "@/utils/jsonEncryptionUtils";
import { toast } from "react-toastify/unstyled";
import { BaseGeneratorContext } from "./context/BaseGeneratorContext";

export const ExplanationV2Plugin = () => {
    const { generateExplanation, isGenerating } = useExplanationV2();
    const contextValue = useContext(BaseGeneratorContext);
    const [isProcessingAll, setIsProcessingAll] = useState(false);

    const handleMassGenerateExplanation = async () => {
        const questionArray = questionExtractor(contextValue?.jsonContent || ({} as IExerciseContentJsonData));
        if (questionArray.length === 0) {
            console.log("No questions found");
            toast.error("No questions found to generate explanations for.");
            return;
        }
        setIsProcessingAll(true);

        try {
            // Process all questions in parallel
            const explanationPromises = questionArray.map(async (question, index) => {
                try {
                    const result = await generateExplanation({
                        context: JSON.stringify(contextValue?.jsonContent),
                        question: JSON.stringify(question),
                    });

                    console.log(index)

                    return {
                        questionIndex: index,
                        explanation: jsonDecrypt(result).payload,
                        hasError: false,
                    };
                } catch (error) {
                    console.error(`Error generating explanation for question ${index + 1}:`, error);
                    return {
                        questionIndex: index,
                        question,
                        explanation: `Error generating explanation: ${
                            error instanceof Error ? error.message : "Unknown error"
                        }`,
                        hasError: true,
                    };
                }
            });

            const responses = await Promise.allSettled(explanationPromises);
            const explanations = responses.map((result, index) => {
                if (result.status === "fulfilled") {
                    return result.value;
                } else {
                    return {
                        questionIndex: index,
                        question: questionArray[index],
                        explanation: `Promise rejected: ${result.reason}`,
                        hasError: true,
                    };
                }
            });

            // Filter out failed explanations and extract only successful ones
            const processedExplanations = explanations
                .filter((item) => !item.hasError && item.explanation)
                .map((item) => item.explanation);
            
            if (contextValue && processedExplanations.length > 0) {
                try {
                    const exerciseWithExplanations = pushExplanationToJson(contextValue.jsonContent, processedExplanations);
                    
                    // Validate the result before dispatching
                    if (!exerciseWithExplanations || typeof exerciseWithExplanations !== 'object') {
                        throw new Error("Invalid exercise data returned from pushExplanationToJson");
                    }
                    
                    contextValue.jsonDispatch({
                        type: "SET_EXERCISE_CONTENT",
                        payload: exerciseWithExplanations,
                    });
                    
                    const successCount = processedExplanations.length;
                    const failCount = explanations.length - successCount;
                    toast.success(`Generated ${successCount} explanation(s)${failCount > 0 ? ` (${failCount} failed)` : ''}`);
                } catch (error) {
                    console.error("Error in pushExplanationToJson:", error);
                    toast.error("Failed to push explanations to JSON content: " + (error instanceof Error ? error.message : String(error)));
                    return;
                }
            } else if (processedExplanations.length === 0) {
                toast.error("All explanations failed to generate");
            }
        } catch (error) {
            console.error("Unexpected error in mass generation:", error);
        } finally {
            setIsProcessingAll(false);
        }
    };

    return (
        <Button
            size="xs"
            onClick={handleMassGenerateExplanation}
            disabled={isGenerating || isProcessingAll}
            color={"aceBlue"}
            classNames={{ label: "font-medium" }}
            leftSection={<IconZoomQuestion size={14} />}
        >
            {isGenerating || isProcessingAll ? "Generating..." : "Generate All Explanations"}
        </Button>
    );
};