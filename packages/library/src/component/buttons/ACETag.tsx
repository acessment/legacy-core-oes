import clsx from "clsx";
import SmallCrossIcon from "../../assets/image/google_mui_icons/close_24dp_1F1F1F_FILL0_wght300_GRAD-25_opsz24 1.svg?react";

type TagColor = "blue" | "green" | "red" | "yellow" | "gray";

const colorMapping: Record<TagColor, { textColor: string; bgColor: string }> = {
    blue: { textColor: "text-ace-blue", bgColor: "bg-ace-tag-bg-blue" },
    green: { textColor: "text-ace-green", bgColor: "bg-ace-tag-bg-green" },
    red: { textColor: "text-ace-red", bgColor: "bg-ace-tag-bg-red" },
    yellow: { textColor: "text-ace-yellow", bgColor: "bg-ace-tag-bg-yellow" },
    gray: { textColor: "text-ace-text-primary-gray", bgColor: "bg-ace-border-gray" },
};

interface TagProps {
    color: TagColor;
    showCross?: boolean;
    showDot?: boolean;
    onClick?: () => void;
    onClose?: () => void;
    children: React.ReactNode;
}

const ACETag: React.FC<TagProps> = ({
    color,
    showCross = false,
    showDot = false,
    onClick,
    onClose,
    children,
}) => {
    const { textColor, bgColor } = colorMapping[color];

    return (
        <button
            className={clsx(
                "inline-flex gap-2 items-center px-2 py-0.5 rounded-full font-medium text-sm",
                bgColor,
                textColor
            )}
        >
            {showDot && (
                <span className="h-1 w-1 rounded-full bg-current block" />
            )}

            <span>{children}</span>

            {showCross && (
                <button
                    type="button"
                    onClick={onClose}
                >
                    <SmallCrossIcon fill="currentColor" className="text-ace-text-primary-gray"/>
                </button>
            )}
        </button>
    );
};

export default ACETag;