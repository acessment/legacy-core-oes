import { ActionIcon, Divider, Select } from "@mantine/core";
import { ITfngQuestion, IMQuestionProps } from "../../type";
import { useState } from "react";
import DeleteSubComponentButton from "../questionUtilities/DeleteSubComponentButton";
import { IconABOff, IconCheck, IconX } from "@tabler/icons-react";
import MarkingUtility from "../questionUtilities/MarkingUtility";
import clsx from "clsx";
import { ExplanationText } from "../ExplanationText";

interface Props extends IMQuestionProps {
    question: ITfngQuestion;
    index: number;
    handleUpdate: () => void;
    showUtility?: boolean;
    showMarkingUtility?: boolean;
    isExerciseView?: boolean;
    isViewMarking?: boolean;
    utilityDispatch: React.Dispatch<any>;
}

const MTFNGQuestion = ({
    question,
    index,
    showUtility,
    showMarkingUtility,
    isExerciseView,
    isViewMarking,
    handleUpdate,
    utilityDispatch,
}: Props) => {
    const TFNG = ["T", "F", "NG"];
    const [selectedOptions, setSelectedOptions] = useState<{
        [key: number]: string;
    }>({});
    const tracingBase = "questions-" + index;

    const handleOptionChange = (statementIndex: number, option: string | null) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [statementIndex]: option || "",
        }));
    };

    return (
        <div>
            <table>
                {question.statements.map((statement, qIndex) => (
                    <>
                        <tr key={qIndex} className="align-middle">
                            <td className="px-2 align-middle">
                                <span className="font-medium">{statement._questionNumber || qIndex + 1}. </span>
                            </td>
                            <td
                                contentEditable={showUtility || showMarkingUtility}
                                id={`${tracingBase}-statements-${qIndex}-statement`}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                    handleUpdate(e);
                                }}
                            >
                                {statement.statement}
                            </td>
                            <td className="text-center align-middle pr-2">
                                {(showMarkingUtility || isViewMarking) && !statement.is_example && (
                                    <Select
                                        id={`${tracingBase}-statements-${qIndex}-student_answer`}
                                        data={TFNG}
                                        placeholder="Select answer"
                                        value={statement.student_answer}
                                        disabled={true}
                                        classNames={{
                                            input: clsx(
                                                statement.is_correct
                                                    ? "bg-green-300! text-green-900! border-green-900!"
                                                    : "bg-red-300! text-red-900! border-red-900!"
                                            ),
                                        }}
                                    />
                                )}
                                <Select
                                    id={`${tracingBase}-statements-${qIndex}-student_answer`}
                                    data={TFNG}
                                    placeholder="Select answer"
                                    disabled={isViewMarking || statement.is_example}
                                    value={
                                        statement.is_example
                                            ? statement.answer
                                            : isExerciseView
                                            ? statement.student_answer
                                            : showUtility || isViewMarking
                                            ? statement.answer
                                            : undefined
                                    }
                                    onChange={(value) => {
                                        if (isExerciseView) {
                                            utilityDispatch({
                                                type: "SET_ANSWER",
                                                payload: {
                                                    tracingId: `${tracingBase}-statements-${qIndex}-student_answer`,
                                                    student_answer: value,
                                                },
                                            });
                                        } else if (showUtility) {
                                            utilityDispatch({
                                                type: "CHANGE_TFNG_OPTION",
                                                payload: {
                                                    tfngIndex: index,
                                                    statementIndex: qIndex,
                                                    answer: value,
                                                },
                                            });
                                        }
                                    }}
                                    className="my-2"
                                />
                            </td>
                            <td>
                                {showUtility && (
                                    <div className="flex">
                                        <DeleteSubComponentButton
                                            questionIndex={qIndex}
                                            className="text-red-500"
                                            onClick={() =>
                                                utilityDispatch({
                                                    type: "DELETE_TFNG_STATEMENT",
                                                    payload: {
                                                        tfngIndex: index,
                                                        statementIndex: qIndex,
                                                    },
                                                })
                                            }
                                        />
                                        <ActionIcon
                                            variant="subtle"
                                            color="yellow"
                                            onClick={() =>
                                                utilityDispatch({
                                                    type: "TOGGLE_TFNG_STATEMENT_EXAMPLE",
                                                    payload: {
                                                        tfngIndex: index,
                                                        statementIndex: qIndex,
                                                    },
                                                })
                                            }
                                        >
                                            <IconABOff size={12} />
                                        </ActionIcon>
                                    </div>
                                )}
                            </td>
                            <td className="align-middle">
                                {showMarkingUtility && (
                                    <MarkingUtility
                                        tracingId={`${tracingBase}-statements-${qIndex}-is_correct`}
                                        utilityDispatch={utilityDispatch}
                                        className="inline-flex align-middle"
                                        size={22}
                                    />
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={4}>
                                <ExplanationText
                                    content={statement.explanation_text}
                                    id={`${tracingBase}-statements-${qIndex}-explanation_text`}
                                    handleUpdate={handleUpdate}
                                    is_correct={statement.is_correct ?? false}
                                    showUtility={showUtility}
                                    isViewMarking={isViewMarking}
                                />
                            </td>
                        </tr>
                        {(showMarkingUtility || isViewMarking) && <Divider my="md" />}
                    </>
                ))}
            </table>
        </div>
    );
};

export default MTFNGQuestion;
