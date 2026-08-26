/* eslint-disable react/react-in-jsx-scope */
import { IExerciseContentJsonData, ITfngQuestion } from "../../type";
import DeleteSubComponentButton from "../questionUtilities/DeleteSubComponentButton";
import clsx from "clsx";
import { NoUtilityMessage } from "../questionUtilities/NoUtilityMessage";
import { UtilityAction } from "../../reducer/actionTypes";
import MarkingUtility from "../questionUtilities/MarkingUtility";
import { ActionIcon } from "@mantine/core";
import { IconABOff } from "@tabler/icons-react";
import { ExplanationText } from "../ExplanationText";

interface Props {
    index: number;
    handleUpdate: (e: any, val?: any) => void;
    question: ITfngQuestion;
    showMarkingUtility?: boolean;
    isExerciseView?: boolean;
    isViewMarking?: boolean;
    showUtility: boolean;
    utilityDispatch: React.Dispatch<UtilityAction>;
}

const TfngQuestion = (props: Props) => {
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
    const TFNG = ["T", "F", "NG"];
    const tracingBase = "questions-" + index;

    return (
        <div>
            <table className={`question`}>
                <tr>
                    <td className="q_number"></td>
                    <td>
                        <div className="question">
                            <table width="100%" id={`tfng_${index}`}>
                                <tr>
                                    <td></td>
                                    <th className="tfng-choice">T</th>
                                    <th className="tfng-choice">F</th>
                                    <th className="tfng-choice">NG</th>
                                </tr>
                                {question.statements.map((statement, i) => {
                                    return (
                                        <>
                                            <tr key={i}>
                                                <td style={{ width: "auto" }} className="relative">
                                                    <span className="absolute -left-6">
                                                        {statement._questionNumber || i + 1}.
                                                    </span>
                                                    <span
                                                        suppressContentEditableWarning={true}
                                                        contentEditable={showUtility}
                                                        id={`${tracingBase}-statements-${i}-statement`}
                                                        onBlur={(e) => handleUpdate(e)}
                                                    >
                                                        {statement.statement || "Statement 1"}
                                                    </span>
                                                    {statement.student_answer == "" &&
                                                        !statement.is_correct &&
                                                        (showMarkingUtility || isViewMarking) &&
                                                        !statement.is_example && (
                                                            <p className="text-red-500 bottom-2 right-2">
                                                                No answer is given
                                                            </p>
                                                        )}
                                                </td>
                                                {TFNG.map((option) => {
                                                    const equalAnswerOption = statement.answer === option;
                                                    const equalStudentOption = statement.student_answer === option;
                                                    return (
                                                        <td key={option} className="tfng-choice">
                                                            <span
                                                                id={
                                                                    isExerciseView
                                                                        ? `${tracingBase}-statements-${i}-student_answer`
                                                                        : `${tracingBase}-statements-${i}-answer`
                                                                }
                                                                onClick={(e) => {
                                                                    if (
                                                                        showUtility ||
                                                                        (isExerciseView && !statement.is_example)
                                                                    ) {
                                                                        handleUpdate(e, option);
                                                                    }
                                                                }}
                                                                className={clsx(
                                                                    "circle",
                                                                    (showUtility || isExerciseView) &&
                                                                        " hover:ring-1 hover:ring-blue-500 cursor-pointer question-utility-option-ring",
                                                                    isExerciseView &&
                                                                        statement.student_answer === option &&
                                                                        "circle-answer",
                                                                    showUtility &&
                                                                        statement.answer === option &&
                                                                        "circle-answer",
                                                                    (showMarkingUtility || isViewMarking) &&
                                                                        ((statement.student_answer ===
                                                                            statement.answer &&
                                                                            statement.student_answer === option) ||
                                                                            statement.answer === option) &&
                                                                        "circle-correct-answer",
                                                                    (showMarkingUtility || isViewMarking) &&
                                                                        statement.student_answer !== statement.answer &&
                                                                        statement.student_answer === option &&
                                                                        "circle-wrong-answer",
                                                                    statement.is_example &&
                                                                        equalAnswerOption &&
                                                                        "circle-example"
                                                                )}
                                                            ></span>
                                                        </td>
                                                    );
                                                })}
                                                {showUtility && (
                                                    <td className="align-middle">
                                                        <div className="flex">
                                                            <DeleteSubComponentButton
                                                                className="text-red-500"
                                                                questionIndex={index}
                                                                itemKey={i}
                                                                onClick={() =>
                                                                    utilityDispatch({
                                                                        type: "DELETE_TFNG_STATEMENT",
                                                                        payload: {
                                                                            tfngIndex: index,
                                                                            statementIndex: i,
                                                                        },
                                                                    })
                                                                }
                                                            ></DeleteSubComponentButton>
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="yellow"
                                                                onClick={() =>
                                                                    utilityDispatch({
                                                                        type: "TOGGLE_TFNG_STATEMENT_EXAMPLE",
                                                                        payload: {
                                                                            tfngIndex: index,
                                                                            statementIndex: i,
                                                                        },
                                                                    })
                                                                }
                                                            >
                                                                <IconABOff size={12} />
                                                            </ActionIcon>
                                                        </div>
                                                    </td>
                                                )}
                                                {showMarkingUtility && (
                                                    <td>
                                                        <MarkingUtility
                                                            tracingId={`${tracingBase}-statements-${i}-is_correct`}
                                                            utilityDispatch={utilityDispatch}
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                            <ExplanationText
                                                content={statement.explanation_text}
                                                is_correct={statement.is_correct ?? false}
                                                showUtility={showUtility}
                                                isViewMarking={isViewMarking}
                                                id={`${tracingBase}-statements-${i}-explanation_text`}
                                                handleUpdate={handleUpdate}
                                            />
                                        </>
                                    );
                                })}
                            </table>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    );
};

export default TfngQuestion;
