import { IQuestion } from "../type";

interface ExplanationTextProps {
    content?: string;
    id: string;
    handleUpdate: (e: any) => void;
    is_correct?: boolean;
    showUtility?: boolean;
    isViewMarking?: boolean;
}
export const ExplanationText = ({ content, id, handleUpdate, is_correct=false, showUtility, isViewMarking }: ExplanationTextProps) => {
    return (
        content &&
        !is_correct &&
        (showUtility || isViewMarking) && (
            <p
                id={id}
                contentEditable={showUtility}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleUpdate(e)}
                className="my-1 border border-blue-500 text-blue-500"
            >
                {content}
            </p>
        )
    );
};
