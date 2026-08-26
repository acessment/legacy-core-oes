import { ActionIcon } from "@mantine/core";
import { IconCircleX } from "@tabler/icons-react";

/* eslint-disable react/react-in-jsx-scope */
interface DeleteSubComponentButtonProps {
    questionIndex: number;
    itemKey?: string | number;
    onClick?: any;
    className?: string;
    onMouseDown?: any;
}

const DeleteSubComponentButton = (props: DeleteSubComponentButtonProps) => {
    return (
        <ActionIcon
        variant="subtle"
        color="red"
          onClick={props.onClick}
          className={`cursor-pointer flex items-center justify-center ${props.className}`}
        >
            <IconCircleX size={12} />
        </ActionIcon>
    );
}

export default DeleteSubComponentButton;