/* eslint-disable react/react-in-jsx-scope */
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import ArrowIcon from "../../assets/image/google_mui_icons/arrow_down.svg?react";

interface IMenuItemProps {
    icon?: ReactNode;
    label: string;
    showArrow?: boolean;
    onClick?: () => void;
    className?: string;
}

export const MenuItem: FC<IMenuItemProps> = ({
    icon,
    label,
    showArrow = false,
    onClick,
    className,
}) => {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100",
                className
            )}
        >
            {icon && <span>{icon}</span>}
            <span
                className="text-sm text-ace-text-primary-gray font-medium whitespace-nowrap
"
            >
                {label}
            </span>
            {showArrow && <ArrowIcon className="w-4 h-4 ml-auto" />}
        </div>
    );
};

export default MenuItem;
