import { IInstruction } from "../../type";


interface Props {
    index: number;
    handleUpdate: (e: any, val?: string, isInnerHTML?: boolean) => void;
    question: IInstruction;
    isQuestion: boolean;
    isExerciseView?: boolean;
    dragHandleProps?: any;
    showUtility: boolean;
}

const InstructionText = (props: Props) => {
    const { index, handleUpdate, question, isExerciseView, showUtility } =
        props;

    const tracingBase = "questions-" + index;

    return (
        <div className={""}>
            <p
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
};

export default InstructionText;
