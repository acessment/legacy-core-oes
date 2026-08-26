import clsx from "clsx";
import React from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { UtilityAction } from "../../reducer/actionTypes";
import { ActionIcon } from "@mantine/core";

interface IMarkingUtilityProps {
    className?:string;
    size?: number;
    utilityDispatch: React.Dispatch<UtilityAction>;
    tracingId: string;
}

const MarkingUtility = ({ className, size, utilityDispatch, tracingId }: IMarkingUtilityProps) => {
    return (
        <span className={clsx("flex gap-1 items-center grow justify-self-start", className || "")}>
            <ActionIcon
                variant="subtle"
                color="green"
                onClick={() => {
                    utilityDispatch({ type: "MARK_QUESTION", payload: { tracingId: tracingId, isCorrect: true } });
                }}
            >
                <IconCheck size={size || 16} />
            </ActionIcon>
            <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => {
                    utilityDispatch({ type: "MARK_QUESTION", payload: { tracingId: tracingId, isCorrect: false } });
                }}
            >
                <IconX size={size || 16} />
            </ActionIcon>
        </span>
    );
}

export default MarkingUtility;