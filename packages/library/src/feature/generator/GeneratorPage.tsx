/* eslint-disable react/react-in-jsx-scope */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Affix, Button, Modal, Tooltip } from "@mantine/core";
import { toast } from "react-toastify/unstyled";
import {
    createExercise,
    generateDiyExercise,
    generateExerciseClone,
    generateGrammarExercise,
    generateListening,
    generateListeningAudio,
    generateListeningExercise,
    generatePdf,
    generateReading,
    generateReadingExercise,
    getGrammarTenses,
    getGrammarTypes,
} from "./api";
import html2canvas from "html2canvas-pro";
import ExerciseInfoDialog from "../homework/component/ExerciseInfoDialog";
import { AuthContext } from "../../provider/AuthContext";

import { GrammarTemplate } from "./type";
import { CreateExerciseRequest } from "./type";
import { ExerciseInfoDto } from "../homework/type";
import { useTranslation } from "react-i18next";

import {
    MainPanelWrapper,
    utilityReducer,
    IExerciseContentJsonData,
    ExerciseContentTemplate,
} from "@acessment/generator-panel";
import { useImmerReducer } from "use-immer";
import { usePanelContext } from "@/provider/PanelContext";
import { AITextArea, AITextAreaRef } from "@/component/AITextArea/AITextArea";
import GeneratorSidebar from "./component/GeneratorSidebar";
import { PanelSkeleton } from "./component/PanelSkeleton";
import { jsonDecrypt } from "@/utils/jsonEncryptionUtils"; 
import { determineLevel } from "@/utils/determineLevel";
import { scaleDownImage } from "@/utils/scaleDownImage";
import { GeneratorParams } from "./type";

import { IconAdjustmentsHorizontal, IconArrowLeft, IconArrowRight, IconDownload } from "@tabler/icons-react";
import { ExplanationV2Plugin } from "@/plugins/ExplanationV2Plugin";
import { BaseGeneratorContext } from "@/plugins/context/BaseGeneratorContext";
import { DownloadJsonPlugin, DownloadJsonPluginContext } from "@/feature/generator/plugins/DownloadJsonPlugin";
import {
    CompleteExercisePlugin,
    CompleteExercisePluginContext,
} from "@/feature/generator/plugins/CompleteExercisePlugin";
import { TokenPlugin, TokenPluginProvider, useTokenPlugin } from "@/plugins/TokenPlugin";
import { UploadJsonPlugin, UploadJsonPluginContext } from "@/feature/generator/plugins/UploadJsonPlugin";
import DownloadHomeworkPdfPlugin from "@/feature/homework/plugins/DownloadHomeworkPdfPlugin";
import { SetHeaderImagePlugin } from "@/feature/generator/plugins/SetHeaderImagePlugin";

interface GeneratorPageProps {
    explanationPlugin?: React.ReactElement<typeof ExplanationV2Plugin>;
    downloadJsonPlugin?: React.ReactElement<typeof DownloadJsonPlugin>;
    completeExercisePlugin?: React.ReactElement<typeof CompleteExercisePlugin>;
    tokenPlugin?: React.ReactElement<typeof TokenPlugin>;
    uploadJsonPlugin?: React.ReactElement<typeof UploadJsonPlugin>;
    setHeaderImagePlugin?: React.ReactElement<typeof SetHeaderImagePlugin>;
}

const Page = ({
    explanationPlugin,
    downloadJsonPlugin,
    completeExercisePlugin,
    uploadJsonPlugin,
    tokenPlugin,
    setHeaderImagePlugin,
}: GeneratorPageProps) => {
    const { logoUrl, headerText, logoSize } = usePanelContext();
    // Access token context if plugin is provided
    const tokenContext = tokenPlugin ? useTokenPlugin() : null;
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const aiTextAreaRef = useRef<AITextAreaRef>(null);
    const { user } = useContext(AuthContext);

    const [exerciseData, exerciseDispatch] = useImmerReducer(utilityReducer, {} as IExerciseContentJsonData);

    // New state for handling multiple exercises
    const [exercises, setExercises] = useState<IExerciseContentJsonData[]>([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

    const [audioLoading, setAudioLoading] = useState(false);
    const [grammarTenses, setGrammarTenses] = useState<
        {
            id: string;
            value: string;
            label: string;
        }[]
    >([]);

    const [grammarTypes, setGrammarTypes] = useState<GrammarTemplate[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<string>("reading");

    const [audioPath, setAudioPath] = useState<string | null>(null);

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // State for side menu
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

    // State for advanced settings
    const [articleScript, setArticleScript] = useState<string>("");

    // New state for exercise completion workflow
    const [exerciseInfoDialog, setExerciseInfoDialog] = useState<boolean>(false);
    const [thumbnailModalOpened, setThumbnailModalOpened] = useState<boolean>(false);
    const thumbnailRef = useRef<HTMLDivElement>(null);

    // Update current exercise in array (called before navigation or PDF generation)
    // Returns the updated exercises array with current exerciseData integrated
    const updateCurrentExerciseInArray = useCallback(() => {
        console.log("called");
        if (exercises.length > 0 && exerciseData && Object.keys(exerciseData).length > 0) {
            const newExercises = [...exercises];
            newExercises[currentExerciseIndex] = exerciseData;

            // Update state
            setExercises(newExercises);

            // Return the updated array for immediate use
            return newExercises;
        }
        // Return current exercises if no update needed
        return exercises;
    }, [exercises, exerciseData, currentExerciseIndex]);

    // Navigation functions for multiple exercises
    const navigateToPreviousExercise = useCallback(() => {
        if (currentExerciseIndex > 0) {
            // Save current changes to array before navigating
            updateCurrentExerciseInArray();

            const newIndex = currentExerciseIndex - 1;
            setCurrentExerciseIndex(newIndex);
            exerciseDispatch({
                type: "SET_EXERCISE_CONTENT",
                payload: exercises[newIndex],
            });
        }
    }, [currentExerciseIndex, exercises, exerciseDispatch, updateCurrentExerciseInArray]);

    const navigateToNextExercise = useCallback(() => {
        if (currentExerciseIndex < exercises.length - 1) {
            // Save current changes to array before navigating
            updateCurrentExerciseInArray();

            const newIndex = currentExerciseIndex + 1;
            setCurrentExerciseIndex(newIndex);
            exerciseDispatch({
                type: "SET_EXERCISE_CONTENT",
                payload: exercises[newIndex],
            });
        }
    }, [currentExerciseIndex, exercises, exerciseDispatch, updateCurrentExerciseInArray]);

    const memoizedPanelComponent = useMemo(() => {
        if (loading) {
            return (
                <div className="relative border border-gray-200 max-w-[240mm] p-6 rounded-md">
                    <PanelSkeleton />
                </div>
            );
        }

        if (!exerciseData || Object.keys(exerciseData).length === 0) {
            return (
                <div className="flex flex-col justify-center items-center h-full">
                    <h2 className="font-bold text-3xl text-center text-gray-900">
                        {t("exercise.appear", "ACEssment exercise generator")}
                    </h2>
                    <p className="font-medium text-lg text-center text-gray-500">
                        {t("What exercise do you want to generate for today?")}
                    </p>
                    <div className="mt-2">{uploadJsonPlugin}</div>
                </div>
            );
        }

        // Navigation info
        const hasMultiple = exercises.length > 1;
        const canGoLeft = hasMultiple && currentExerciseIndex > 0;
        const canGoRight = hasMultiple && currentExerciseIndex < exercises.length - 1;
        const positionText = hasMultiple ? `${currentExerciseIndex + 1}/${exercises.length}` : null;

        return (
            <div className="flex flex-col relative border border-gray-200 max-w-[290mm] pt-6 rounded-md px-2 md:px-6 bg-white">
                {hasMultiple && (
                    <div className="self-end flex items-center gap-2 mb-2">
                        {positionText && <span className="text-sm text-gray-600 font-medium">{positionText}</span>}
                        <Tooltip label={t("Previous exercise")}>
                            <ActionIcon
                                size="sm"
                                radius="xl"
                                variant={"subtle"}
                                color={"gray"}
                                disabled={!canGoLeft}
                                onClick={navigateToPreviousExercise}
                            >
                                <IconArrowLeft />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t("Next exercise")}>
                            <ActionIcon
                                size="sm"
                                radius="xl"
                                variant={"subtle"}
                                color={"gray"}
                                disabled={!canGoRight}
                                onClick={navigateToNextExercise}
                            >
                                <IconArrowRight />
                            </ActionIcon>
                        </Tooltip>
                    </div>
                )}
                <MainPanelWrapper
                    jsonData={exerciseData}
                    dispatch={exerciseDispatch}
                    isExerciseView={false}
                    showUtility={true}
                    showMarkingUtility={false}
                    isViewMarking={false}
                    headerText={headerText}
                    logoSize={logoSize}
                    logoUrl={logoUrl}
                />
            </div>
        );
    }, [
        loading,
        exerciseData,
        exerciseDispatch,
        t,
        exercises.length,
        currentExerciseIndex,
        navigateToPreviousExercise,
        navigateToNextExercise,
        uploadJsonPlugin,
        logoUrl,
        headerText,
        logoSize,
    ]);

    useEffect(() => {
        const fetchData = async () => {
            const [res, res1] = await Promise.all([getGrammarTenses(), getGrammarTypes()]);

            const grammarTensesJson = jsonDecrypt(res);
            const grammarTenses = Object.keys(grammarTensesJson.payload).map((key) => {
                return {
                    value: key,
                    label: grammarTensesJson.payload[key],
                    id: key,
                };
            });
            setGrammarTenses(grammarTenses);

            const grammarTypes = jsonDecrypt(res1);
            // Modified: Skip or hide the item with key "84"
            const grammarTypesJson = Object.keys(grammarTypes.payload)
                .filter((key) => key !== "84") // skip item 84
                .map((key) => {
                    return {
                        id: parseInt(key),
                        value: key,
                        label: grammarTypes.payload[key],
                    };
                });
            console.log(grammarTypesJson);
            setGrammarTypes(grammarTypesJson);
        };
        fetchData();
    }, []);

    const decrypt = (res: any) => jsonDecrypt(res);

    const updateExerciseWithEncryption = (encrypted: any) => {
        const data = decrypt(encrypted);
        const exercise = data.payload as IExerciseContentJsonData;
        updateExercise(exercise);
    };

    const updateExercise = (exercise: IExerciseContentJsonData) => {
        const exerciseDataWithScript = {
            ...exercise,
            script: articleScript && selectedCategory == "listening" ? articleScript : undefined,
        };

        // Reset to single exercise mode
        setExercises([exerciseDataWithScript]);
        setCurrentExerciseIndex(0);
        exerciseDispatch({
            type: "SET_EXERCISE_CONTENT",
            payload: exerciseDataWithScript,
        });
    };

    const updateCloneExercise = (encrypted: any) => {
        const data = decrypt(encrypted);
        if (Array.isArray(data.payload) && data.payload.length > 0) {
            // Handle multiple exercises from clone
            setExercises(data.payload as IExerciseContentJsonData[]);
            setCurrentExerciseIndex(0);
            exerciseDispatch({
                type: "SET_EXERCISE_CONTENT",
                payload: data.payload[0] as IExerciseContentJsonData,
            });
        } else if (data.payload && !Array.isArray(data.payload)) {
            // Handle single exercise fallback
            setExercises([data.payload as IExerciseContentJsonData]);
            setCurrentExerciseIndex(0);
            exerciseDispatch({
                type: "SET_EXERCISE_CONTENT",
                payload: data.payload as IExerciseContentJsonData,
            });
        } else {
            toast.error(t("Failed to generate clone exercise. Please try again."));
        }
    };

    const updateScript = (encrypted: any) => {
        const data = decrypt(encrypted);
        setArticleScript(data as unknown as string);
    };

    const updateAudio = (encrypted: any) => {
        const data = decrypt(encrypted);
        setAudioPath((data as any).payload as string);
    };

    const runWithLoading = async (fn: () => Promise<void>) => {
        try {
            setLoading(true);
            await fn();
            // Refetch token after successful generation if plugin is enabled
            if (tokenContext) {
                await tokenContext.refetchToken();
            }
        } catch (e: any) {
            console.error(e);
            toast.error(t("Something went wrong. Please try again later."));
        } finally {
            setLoading(false);
        }
    };

    const generateByCategory = async (generatorRequest: GeneratorParams, files: File[]) => {
        switch (generatorRequest.category) {
            case "reading": {
                const level = determineLevel(generatorRequest.level);
                const res = await generateReading({ ...generatorRequest, level });
                setArticleScript(decrypt(res.article));
                updateExerciseWithEncryption(res.exercise);
                return;
            }
            case "listening": {
                const level = determineLevel(generatorRequest.level);
                const res = await generateListening({
                    ...generatorRequest,
                    level,
                    gender: ["male", "male", "male"],
                    intro: true,
                    autogender: true,
                });
                updateScript(res.script);
                updateExerciseWithEncryption(res.exercise);
                updateAudio(res.audio);
                return;
            }
            case "grammar-templates": {
                const res = await generateGrammarExercise({
                    ...generatorRequest,
                    selected_exercise_id: parseInt(generatorRequest.selected_exercise_id as string),
                });
                updateExerciseWithEncryption(res);
                return;
            }
            case "grammar-mixed-tenses": {
                if (generatorRequest.tenses === undefined || generatorRequest.tenses.length === 0) {
                    toast.error(t("Please select at least one tense for mixed tenses grammar exercise."));
                    return;
                }
                const res = await generateGrammarExercise({
                    ...generatorRequest,
                    selected_exercise_id: 39,
                });
                updateExerciseWithEncryption(res);
                return;
            }
            case "freestyle": {
                if (files.length) {
                    const formData = new FormData();
                    for (const file of files) {
                        const scaledBlob = await scaleDownImage(file);
                        formData.append("files", scaledBlob);
                    }
                    const res = await generateExerciseClone(formData);
                    updateCloneExercise(res);
                    return;
                } else {
                    const res = await generateDiyExercise({
                        prompt: generatorRequest.prompt,
                        ...(generatorRequest.model == "sonar" && { internet: true }),
                    });
                    if (generatorRequest.model == "sonar") {
                        updateExercise(JSON.parse(res));
                    } else {
                        updateExerciseWithEncryption(res || {});
                    }
                }
                return;
            }
            default:
                toast.error(t("Invalid category"));
                return;
        }
    };

    const regenerateReadingExercise = async () => {
        const generatorRequest = handleGetGeneratorRequest();
        const level = determineLevel(generatorRequest.level);

        if (!generatorRequest?.prompt.trim()) {
            toast.error(t("Please enter a theme for the reading exercise"));
            return;
        }

        const res = await generateReading({ ...generatorRequest, level });
        setArticleScript(decrypt(res.article));
        updateExerciseWithEncryption(res.exercise);
        toast.success(t("Reading exercise regenerated successfully"));
    };

    const regenerateListeningExercise = async () => {
        const generatorRequest = handleGetGeneratorRequest();
        const level = determineLevel(generatorRequest.level);

        if (!generatorRequest?.prompt.trim()) {
            toast.error(t("Please enter a theme for the listening exercise"));
            return;
        }

        const res = await generateListening({
            ...generatorRequest,
            level,
            gender: ["male", "male", "male"],
            intro: true,
            autogender: true,
        });
        updateScript(res.script);
        updateExerciseWithEncryption(res.exercise);
        updateAudio(res.audio);
        toast.success(t("Listening exercise regenerated successfully"));
    };

    const generateQuestions = async () => {
        const generatorRequest = handleGetGeneratorRequest();
        const level = determineLevel(generatorRequest.level);
        if (selectedCategory === "listening") {
            console.log(articleScript);
            const res2 = await generateListeningExercise({ script: articleScript, level: level });
            const jsonData2 = decrypt(res2);
            exerciseDispatch({
                type: "SET_EXERCISE_CONTENT",
                payload: jsonData2.payload as IExerciseContentJsonData,
            });
            toast.success(t("Listening questions generated successfully"));
            return;
        }
        if (selectedCategory === "reading") {
            const res = await generateReadingExercise({
                ...generatorRequest,
                title: "Generated Exercise",
                article: articleScript.replace(/(\r\n|\n|\r)/gm, ""),
                level: level,
            });
            const jsonData = decrypt(res);
            exerciseDispatch({
                type: "SET_EXERCISE_CONTENT",
                payload: jsonData.payload as IExerciseContentJsonData,
            });
            toast.success(t("Reading questions generated successfully"));
        }
    };

    const generateAudio = async () => {
        const generatorRequest = handleGetGeneratorRequest();
        if (!articleScript.trim()) {
            toast.error(t("Please enter a script to generate audio"));
            return;
        }
        const res = await generateListeningAudio({
            ...generatorRequest,
            script: articleScript,
            gender: ["male", "male", "male"],
            intro: true,
            autogender: true,
        });
        updateAudio(res);
        toast.success(t("Audio generated successfully"));
    };

    const onGenerateClick = async (generatorRequest: GeneratorParams, files: File[]) => {
        if (user?.id === "" || !user) {
            toast.info(t("Please login to access this feature."));
            return;
        }
        setAudioPath(null);
        await runWithLoading(async () => {
            await generateByCategory(generatorRequest, files);
        });
    };

    const onRegenerateExerciseClick = async () => {
        await runWithLoading(async () => {
            if (selectedCategory === "reading") {
                await regenerateReadingExercise();
            } else if (selectedCategory === "listening") {
                await regenerateListeningExercise();
            } else {
                toast.error(t("Regeneration not supported for this exercise type"));
            }
        });
    };

    const onGenerateQuestionsClick = async () => {
        await runWithLoading(async () => {
            await generateQuestions();
        });
    };

    const onGenerateAudioClick = async () => {
        setAudioLoading(true);
        try {
            await generateAudio();
            // Refetch token after successful audio generation if plugin is enabled
            if (tokenContext) {
                await tokenContext.refetchToken();
            }
        } catch (e) {
            console.error(e);
            toast.error(t("Failed to generate audio. Please try again."));
        } finally {
            setAudioLoading(false);
        }
    };

    const handleGetGeneratorRequest = (): GeneratorParams => {
        if (!aiTextAreaRef.current) {
            return {
                category: "reading",
                level: "P6",
                theme: "",
                hasTFNG: false,
                hasSQ: false,
                hasFitB: false,
                model: "gpt-4o",
                script: "",
                speed: 1,
                selected_exercise_id: "1",
                totalNumOfQ: 5,
                hasExample: false,
                word_count: 250,
                prompt: "",
                article: "",
                questionTypes: ["mcq"],
                remarks: "",
            };
        } else {
            return aiTextAreaRef.current?.getValues();
        }
    };

    const downloadAudio = () => {
        if (!audioPath) {
            toast.error(t("Audio not available. Please generate listening audio first."));
            return;
        }
        const downloadLink = document.createElement("a");
        downloadLink.href = audioPath;
        downloadLink.download = "listening_audio.mp3";
        downloadLink.click();
    };

    // Helper function to map category names for exercise info dialog
    const mapCategoryForDialog = (category: string): string => {
        switch (category) {
            case "grammar-templates":
                return "grammar";
            case "grammar-mixed-tenses":
                return "grammar";
            case "freestyle":
                return "combined";
            default:
                return category;
        }
    };

    // Thumbnail generation function
    const onGenerateThumbnailClick = async () => {
        setThumbnailModalOpened(true);

        // Wait a bit for modal to render and content to be available
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (!thumbnailRef.current) {
            alert("Error: Reference to content is null");
            return;
        }

        try {
            // Wait for content to be fully rendered
            await new Promise((resolve) => setTimeout(resolve, 800));

            console.log(thumbnailRef.current);
            // Try to find the actual component element within the container
            const canvas = await html2canvas(thumbnailRef.current, {
                allowTaint: true,
                useCORS: true,
                scale: 1,
                backgroundColor: "#ffffff",
                removeContainer: false,
                logging: false,
                imageTimeout: 0,
            });

            const dataURL = canvas.toDataURL("image/png", 1.0); // Maximum quality
            return dataURL;
        } catch (error) {
            console.error("Error generating thumbnail:", error);
            throw new Error("Thumbnail generation failed");
        } finally {
            setThumbnailModalOpened(false); // Close the modal after generating thumbnail
        }
    };

    // Exercise creation function
    const onCompletedGenerateExerciseClicked = async (data: ExerciseInfoDto) => {
        try {
            setLoading(true); // Show loading animation
            setExerciseInfoDialog(false); // Close the dialog after completion

            const thumbnail = await onGenerateThumbnailClick();
            console.log("Generated thumbnail:", thumbnail);

            const exerciseDataWithScript = {
                ...exerciseData,
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

    useEffect(() => {
        if (selectedCategory === "listening") {
            updateExercise(exerciseData);
        }
    }, [articleScript]);

    return (
        <UploadJsonPluginContext.Provider
            value={{
                exerciseDispatch,
                setExercises,
                setCurrentExerciseIndex,
                t,
            }}
        >
            <BaseGeneratorContext.Provider value={{ jsonContent: exerciseData, jsonDispatch: exerciseDispatch }}>
                <DownloadJsonPluginContext.Provider
                    value={{
                        currentExercise: exerciseData,
                        allExercises: exercises,
                        currentExerciseIndex: currentExerciseIndex,
                        selectedCategory,
                        articleScript,
                        updateCurrentExerciseInArray,
                    }}
                >
                    <div className="mb-8 relative px-2 md:px-6 h-full w-full flex flex-col justify-center items-center">
                        <div className="relative max-w-[240mm] mx-auto rounded-md pt-12 w-full px-2 md:px-6">
                            {audioPath && (
                                <audio
                                    key={audioPath} // Force remount when URL changes
                                    className="w-full mt-4"
                                    controls
                                    src={audioPath}
                                >
                                    {t("Your browser does not support the audio element.")}
                                </audio>
                            )}
                            {exerciseData && Object.keys(exerciseData).length > 0 && (
                                <div className="flex gap-4 justify-end w-full my-2 mt-4 flex-wrap">
                                    <div className="flex gap-2">
                                        {setHeaderImagePlugin}
                                        {audioPath && (
                                            <Button
                                                size="xs"
                                                variant="default"
                                                leftSection={<IconDownload size={16} />}
                                                onClick={downloadAudio}
                                                className=""
                                                classNames={{ label: "font-medium" }}
                                                title={t("Download audio")}
                                            >
                                                {t("Audio")}
                                            </Button>
                                        )}
                                        <DownloadHomeworkPdfPlugin
                                            onLoadingChange={(loading) => setIsGeneratingPdf(loading)}
                                            buttonProps={{
                                                size: "xs",
                                                variant: "outline",
                                                color: "aceBlue",
                                                disabled: isGeneratingPdf,
                                            }}
                                            buttonText="Exercise"
                                            isSolution={false}
                                        />
                                        <DownloadHomeworkPdfPlugin
                                            onLoadingChange={(loading) => setIsGeneratingPdf(loading)}
                                            buttonProps={{
                                                size: "xs",
                                                variant: "filled",
                                                color: "aceBlue",
                                                disabled: isGeneratingPdf,
                                            }}
                                            buttonText="Solution"
                                            isSolution={true}
                                        />
                                        {explanationPlugin}
                                        {downloadJsonPlugin}
                                        {uploadJsonPlugin}
                                        {user?.id && (
                                            <CompleteExercisePluginContext.Provider
                                                value={{
                                                    onGenerateThumbnailClick,
                                                    articleScript,
                                                    audioPath,
                                                }}
                                            >
                                                {completeExercisePlugin}
                                            </CompleteExercisePluginContext.Provider>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="relative max-w-[220mm]">{memoizedPanelComponent}</div>
                        </div>

                        <div className="sticky bottom-5 z-10 w-full px-4 mt-20">
                            <AITextArea
                                onSubmitClick={onGenerateClick}
                                tensesOptions={grammarTenses}
                                templateOptions={grammarTypes}
                                t={t}
                                className="shadow-xl mx-auto"
                                onCategoryChange={setSelectedCategory}
                                defaultCategory={selectedCategory}
                                ref={aiTextAreaRef}
                                isLoading={loading}
                            />
                        </div>
                        {!isSideMenuOpen && user?.id && (
                            <>
                                <Affix position={{ top: 200, right: 20 }} zIndex={50}>
                                    <ActionIcon
                                        color="aceBlue"
                                        radius="xl"
                                        size={48}
                                        onClick={() => setIsSideMenuOpen(true)}
                                        title={t("Advanced Settings")}
                                    >
                                        <IconAdjustmentsHorizontal size={24} />
                                    </ActionIcon>
                                </Affix>
                                {tokenPlugin && (
                                    <Affix position={{ top: 260, right: 20 }} zIndex={50}>
                                        {tokenPlugin}
                                    </Affix>
                                )}
                            </>
                        )}

                        <GeneratorSidebar
                            opened={isSideMenuOpen}
                            onClose={() => setIsSideMenuOpen(false)}
                            articleScript={articleScript}
                            setArticleScript={setArticleScript}
                            selectedCategory={selectedCategory}
                            loading={loading}
                            articleLoading={loading}
                            audioLoading={audioLoading}
                            onGenerateAudioClick={onGenerateAudioClick}
                            onRegenerateArticleScriptClick={onRegenerateExerciseClick}
                            onGenerateQuestionsClick={onGenerateQuestionsClick}
                            t={t}
                        />

                        {/* Exercise Info Dialog for completing exercise creation */}
                        {exerciseInfoDialog && (
                            <ExerciseInfoDialog
                                opened={exerciseInfoDialog}
                                onClose={() => setExerciseInfoDialog(false)}
                                data={{
                                    title: exerciseData?.title ?? "",
                                    category: mapCategoryForDialog(selectedCategory ?? ""),
                                    grades: [],
                                    welcomeExercise: false,
                                }}
                                t={t}
                                isCreating={true}
                                onSubmit={onCompletedGenerateExerciseClicked}
                            />
                        )}

                        {/* Thumbnail generation modal - hidden but needed for html2canvas */}
                        <Modal
                            opened={thumbnailModalOpened}
                            onClose={() => setThumbnailModalOpened(false)}
                            title="Generating Thumbnail..."
                            size="auto"
                            closeOnClickOutside={false}
                            closeOnEscape={false}
                        >
                            <h2>Saving Exercise and Generating thumbnail</h2>
                            <div
                                ref={thumbnailRef}
                                style={{
                                    width: "794px",
                                    height: "1123px",
                                    backgroundColor: "#ffffff",
                                    margin: "0 auto",
                                    border: "1px solid #e0e0e0",
                                    overflow: "auto",
                                    padding: "20px",
                                }}
                            >
                                <ExerciseContentTemplate
                                    data={exerciseData}
                                    utilityDispatch={exerciseDispatch}
                                    isExerciseView={true}
                                    showUtility={false}
                                    showMarkingUtility={false}
                                    isViewMarking={false}
                                    handleUpdate={() => {}}
                                    logoSize={18}
                                    logoUrl={logoUrl}
                                    headerText={headerText}
                                />
                            </div>
                        </Modal>
                    </div>
                </DownloadJsonPluginContext.Provider>
            </BaseGeneratorContext.Provider>
        </UploadJsonPluginContext.Provider>
    );
};

export const GeneratorCorePage = ({
    explanationPlugin,
    downloadJsonPlugin,
    tokenPlugin,
    uploadJsonPlugin,
    completeExercisePlugin,
    setHeaderImagePlugin,
}: GeneratorPageProps) => {
    return (
        <TokenPluginProvider>
            <Page
                explanationPlugin={explanationPlugin}
                downloadJsonPlugin={downloadJsonPlugin}
                tokenPlugin={tokenPlugin}
                uploadJsonPlugin={uploadJsonPlugin}
                completeExercisePlugin={completeExercisePlugin}
                setHeaderImagePlugin={setHeaderImagePlugin}
            />
        </TokenPluginProvider>
    );
};
