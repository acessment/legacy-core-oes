import type { IMQuestionProps, IInstruction } from "../../type";


interface Props extends IMQuestionProps {
    question: IInstruction;
    index: number;
    showUtility?: boolean;
    showMarkingUtility?: boolean;
    isExerciseView?: boolean;
    handleUpdate?: (e: any, val?: string, isInnerHTML?: boolean) => void;
    utilityDispatch: React.Dispatch<any>;
}

const MInstructionText = ({ question, index, showUtility, showMarkingUtility, isExerciseView, handleUpdate, utilityDispatch }: Props) => {
    const tracingBase = "questions-" + index;
    
    return (
        <div className={""}>
            <p
                className="font-medium"
                id={`${tracingBase}-text`}
                onBlur={(e) => {
                    handleUpdate(e, undefined, true);
                }}
                contentEditable={showUtility}
                suppressContentEditableWarning={true}
                dangerouslySetInnerHTML={{
                    __html: question.text,
                }}
            ></p>
        </div>
    );
}
export default MInstructionText;