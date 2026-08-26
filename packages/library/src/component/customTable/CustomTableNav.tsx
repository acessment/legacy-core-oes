import React, { ReactNode } from "react";
import {MoreVertIcon} from "../../assets/image/google_mui_icons/index"

interface CustomTableNavProps {
    title: string;
    menu?: React.ReactNode;
    onMenuToggle?: () => void;
    fullMenu?: ReactNode;
    dialog?: ReactNode;
}

const CustomTableNav: React.FC<CustomTableNavProps> = ({ title, menu, onMenuToggle, fullMenu, dialog }) => {
    return (
        <>
            <div className="flex justify-between items-center bg-white px-8 py-6 rounded-lg">
                {title && <h2 className="text-xl font-bold text-ace-text-primary-gray">{title}</h2>}
                {menu && onMenuToggle && (
                    <div className="relative p-0 m-0 leading-none">
                        <button onClick={onMenuToggle} className="relative leading-none p-0 m-0">
                            <MoreVertIcon className="leading-none w-6 h-6 text-gray-500 cursor-pointer hover:scale-125 hover:text-ace-text-primary-gray transition duration-200" />
                        </button>
                        {menu}
                    </div>
                )}
                {fullMenu}
            </div>
            {dialog}
        </>
    );
};
export default CustomTableNav;
