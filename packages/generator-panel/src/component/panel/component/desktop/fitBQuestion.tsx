import { IFitBQuestion, IFitBQuestionSeq } from "../../type";
import DeleteSubComponentButton from "../questionUtilities/DeleteSubComponentButton";
import clsx from "clsx";
import { UtilityAction } from "../../reducer/actionTypes";
import { useEffect, useState } from "react";
import MarkingUtility from "../questionUtilities/MarkingUtility";
import { ActionIcon } from "@mantine/core";
import { IconABOff } from "@tabler/icons-react";
import { ExplanationText } from "../ExplanationText";
import { useFitBAllCorrect } from "../../hook/useFitBAllCorrect";

interface Props {
    index: number;
    handleUpdate: (e: React.FocusEvent<HTMLElement>) => void;
    question: IFitBQuestion;
    isExerciseView?: boolean;
    isViewMarking?: boolean;
    isSolution?: boolean;
    dragHandleProps?: React.HTMLAttributes<HTMLElement>;
    showUtility: boolean;
    showMarkingUtility?: boolean;
    utilityDispatch: React.Dispatch<UtilityAction>;
}

const FitBQuestion = (props: Props) => {
    const {
        index,
        handleUpdate,
        question,
        isExerciseView,
        isViewMarking,
        dragHandleProps,
        showUtility,
        showMarkingUtility,
        utilityDispatch,
    } = props;

    const tracingBase = "questions-" + index + "-question";
    const [tracingIdSuffix, setTracingIdSuffix] = useState<string>(
        isExerciseView ? "-student_answer" : showMarkingUtility ? "-student_answer" : "-text"
    );

    useEffect(() => {
        setTracingIdSuffix(isExerciseView ? "-student_answer" : showMarkingUtility ? "-student_answer" : "-text");
    }, [isExerciseView, showMarkingUtility]);

    const is_correct = useFitBAllCorrect(question.question);

    return (
        <div className={""}>
            <div className={`question`}>
                {question.question?.map((blankText: IFitBQuestionSeq, i: number) => {
                    if (blankText.type === "text") {
                        return (
                            <>
                                <span
                                    key={i}
                                    contentEditable={showUtility}
                                    className="focus:outline-hidden focus:ring-1 focus:ring-blue-500 h-[1.5em]"
                                    id={`${tracingBase}-${i}-text`}
                                    onBlur={(e) => handleUpdate(e)}
                                    suppressContentEditableWarning={true}
                                    dangerouslySetInnerHTML={{
                                        __html: blankText.text,
                                    }}
                                ></span>
                                {showUtility && (
                                    <DeleteSubComponentButton
                                        onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                                        className="inline-flex text-red-500 pl-1"
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
                                )}
                            </>
                        );
                    } else if (blankText.type === "blank") {
                        return (
                            <>
                                <span className="text-gray-700">
                                    &nbsp;
                                    {(
                                        blankText as IFitBQuestionSeq & {
                                            _questionNumber?: number;
                                        }
                                    )._questionNumber || i + 1}
                                    .
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
                                    <>
                                        <span
                                            id={tracingBase + "-" + i + "-text"}
                                            contentEditable={showUtility}
                                            className={clsx(
                                                "bg-green-100 text-green-900",
                                                "focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                            )}
                                            onBlur={(e) => handleUpdate(e)}
                                        >
                                            {blankText.text}
                                        </span>
                                        <span>&nbsp;</span>
                                    </>
                                )}
                                {showUtility && (
                                    <>
                                        <DeleteSubComponentButton
                                            onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                                            className="inline-flex pl-1 text-red-500"
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
                                {blankText.explanation_text &&
                                    !blankText.is_correct &&
                                    (showUtility || isViewMarking) && (
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
                            </>
                        );
                    } else if (blankText.type === "longblank") {
                        return (
                            <span
                                key={i}
                                contentEditable={showUtility}
                                className="answer-line"
                                onBlur={handleUpdate}
                                suppressContentEditableWarning={true}
                            />
                        );
                    } else if (blankText.type === "explanation" && blankText.text && (showUtility || isViewMarking)) {
                        return (
                            <span
                                id={`${tracingBase}-${i}-text`}
                                key={i}
                                contentEditable={showUtility}
                                className="italic border border-red-500 text-red-500"
                                suppressContentEditableWarning={true}
                                onBlur={handleUpdate}
                            >
                                {blankText.text}
                            </span>
                        );
                    }
                    return null;
                })}
            </div>
            <ExplanationText
                content={question.explanation_text}
                is_correct={is_correct}
                showUtility={showUtility}
                isViewMarking={isViewMarking}
                id={`questions-${index}-explanation_text`}
                handleUpdate={handleUpdate}
            />
        </div>
    );
};

export default FitBQuestion;
