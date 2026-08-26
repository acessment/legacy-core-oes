import React, { ReactElement, useEffect } from "react";
import MenuItem from "./MenuItem";
import clsx from "clsx";

interface DropdownMenuContainerProps {
    children: ReactElement | ReactElement[];
    open: boolean;
    onClose: () => void;
}

export const DropdownMenuContainer: React.FC<DropdownMenuContainerProps> = ({
    children,
    open,
    onClose,
}) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onClose();
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClick);
            return () => document.removeEventListener("mousedown", handleClick);
        }
    }, [open, onClose]);
    return (
        <div ref={containerRef} className={clsx(open? "border border-ace-sidebar-hover-light-gray flex flex-col absolute z-10 bg-white shadow-lg rounded-md right-0 top-7 p-2" : "hidden")}>
            {children}
        </div>
    );
};
