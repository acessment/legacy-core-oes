import { ActionIcon, MultiSelect, NumberInput, Select, Textarea, Tooltip, Collapse, TextInput } from "@mantine/core";
import {
    IconArrowRight,
    IconWorld,
    IconCategory,
    IconPlus,
    IconCircleMinus,
    IconPaperclip,
    IconChevronDown,
} from "@tabler/icons-react";
import { useImmerReducer } from "use-immer";
import type { OptionType } from "@/types";
import { AITextAreaReducer } from "./AITextAreaReducer";
import { getAITextAreaConfig } from "./getAITextAreaConfig";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDebouncedValue } from "@mantine/hooks";
import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import { clsx } from "clsx";
import { gradeOptions } from "@/feature/account";
import { categoryOptions, questionTypeOptions } from "@/types";
import type { TFunction } from "i18next";
import { GeneratorParams } from "@/feature/generator";

interface AITextAreaProps {
    className?: string;
    tensesOptions?: OptionType[];
    templateOptions?: OptionType[];
    onSubmitClick: (generatorRequest: GeneratorParams, files: File[]) => void;
    t: TFunction;
    defaultCategory?: string;
    onCategoryChange?: (category: string) => void;
    isLoading?: boolean;
}

export interface AITextAreaRef {
    getValues: () => GeneratorParams;
}

export const AITextArea = forwardRef<AITextAreaRef, AITextAreaProps>(
    (
        { className, tensesOptions, templateOptions, onSubmitClick, t, onCategoryChange, defaultCategory, isLoading },
        ref
    ) => {
        const initialGenReq: GeneratorParams = {
            category: defaultCategory || "reading",
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

        const [generatorRequest, generatorRequestDispatch] = useImmerReducer(AITextAreaReducer, initialGenReq);

        const [localPrompt, setLocalPrompt] = useState("");
        const [debouncedPrompt] = useDebouncedValue(localPrompt, 400);
        const [images, setImages] = useState<File[]>([]);
        const [isCollapsed, setIsCollapsed] = useState(false);
        const fileInputRef = useRef<HTMLInputElement | null>(null);

        // Clear all uploaded/selected images (used when category changes)
        const clearImages = () => {
            if (images.length > 0) setImages([]);
        };

        useEffect(() => {
            if (debouncedPrompt !== generatorRequest.prompt) {
                generatorRequestDispatch({
                    type: "SET_PROMPT",
                    payload: debouncedPrompt,
                });
            }
        }, [debouncedPrompt, generatorRequest.prompt, generatorRequestDispatch]);

        useImperativeHandle(
            ref,
            () => ({
                getValues: () => generatorRequest,
            }),
            [generatorRequest]
        );

        const config = getAITextAreaConfig(generatorRequest.category);

        // Memoized image previews to optimize performance
        const renderImagePreviews = useMemo(() => {
            if (images.length === 0) return null;

            return (
                <div className="flex flex-wrap gap-2 my-2">
                    {images.map((file, idx) => {
                        const url = URL.createObjectURL(file);
                        return (
                            <div
                                key={idx}
                                className="relative w-20 h-20 border border-slate-200 rounded overflow-hidden flex items-center justify-center bg-white group"
                            >
                                <img
                                    src={url}
                                    alt={file.name}
                                    className="object-contain w-full h-full"
                                    onLoad={() => URL.revokeObjectURL(url)}
                                />
                                <ActionIcon
                                    variant="light"
                                    color="red"
                                    size="sm"
                                    className="!absolute top-0 right-0 bg-red-100! opacity-80! hover:opacity-100!"
                                    aria-label={t("Remove image")}
                                    onClick={() => setImages((images) => images.filter((_, i) => i !== idx))}
                                >
                                    <IconCircleMinus size={16} />
                                </ActionIcon>
                            </div>
                        );
                    })}
                </div>
            );
        }, [images, t]);

        return (
            <div
                className={clsx(
                    "border border-gray-200 p-4 rounded-xl bg-slate-50 min-w-[300px] w-full max-w-[1000px] grid grid-cols-1 gap-1",
                    className
                )}
            >
                {renderImagePreviews}
                <Dropzone
                    unstyled
                    accept={IMAGE_MIME_TYPE}
                    maxSize={15 * 1024 ** 2}
                    onDrop={(files) => {
                        setImages((prev) => [...prev, ...files]);
                        generatorRequestDispatch({ type: "SET_CATEGORY", payload: "freestyle" });
                    }}
                    activateOnClick={false}
                >
                    <div className="flex w-full gap-2 justify-between items-center">
                        <div className="flex gap-2">
                            <Tooltip label={isCollapsed ? t("Expand") : t("Collapse")}>
                                <ActionIcon
                                    size="md"
                                    radius="xl"
                                    variant={"subtle"}
                                    color={"gray"}
                                    className="border-none! outline-none!"
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                >
                                    <IconChevronDown
                                        size={16}
                                        className={`transition-transform duration-200 ${
                                            isCollapsed ? "rotate-180" : ""
                                        }`}
                                    />
                                </ActionIcon>
                            </Tooltip>
                            {config?.showInternet && (
                                <Tooltip label={t("Use internet resources")}>
                                    <ActionIcon
                                        size="md"
                                        radius="xl"
                                        variant={"subtle"}
                                        color={generatorRequest.model === "sonar" ? "aceBlue" : "gray"}
                                        onClick={() => generatorRequestDispatch({ type: "TOGGLE_MODEL" })}
                                        className="border-none! outline-none!"
                                    >
                                        <IconWorld />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                            <Tooltip label={t("Upload images")}>
                                <ActionIcon
                                    size="md"
                                    radius="xl"
                                    variant={"subtle"}
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="Attach file"
                                    color={"gray"}
                                    className="border-none! outline-none!"
                                >
                                    <IconPaperclip />
                                </ActionIcon>
                            </Tooltip>
                        </div>

                        <input
                            type="file"
                            accept={IMAGE_MIME_TYPE.join(",")}
                            multiple
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length > 0) {
                                    setImages((prev) => [...prev, ...files]);
                                    generatorRequestDispatch({ type: "SET_CATEGORY", payload: "freestyle" });
                                }
                                // Reset input so same file can be selected again
                                e.target.value = "";
                            }}
                        />
                        <Select
                            className="font-medium! group"
                            classNames={{ input: "text-center!" }}
                            variant="unstyled"
                            data={categoryOptions}
                            value={generatorRequest.category}
                            onChange={(value) => {
                                const newCategory = value || "reading";
                                if (newCategory !== generatorRequest.category) {
                                    clearImages();
                                }
                                onCategoryChange?.(newCategory);
                                generatorRequestDispatch({ type: "SET_CATEGORY", payload: newCategory });
                            }}
                            placeholder={t("Category")}
                            size={"sm"}
                            rightSection={
                                <IconCategory
                                    size={20}
                                    className="text-aceBlue group-hover:scale-110! transition duration-200"
                                />
                            }
                            comboboxProps={{ position: "top", middlewares: { flip: false, shift: false } }}
                        />
                    </div>
                    <Collapse in={!isCollapsed}>
                        <TextInput
                            placeholder={
                                generatorRequest.category === "freestyle"
                                    ? t(
                                          "Drop images for exercise cloning or enter your prompt here... eg: 'Generate a reading comprehension passage about...'"
                                      )
                                    : t(
                                          "Theme of your exercise... eg: 'Technology', 'Culture', 'A short story about being late at school' OR Drop an image for exercise cloning."
                                      )
                            }
                            variant="unstyled"
                            value={localPrompt}
                            onChange={(event) => setLocalPrompt(event.currentTarget.value)}
                        />
                        {config?.showQuestionTypes && (
                            <MultiSelect
                                placeholder={t("Question Types")}
                                data={questionTypeOptions}
                                value={generatorRequest.questionTypes}
                                onChange={(value) => {
                                    generatorRequestDispatch({
                                        type: "SET_QUESTION_TYPES",
                                        payload: value,
                                    });
                                }}
                                variant="unstyled"
                                comboboxProps={{
                                    position: "top",
                                    middlewares: { flip: false, shift: false },
                                }}
                                classNames={{
                                    pill: "!bg-aceBlue text-white!",
                                    wrapper: "px-0! mx-0!",
                                    section: "px-0! mx-0!",
                                }}
                                rightSection={
                                    <IconPlus size={20} className="group-hover:scale-125 transition duration-200" />
                                }
                                leftSectionPointerEvents="none"
                                className="group"
                            />
                        )}

                        {config?.showTenses && (
                            <MultiSelect
                                placeholder={t("Select tenses")}
                                data={tensesOptions || [t("Present Simple"), t("Past Simple"), t("Present Perfect")]}
                                variant="unstyled"
                                comboboxProps={{
                                    position: "top",
                                    middlewares: { flip: false, shift: false },
                                }}
                                classNames={{
                                    pill: "!bg-aceBlue text-white!",
                                }}
                                rightSection={
                                    <IconPlus size={20} className="group-hover:scale-125 transition duration-200" />
                                }
                                onChange={(value) =>
                                    generatorRequestDispatch({ type: "SET_TENSES", payload: value.map(Number) })
                                }
                                className="group"
                            />
                        )}

                        <div className="flex items-end gap-2 w-full mt-1">
                            {config?.showLevel && (
                                <Select
                                    className=""
                                    data={gradeOptions.slice(0, -1)}
                                    radius="xl"
                                    value={generatorRequest.level}
                                    onChange={(value) =>
                                        generatorRequestDispatch({
                                            type: "SET_LEVEL",
                                            payload: value || "",
                                        })
                                    }
                                    description={t("Level")}
                                    variant="filled"
                                    size="xs"
                                    comboboxProps={{ position: "top", middlewares: { flip: false, shift: false } }}
                                />
                            )}
                            {config?.showQuestionCount && (
                                <NumberInput
                                    placeholder={t("No. of questions")}
                                    description={t("Question Count")}
                                    radius="xl"
                                    value={generatorRequest.totalNumOfQ}
                                    onChange={(value) =>
                                        generatorRequestDispatch({
                                            type: "SET_TOTAL_NUM_OF_Q",
                                            payload: Number(value) || 5,
                                        })
                                    }
                                    variant="filled"
                                    className=""
                                    max={40}
                                    min={5}
                                    size={"xs"}
                                />
                            )}
                            {config?.showWordCount && (
                                <NumberInput
                                    placeholder={t("Word Count")}
                                    radius={"xl"}
                                    value={generatorRequest.word_count}
                                    onChange={(value) =>
                                        generatorRequestDispatch({
                                            type: "SET_WORD_COUNT",
                                            payload: Number(value) || 0,
                                        })
                                    }
                                    variant="filled"
                                    size="xs"
                                    description={t("Word Count")}
                                    className=""
                                    step={50}
                                />
                            )}
                            {config?.showTemplates && (
                                <Select
                                    data={templateOptions || ["Loading templates..."]}
                                    value={generatorRequest.selected_exercise_id.toString()}
                                    onChange={(value) =>
                                        generatorRequestDispatch({
                                            type: "SET_SELECTED_EXERCISE_ID",
                                            payload: value || "",
                                        })
                                    }
                                    size="xs"
                                    variant="filled"
                                    radius="xl"
                                    description={t("Templates")}
                                    comboboxProps={{ position: "top", middlewares: { flip: false, shift: false } }}
                                ></Select>
                            )}
                            {config?.showSpeed && (
                                <NumberInput
                                    step={0.1}
                                    placeholder={t("Speed")}
                                    radius={"xl"}
                                    value={generatorRequest.speed}
                                    onChange={(value) =>
                                        generatorRequestDispatch({
                                            type: "SET_SPEED",
                                            payload: Number(value) || 0,
                                        })
                                    }
                                    variant="filled"
                                    size="xs"
                                    description={t("audio speed")}
                                    className=""
                                />
                            )}
                            <ActionIcon
                                color="aceBlue"
                                radius={"xl"}
                                variant="light"
                                className="ml-auto hover:scale-110 transition duration-200"
                                loading={isLoading}
                                onClick={() => onSubmitClick(generatorRequest, images)}
                            >
                                <IconArrowRight />
                            </ActionIcon>
                        </div>
                    </Collapse>
                </Dropzone>
            </div>
        );
    }
);

AITextArea.displayName = "AITextArea";
