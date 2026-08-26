import React from "react";
import DragHandle from "./DragHandle";
import ToolBox from "./ToolBox";
import { QuestionTypeEnum } from "../../type";
import { UtilityAction } from "../../reducer/actionTypes";

interface QuestionUtilityProps {
    questionType: QuestionTypeEnum;
    questionIndex: number;
    dragHandleProps: any;
    utilityDispatch: React.Dispatch<UtilityAction>;
}

const QuestionUtility: React.FC<QuestionUtilityProps> = ({
    questionType,
    questionIndex,
    dragHandleProps,
    utilityDispatch,
}) => {
    return (
        <>
            <div
                className="absolute -left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 px-1 py-2 bg-gray-200 rounded-md rounded-r-none rounded-br-none"
                {...dragHandleProps}
            >
                <DragHandle />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                <ToolBox
                    questionType={questionType}
                    questionIndex={questionIndex}
                    utilityDispatch={utilityDispatch}
                />
            </div>
        </>
    );
};

export default QuestionUtility;