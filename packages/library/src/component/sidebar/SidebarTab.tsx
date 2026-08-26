import React, { FC, ReactNode, MouseEventHandler } from "react";
import clsx from "clsx";
import ArrowIcon from "../../assets/image/google_mui_icons/arrow_down.svg?react";

interface SidebarTabProps {
    icon: ReactNode;
    label: string;
    selected?: boolean;
    showArrow?: boolean;
    onClick?: () => void;
}

const SidebarTab: FC<SidebarTabProps> = ({ icon, label, selected = false, showArrow = false, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "relative flex items-center transition-colors rounded-md cursor-pointer",
                "p-3",
                selected ? "bg-blue-50 text-blue-600" : "hover:bg-ace-sidebar-hover-light-gray"
            )}
        >
            <div
                className={clsx("flex items-center gap-4", selected ? "text-ace-blue" : " text-ace-sidebar-icon-gray")}
            >
                {icon}
                <span
                    className={clsx(
                        "text-base font-medium leading-[0px]",
                        selected ? "text-ace-blue" : "text-ace-text-primary-gray "
                    )}
                >
                    {label}
                </span>
                {showArrow && <ArrowIcon />}
            </div>
        </div>
    );
};

export default SidebarTab;
