import { IFitBQuestion, IMQuestionProps } from "../../type";
import { useEffect, useState } from "react";
import DeleteSubComponentButton from "../questionUtilities/DeleteSubComponentButton";
import { IconABOff, IconCheck, IconX } from "@tabler/icons-react";
import MarkingUtility from "../questionUtilities/MarkingUtility";
import clsx from "clsx";
import { ActionIcon } from "@mantine/core";
import { ExplanationText } from "../ExplanationText";
import { useFitBAllCorrect } from "../../hook/useFitBAllCorrect";

interface Props extends IMQuestionProps {
    question: IFitBQuestion;
    index: number;
    handleUpdate: (e: React.FocusEvent<HTMLElement>, val?: string, isInnerHTML?: boolean) => void;
    showUtility?: boolean;
    showMarkingUtility?: boolean;
    isExerciseView?: boolean;
    isViewMarking?: boolean;
    utilityDispatch: React.Dispatch<any>;
}

const MFitBQuestion = ({
    question,
    index,
    handleUpdate,
    showUtility,
    showMarkingUtility,
    isExerciseView,
    isViewMarking,
    utilityDispatch,
}: Props) => {
    const tracingBase = "questions-" + index + "-question";
    const [tracingIdSuffix, setTracingIdSuffix] = useState<string>(
        isExerciseView
            ? "-student_answer"
            : showMarkingUtility
            ? "-student_answer"
            : "-text"
    );

    useEffect(() => {
        setTracingIdSuffix(
            isExerciseView
                ? "-student_answer"
                : showMarkingUtility
                ? "-student_answer"
                : "-text"
        );
    }, [isExerciseView, showMarkingUtility]);

    const is_correct = useFitBAllCorrect(question.question);
    
    return (
        <div>
            {question.question.map((blankText, i) => {
                if (blankText.type === "text") {
                    return (
                        <>
                            <span
                                contentEditable={showUtility}
                                key={i}
                                id={`${tracingBase}-${i}-text`}
                                className="focus:outline-hidden focus:border-b focus:border-blue-500"
                                onBlur={(e) => {
                                    handleUpdate(e, undefined, true);
                                }}
                                suppressContentEditableWarning={true}
                                dangerouslySetInnerHTML={{
                                    __html: blankText.text,
                                }}
                            ></span>
                            {showUtility && (
                                <DeleteSubComponentButton
                                    className="text-red-500 inline-flex! align-middle!"
                                    onClick={() =>
                                        utilityDispatch({
                                            type: "DELETE_FITB_COMPONENT",
                                            payload: {
                                                fitbIndex: index,
                                                position: i,
                                            },
                                        })
                                    }
                                />
                            )}
                        </>
                    );
                } else if (blankText.type === "blank") {
                    return (
                        <span className="px-1">
                            <span className="font-medium">
                                {(blankText as { _questionNumber?: number })._questionNumber || i + 1}.{" "}
                            </span>
                            <span
                                contentEditable={showUtility || (isExerciseView && !blankText.is_example)}
                                className={clsx(
                                    "short-answer-line focus:outline-hidden focus:ring-1 focus:ring-blue-500",
                                    (showMarkingUtility || isViewMarking) &&
                                        (blankText.is_example
                                            ? "text-slate-500"
                                            : blankText.is_correct
                                            ? "text-green-600!"
                                            : "text-red-600!"),
                                    blankText.is_example && "text-slate-500"
                                )}
                                id={`${tracingBase}-${i}${tracingIdSuffix}`}
                                onBlur={(e) => {
                                    if (isExerciseView) {
                                        utilityDispatch({
                                            type: "SET_ANSWER",
                                            payload: {
                                                tracingId: e.target.id,
                                                student_answer: e.currentTarget.textContent || "",
                                            },
                                        });
                                    } else if (showUtility) {
                                        handleUpdate(e);
                                    }
                                }}
                                suppressContentEditableWarning={true}
                            >
                                {
                                    blankText.is_example
                                        ? blankText.text
                                        : (isExerciseView && blankText.student_answer) || // in exercise view we show the student's answer
                                          ((showMarkingUtility || isViewMarking) && blankText.student_answer) || // in marking mode we show the student's answer
                                          (showUtility && !showMarkingUtility && blankText.text) // in edit mode we show the correct answer
                                }
                            </span>
                            {(showMarkingUtility || isViewMarking) && (
                                <span
                                    id={tracingBase + "-" + i + "-text"}
                                    contentEditable={showUtility}
                                    className={clsx("bg-green-100 text-green-900")}
                                    onBlur={(e) => handleUpdate(e)}
                                >
                                    {blankText.text}
                                </span>
                            )}
                            {showUtility && (
                                <>
                                    <DeleteSubComponentButton
                                        onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                                        className="inline-flex px-1 text-red-500"
                                        questionIndex={index}
                                        itemKey={i}
                                        onClick={() =>
                                            utilityDispatch({
                                                type: "DELETE_FITB_COMPONENT",
                                                payload: {
                                                    fitbIndex: index,
                                                    position: i,
                                                },
                                            })
                                        }
                                    />
                                    <ActionIcon
                                        variant="subtle"
                                        color="yellow"
                                        onClick={() =>
                                            utilityDispatch({
                                                type: "TOGGLE_FITB_BLANK_EXAMPLE",
                                                payload: {
                                                    fitbIndex: index,
                                                    position: i,
                                                },
                                            })
                                        }
                                    >
                                        <IconABOff size={12} />
                                    </ActionIcon>
                                </>
                            )}
                            {showMarkingUtility && (
                                <MarkingUtility
                                    tracingId={`${tracingBase}-${i}-is_correct`}
                                    utilityDispatch={utilityDispatch}
                                    className="inline-flex align-middle"
                                    size={16}
                                />
                            )}
                            {blankText.explanation_text && !blankText.is_correct && (showUtility || isViewMarking) && (
                                <span
                                    id={`${tracingBase}-${i}-explanation_text`}
                                    key={i}
                                    contentEditable={showUtility}
                                    className="italic border border-red-500 text-red-500"
                                    suppressContentEditableWarning={true}
                                    onBlur={handleUpdate}
                                >
                                    {blankText.explanation_text}
                                </span>
                            )}
                        </span>
                    );
                } else if (blankText.type === "explanation" && blankText.text && (showUtility || isViewMarking)) {
                    return (
                        <span
                            key={i}
                            contentEditable={showUtility}
                            className="italic border border-red-500 text-red-500"
                            suppressContentEditableWarning={true}
                            onBlur={handleUpdate}
                            id={`${tracingBase}-${i}-text`}
                        >
                            {blankText.text}
                        </span>
                    );
                }
                return null;
            })}
            <ExplanationText
                content={question.explanation_text}
                is_correct={is_correct ?? false}
                showUtility={showUtility}
                isViewMarking={isViewMarking}
                id={`questions-${index}-explanation_text`}
                handleUpdate={handleUpdate}
            />
        </div>
    );
};
export default MFitBQuestion;
