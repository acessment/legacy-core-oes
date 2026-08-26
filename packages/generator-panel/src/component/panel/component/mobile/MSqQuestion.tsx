import clsx from "clsx";
import { IMQuestionProps, ISqQuestion } from "../../type";
import { useEffect, useState } from "react";
import { ExplanationText } from "../ExplanationText";

interface Props extends IMQuestionProps {
    question: ISqQuestion;
    isExerciseView?: boolean;
    isViewMarking?: boolean;
    showUtility?: boolean;
    showMarkingUtility?: boolean;
    index: number;
    handleUpdate: (e: any) => void;
    utilityDispatch: React.Dispatch<any>;
}

const MSqQuestion = ({
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

    return (
        <div>
            {question.student_answer == "" &&
                !question.is_correct &&
                (showMarkingUtility || isViewMarking) &&
                !question.is_example && <p className="text-red-500 bottom-2 right-2">No answer is given</p>}
            <span className="font-medium">
                {(question as { _questionNumber?: number })._questionNumber || index + 1}.{" "}
            </span>
            <span
                id={`${tracingBase}-question`}
                contentEditable={showUtility || showMarkingUtility}
                className="font-medium"
                onBlur={(e) => {
                    handleUpdate(e);
                }}
                suppressContentEditableWarning={true}
            >
                {question.question}
            </span>
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
                    {question.student_answer}
                </p>
            )}
            <p
                id={isExerciseView ? `${tracingBase}-student_answer` : `${tracingBase}-answer`}
                contentEditable={(isExerciseView && !question.is_example) || showUtility}
                className={clsx(
                    "focus:outline-hidden border-b border-gray-300 focus:border-blue-500 mt-2 w-full min-h-[1.5em]",
                    question.is_example && "text-slate-500"
                )}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                    handleUpdate(e);
                }}
            >
                {
                    (isExerciseView && !question.is_example && question.student_answer) || //in exercise view we show the student's answer
                        ((showUtility || isViewMarking || question.is_example) && question.answer) //in edit mode we show the correct answer
                }
            </p>

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

export default MSqQuestion;
