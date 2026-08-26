/* eslint-disable react/react-in-jsx-scope */
import { IExerciseContentJsonData, ISqQuestion } from "../../type";
import DragHandle from "../questionUtilities/DragHandle";
import QuestionDeleteButton from "../questionUtilities/QuestionDeleteButton";
import QuestionUtility from "../questionUtilities/QuestionUtility";
import clsx from "clsx";
import { NoUtilityMessage } from "../questionUtilities/NoUtilityMessage";
import { UtilityAction } from "../../reducer/actionTypes";
import QuestionTypeEnum from "../../enum/QuestionTypeEnum";
import { ExplanationText } from "../ExplanationText";

interface Props {
    index: number;
    handleUpdate: (e: any) => void;
    question: ISqQuestion;
    isQuestion: boolean;
    isSolution?: boolean;
    showMarkingUtility?: boolean;
    isExerciseView?: boolean;
    isViewMarking?: boolean;
    dragHandleProps?: any; // Drag handle props
    showUtility: boolean;
    utilityDispatch: React.Dispatch<UtilityAction>;
}

const SqQuestion = (props: Props) => {
    const {
        index,
        handleUpdate,
        isQuestion,
        isSolution,
        showMarkingUtility,
        question,
        isExerciseView,
        isViewMarking,
        dragHandleProps,
        showUtility,
        utilityDispatch,
    } = props;

    const tracingBase = "questions-" + index;

    return (
        <div className={""}>
            {question.student_answer == "" &&
                !question.is_correct &&
                (showMarkingUtility || isViewMarking) &&
                !question.is_example && <p className="text-red-500 bottom-2 right-2">No answer is given</p>}

            <table className={`question`}>
                <tr>
                    <td className="q_number">
                        <p>{question._questionNumber || index + 1}.</p>
                    </td>
                    <td>
                        <div className="question">
                            <p
                                contentEditable={showUtility}
                                id={`${tracingBase}-question`}
                                onBlur={(e) => {
                                    if (isExerciseView) return;
                                    handleUpdate(e);
                                }}
                                suppressContentEditableWarning={true}
                            >
                                {question.question}
                            </p>
                        </div>
                        {(showMarkingUtility || isViewMarking) && (
                            <p
                                className={clsx(
                                    question.is_correct ? "text-green-500" : "text-red-500 underline decoration-wavy",
                                    "mb-1"
                                )}
                                id={`${tracingBase}-student_answer`}
                                contentEditable={showUtility}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleUpdate(e)}
                            >
                                {question.student_answer || (!question.is_example && "(No Answer)")}
                            </p>
                        )}
                        <p
                            className={clsx("border-b border-black", question.is_example && "text-slate-500")}
                            id={isExerciseView ? `${tracingBase}-student_answer` : `${tracingBase}-answer`}
                            contentEditable={(isExerciseView && !question.is_example) || showUtility}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleUpdate(e)}
                        >
                            {
                                (isExerciseView && !question.is_example && question.student_answer) || //in exercise view we show the student's answer
                                    ((showUtility || isViewMarking || question.is_example) && question.answer) //in edit mode we show the correct answer
                            }
                        </p>
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

export default SqQuestion;
