import React, { useState } from "react";
import ToolBoxButton from "./ToolBoxButton";
import { QuestionTypeEnum } from "../../type";
import { useTranslation } from "react-i18next";
import { UtilityAction } from "../../reducer/actionTypes";
import clsx from "clsx";

interface ToolBoxProps {
    questionIndex: number;
    questionType: QuestionTypeEnum;
    utilityDispatch: React.Dispatch<UtilityAction>;
    className?: string;
}

const ToolBox: React.FC<ToolBoxProps> = ({
    questionIndex,
    questionType,
    utilityDispatch,
    className
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const {t} = useTranslation();
    return (
        <div className="relative">
            <div className={clsx("z-100 flex flex-col gap-1 py-2 items-center justify-center absolute px-2 bg-gray-200 -right-[32px] rounded-r-md", className || "")}>
                <ToolBoxButton
                    className="hover:scale-110"
                    icon={
                        <svg
                            className="w-4 h-4 text-gray-800"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                        >
                            <path d="M286.67-160v-533.33H80V-800h520v106.67H393.33V-160H286.67Zm360 0v-333.33H520V-600h360v106.67H753.33V-160H646.67Z" />
                        </svg>
                    }
                    onClick={() => 
                        utilityDispatch({ 
                            type: 'ADD_FITB_COMPONENT', 
                            payload: { 
                                fitbIndex: questionIndex, 
                                position: -1, 
                                componentType: "text" 
                            } 
                        })
                    }
                    enabled={true}
                    visible={questionType === "fitB"}
                    tooltip={t("Add Text")}
                />
                <ToolBoxButton
                    className="hover:scale-110"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                            className="w-4 h-4 text-gray-800"
                        >
                            <path d="M160-360v-240h66.67v173.33h506.66V-600H800v240H160Z" />
                        </svg>
                    }
                    onClick={() => 
                        utilityDispatch({ 
                            type: 'ADD_FITB_COMPONENT', 
                            payload: { 
                                fitbIndex: questionIndex, 
                                position: -1, 
                                componentType: "blank" 
                            } 
                        })
                    }
                    enabled={true}
                    visible={questionType === "fitB"}
                    tooltip={t("Add Blank")}
                />
                <ToolBoxButton
                    className="hover:scale-110"
                    icon={
                        <svg
                            className="w-4 h-4 text-gray-800"
                            viewBox="0 0 63 63"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M60.4632 31.4498C60.4632 47.474 47.473 60.4641 31.4489 60.4641C15.4247 60.4641 2.43457 47.474 2.43457 31.4498C2.43457 15.4257 15.4247 2.43555 31.4489 2.43555C47.473 2.43555 60.4632 15.4257 60.4632 31.4498Z"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M31.4491 38.0403V37.6462C31.4491 34.7141 32.9941 32.8683 35.5149 31.3706L36.6043 30.7234C39.1902 29.1871 40.7751 26.402 40.7751 23.3942C40.7751 18.6859 36.9583 14.8691 32.25 14.8691H31.4491C26.2985 14.8691 22.123 19.0445 22.123 24.1952V24.7218"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M31.4492 45.541V47.199"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    }
                    onClick={() => utilityDispatch({ type: 'ADD_TFNG_STATEMENT', payload: { tfngIndex:questionIndex } })}
                    enabled={true}
                    visible={questionType === "tfng"}
                    tooltip={t("Add TFNG Statement")}
                />
                <ToolBoxButton
                    className="hover:scale-110"
                    icon={
                        <svg
                            className="w-4 h-4 text-gray-800"
                            viewBox="0 0 63 63"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="31.6049"
                                cy="31.6049"
                                r="29.8549"
                                stroke="currentColor"
                                strokeWidth="3.5"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="22"
                                fill="currentColor"
                            />
                        </svg>
                    }
                    onClick={() => utilityDispatch({ type: 'ADD_MCQ_OPTION', payload: { mcqIndex: questionIndex } })}
                    enabled={true}
                    visible={questionType === "mcq"}
                    tooltip={t("Add MCQ Option")}
                />
                <ToolBoxButton
                    className={`hover:scale-110`}
                    icon={
                        <svg
                            className={`w-4 h-4 text-gray-800 transition-all ${
                                showMenu
                                    ? "!text-ace-blue rotate-90 duration-200"
                                    : ""
                            }`}
                            viewBox="0 0 64 64"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="31.6049"
                                cy="31.6049"
                                r="29.8549"
                                stroke="currentColor"
                                strokeWidth="3.5"
                            />
                            <path
                                d="M31.6629 16V49M17 32.28H46"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                    }
                    onClick={() => setShowMenu((prev) => !prev)}
                    enabled={true}
                    visible={true}
                    tooltip={t("Add Question")}
                    menuContent={
                        <div>
                            <p
                                className="font-bold mb-2 text-sm "
                                style={{
                                    fontFamily: "alegreya sans, sans-serif",
                                }}
                            >
                                {t("Add New Question")}
                            </p>
                            <div className="flex flex-col justify-start items-start">
                                {[
                                    { type: "mcq" as QuestionTypeEnum, label: "MCQ" },
                                    { type: "tfng" as QuestionTypeEnum, label: "TFNG" },
                                    { type: "sq" as QuestionTypeEnum, label: "Short Question" },
                                    { type: "fitB" as QuestionTypeEnum, label: "Fill in the Blanks" },
                                    { type: "instruction" as QuestionTypeEnum, label: "Instruction/ Text" }
                                ].map(({ type, label }) => (
                                    <button
                                        key={type}
                                        className="cursor-pointer text-left text-sm hover:bg-gray-100 p-1"
                                        onClick={() => {
                                            utilityDispatch({ 
                                                type: 'ADD_QUESTION', 
                                                payload: { 
                                                    questionIndex: questionIndex, 
                                                    questionType: type 
                                                } 
                                            });
                                        }}
                                        style={{
                                            fontFamily: "alegreya sans, sans-serif",
                                        }}
                                    >
                                        {t(label)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default ToolBox;
