import { ActionIcon, Menu } from "@mantine/core";
import ToolBox from "./questionUtilities/ToolBox";
import { IconABOff, IconDots } from "@tabler/icons-react";
import QuestionDeleteButton from "./questionUtilities/QuestionDeleteButton";
import { UtilityAction } from "../reducer/actionTypes";
import { QuestionTypeEnum } from "../type";
import QuestionTypeEnumValue from "../enum/QuestionTypeEnum";
import MarkingUtility from "./questionUtilities/MarkingUtility";
import DragHandle from "./questionUtilities/DragHandle";
import clsx from "clsx";

interface QuestionWrapperProps {
    children: React.ReactNode;
    questionType: QuestionTypeEnum;
    showUtility?: boolean;
    showMarkingUtility?: boolean;
    isExerciseView?: boolean;
    utilityDispatch: React.Dispatch<UtilityAction>;
    index: number;
    dragHandleProps?: React.HTMLAttributes<HTMLElement> | null;
    draggableProps?: React.HTMLAttributes<HTMLElement>;
    innerRef?: React.Ref<HTMLDivElement>;
}
const QuestionWrapper = ({
    children,
    questionType,
    showUtility,
    showMarkingUtility,
    isExerciseView,
    utilityDispatch,
    index,
    dragHandleProps,
    draggableProps,
    innerRef,
}: QuestionWrapperProps) => {
    return (
        <div
            ref={innerRef}
            className={clsx(
                "flex border border-gray-200 rounded-md p-2 my-1 shadow-xs",
                isExerciseView && "border-none! shadow-none!"
            )}
            {...draggableProps}
        >
            <div className="w-full ">
                {showUtility && (
                    <div className="flex relative items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                {...(dragHandleProps || {})}
                                className="flex items-start cursor-grab active:cursor-grabbing"
                                title="Drag to reorder"
                            >
                                <DragHandle className="text-gray-400 hover:text-gray-600" />
                            </div>
                            <Menu withinPortal>
                                <Menu.Target>
                                    <ActionIcon variant="subtle" color="gray" className="justify-self-end">
                                        <IconDots size={16} />
                                    </ActionIcon>
                                </Menu.Target>
                                {showMarkingUtility &&
                                    (questionType === QuestionTypeEnumValue.MCQ ||
                                        questionType === QuestionTypeEnumValue.SQ) && (
                                        <MarkingUtility
                                            utilityDispatch={utilityDispatch}
                                            tracingId={`questions-${index}-is_correct`}
                                            className=""
                                            size={24}
                                        />
                                    )}
                                <Menu.Dropdown className="border-none! bg-transparent!">
                                    <ToolBox
                                        questionType={questionType}
                                        questionIndex={index}
                                        utilityDispatch={utilityDispatch}
                                        className="rounded-xs! static!"
                                    />
                                </Menu.Dropdown>
                            </Menu>
                            {(questionType === QuestionTypeEnumValue.MCQ ||
                                questionType === QuestionTypeEnumValue.SQ) && (
                                <ActionIcon
                                    variant="subtle"
                                    color="yellow"
                                    onClick={() => {
                                        utilityDispatch({ type: "TOGGLE_EXAMPLE", payload: { questionIndex: index } });
                                    }}
                                >
                                    <IconABOff size={20} />
                                </ActionIcon>
                            )}
                        </div>
                        <QuestionDeleteButton
                            onClick={() =>
                                utilityDispatch({
                                    type: "DELETE_QUESTION",
                                    payload: { questionIndex: index },
                                })
                            }
                            className="!static"
                        ></QuestionDeleteButton>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default QuestionWrapper;
