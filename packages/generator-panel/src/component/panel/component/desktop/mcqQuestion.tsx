/* eslint-disable react/react-in-jsx-scope */
import { useEffect } from "react";
import { IExerciseContentJsonData, IMcqQuestion, IMQuestionProps } from "../../type";
import DeleteSubComponentButton from "../questionUtilities/DeleteSubComponentButton";
import clsx from "clsx";
import { UtilityAction } from "../../reducer/actionTypes";
import { ExplanationText } from "../ExplanationText";

interface Props extends IMQuestionProps {
    question: IMcqQuestion;
    index: number;
    handleUpdate: (e: any, val?: string, isInnerHTML?: boolean) => void;
    isSolution?: boolean;
    showMarkingUtility?: boolean;
    isExerciseView?: boolean;
    isViewMarking?: boolean;
    showUtility: boolean;
    utilityDispatch: React.Dispatch<UtilityAction>;
}

const McQQuestion = (props: Props) => {
    const {
        index,
        handleUpdate,
        showMarkingUtility,
        question,
        isExerciseView,
        isViewMarking,
        showUtility,
        utilityDispatch,
    } = props;

    const tracingBase = "questions-" + index;
    // only the option key we show should be uppercase. Comparison should be case-insensitive. Other key fields just remain as they are.
    return (
        <div className="relative">
            {question.student_answer == "" &&
                !question.is_correct &&
                (showMarkingUtility || isViewMarking) &&
                !question.is_example && <p className="text-red-500 bottom-2 right-2">No answer is given</p>}

            <table className={`question`}>
                <tr>
                    <td className="q_number">
                        <p>{(question as { _questionNumber?: number })._questionNumber || index + 1}.</p>
                    </td>
                    <td>
                        <div className="question">
                            <p
                                id={`${tracingBase}-question`}
                                onBlur={(e) => handleUpdate(e, undefined, true)}
                                suppressContentEditableWarning={true}
                                contentEditable={showUtility}
                                dangerouslySetInnerHTML={{
                                    __html: question.question,
                                }}
                            ></p>
                        </div>
                        <table width="100%">
                            {Object.entries(question.options).map(([key, option], i) => {
                                const equalAnswerOption = question.answer.toLowerCase() === key.toLowerCase();
                                const equalStudentOption = question.student_answer?.toLowerCase() === key.toLowerCase();
                                return (
                                    <tr key={i} className="relative">
                                        <td className="option-key relative">
                                            <span
                                                id={`option-${key}`}
                                                onClick={() => {
                                                    if (isExerciseView && !question.is_example) {
                                                        console.log("Setting answer in exercise view");
                                                        utilityDispatch({
                                                            type: "SET_ANSWER",
                                                            payload: {
                                                                tracingId: tracingBase + "-student_answer",
                                                                student_answer: key,
                                                            },
                                                        });
                                                    } else if (!isViewMarking && showUtility) {
                                                        utilityDispatch({
                                                            type: "CHANGE_MCQ_OPTION",
                                                            payload: {
                                                                mcqIndex: index,
                                                                answer: key,
                                                            },
                                                        });
                                                    }
                                                }}
                                                className={clsx(
                                                    "circle",
                                                    (showUtility || isExerciseView) && "question-utility-option-ring",

                                                    isExerciseView &&
                                                        key.toLowerCase() === question.student_answer?.toLowerCase() &&
                                                        "circle-answer",

                                                    showUtility &&
                                                        key.toLowerCase() === question.answer?.toLowerCase() &&
                                                        "circle-answer",

                                                    //Highlight correct answer in marking mode
                                                    (isViewMarking || showMarkingUtility) &&
                                                        key.toLowerCase() === question.answer?.toLowerCase() &&
                                                        "circle-correct-answer", //in exercise view we show the student's answer
                                                    // Highlight student's answer in marking mode
                                                    (showMarkingUtility || isViewMarking) &&
                                                        key.toLowerCase() === question.student_answer?.toLowerCase()
                                                        ? question.is_correct
                                                            ? "circle-correct-answer"
                                                            : "circle-wrong-answer"
                                                        : "",
                                                    question.is_example && equalAnswerOption && "circle-example"
                                                )}
                                            ></span>
                                        </td>
                                        <td className="option-key relative">
                                            <span>
                                                {key.toUpperCase()}. {/* only this should be upper case*/}
                                            </span>
                                        </td>
                                        <td className="option-key" style={{ width: "auto" }}>
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: option,
                                                }}
                                                contentEditable={showUtility}
                                                onBlur={(e) => {
                                                    if (showUtility) {
                                                        handleUpdate(e, undefined, true);
                                                    }
                                                }}
                                                suppressContentEditableWarning={true}
                                                id={`${tracingBase}-options-${key}`}
                                            ></span>
                                        </td>
                                        {showUtility && (
                                            <DeleteSubComponentButton
                                                questionIndex={index}
                                                itemKey={key}
                                                className={"text-red-500"}
                                                onClick={() =>
                                                    utilityDispatch({
                                                        type: "DELETE_MCQ_OPTION",
                                                        payload: {
                                                            mcqIndex: index,
                                                            optionIndex: key,
                                                        },
                                                    })
                                                }
                                            ></DeleteSubComponentButton>
                                        )}
                                    </tr>
                                );
                            })}
                        </table>
                    </td>
                </tr>
            </table>
            <ExplanationText
                content={question.explanation_text}
                id={`${tracingBase}-explanation_text`}
                handleUpdate={handleUpdate}
                is_correct={question.is_correct ?? false}
                showUtility={showUtility}
                isViewMarking={isViewMarking}
            />
        </div>
    );
};

export default McQQuestion;
