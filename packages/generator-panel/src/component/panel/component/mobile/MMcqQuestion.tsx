import { IMcqQuestion, IMQuestionProps } from "../../type";
import { Checkbox } from "@mantine/core";
import { UtilityAction } from "../../reducer/actionTypes";
import clsx from "clsx";
import DeleteSubComponentButton from "../questionUtilities/DeleteSubComponentButton";
import { ExplanationText } from "../ExplanationText";

interface Props extends IMQuestionProps {
    question: IMcqQuestion;
    isExerciseView?: boolean;
    isViewMarking?: boolean;
    showUtility?: boolean;
    showMarkingUtility?: boolean;
    index: number;
    handleUpdate: (e: any, val?: string, isInnerHTML?: boolean) => void;
    utilityDispatch: React.Dispatch<UtilityAction>;
}

const MMcqQuestion = ({
    question,
    isExerciseView,
    isViewMarking,
    showUtility,
    showMarkingUtility,
    index,
    handleUpdate,
    utilityDispatch,
}: Props) => {
    const tracingBase = "questions-" + index;
    // only the option key we show should be uppercase. Comparison should be case-insensitive. Other key fields just remain as they are.

    const transformMCOptions = (question: IMcqQuestion) => {
        return Object.keys(question.options).map((key) => ({
            key,
            value: question.options[key],
        }));
    };
    return (
        <div>
            {question.student_answer == "" && !question.is_correct && (showMarkingUtility || isViewMarking) && (
                <p className="text-red-500 bottom-2 right-2">No answer is given</p>
            )}
            <span className="font-medium">
                {(question as { _questionNumber?: number })._questionNumber || index + 1}.{" "}
            </span>
            <span
                dangerouslySetInnerHTML={{ __html: question.question }}
                id={`${tracingBase}-question`}
                contentEditable={showUtility}
                className="font-medium"
                onBlur={(e) => handleUpdate(e, undefined, true)}
                suppressContentEditableWarning={true}
            ></span>
            <table className="w-full table-fixed">
                <tbody>
                    {transformMCOptions(question).map((option) => {
                        const equalAnswerOption = option.key.toLowerCase() === question.answer?.toLowerCase();
                        const equalStudentAnswerOption =
                            option.key.toLowerCase() === question.student_answer?.toLowerCase();
                        return (
                            <tr key={option.key}>
                                <td className="align-middle py-1 w-8">
                                    <Checkbox
                                        disabled={isViewMarking || (isExerciseView && question.is_example)}
                                        id={`option-${option.key}`}
                                        className={clsx("mr-2")}
                                        classNames={{
                                            icon: clsx("text-white!"), // Highlight the checkbox icon in marking mode
                                            input: clsx(
                                                (isExerciseView || showUtility) && "cursor-pointer!",
                                                "rounded-full!",
                                                // Highlight student's answer in marking mode
                                                showMarkingUtility || isViewMarking
                                                    ? option.key.toLowerCase() ===
                                                      question.student_answer?.toLowerCase()
                                                        ? question.is_correct
                                                            ? "bg-green-500! border-green-500!"
                                                            : "bg-red-500! border-red-500!"
                                                        : option.key.toLowerCase() === question.answer?.toLowerCase() &&
                                                          "bg-green-500! border-green-500!"
                                                    : "",
                                                question.is_example && equalAnswerOption
                                                    ? "bg-slate-500! border-slate-500!"
                                                    : ""
                                            ),
                                        }}
                                        checked={
                                            (isExerciseView &&
                                                option.key.toLowerCase() === question.student_answer?.toLowerCase()) || //in exercise view we show the student's answer
                                            (isViewMarking &&
                                                option.key.toLowerCase() === question.student_answer?.toLowerCase()) || //in exercise view we show the student's answer
                                            ((showUtility || isViewMarking) &&
                                                option.key.toLowerCase() === question.answer?.toLowerCase()) || //in edit mode we show the correct answer
                                            (showMarkingUtility &&
                                                option.key.toLowerCase() === question.student_answer?.toLowerCase()) // in marking mode we show the student's answer
                                        }
                                        onChange={() => {
                                            if (isExerciseView && !question.is_example) {
                                                utilityDispatch({
                                                    type: "SET_ANSWER",
                                                    payload: {
                                                        tracingId: tracingBase + "-student_answer",
                                                        student_answer: option.key,
                                                    },
                                                });
                                            } else if (showUtility) {
                                                utilityDispatch({
                                                    type: "CHANGE_MCQ_OPTION",
                                                    payload: {
                                                        mcqIndex: index,
                                                        answer: option.key,
                                                    },
                                                });
                                            }
                                        }}
                                    />
                                </td>
                                <td className="align-middle py-1 w-5">
                                    <span className="font-medium">{option.key.toUpperCase()}:&nbsp;</span>
                                </td>
                                <td className="align-top py-1 w-full">
                                    <p
                                        id={`${tracingBase}-options-${option.key}`}
                                        contentEditable={showUtility}
                                        suppressContentEditableWarning={true}
                                        onBlur={(e) => {
                                            if (showUtility) {
                                                handleUpdate(e, undefined, true);
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: option.value,
                                        }}
                                    ></p>
                                </td>
                                <td className="align-middle py-1 w-8">
                                    {showUtility && (
                                        <DeleteSubComponentButton
                                            className="text-red-500"
                                            onClick={() =>
                                                utilityDispatch({
                                                    type: "DELETE_MCQ_OPTION",
                                                    payload: {
                                                        mcqIndex: index,
                                                        optionIndex: option.key,
                                                    },
                                                })
                                            }
                                            questionIndex={index}
                                        />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
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
export default MMcqQuestion;
