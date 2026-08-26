import React, { useState } from "react";
import clsx from "clsx";

/**
 * Interface for defining the structure of a tab item.
 */
export interface TabItem {
    /** The text to display for the tab. */
    label: string;
    /** Whether the tab is disabled. */
    disabled?: boolean;
}

/**
 * Props for the CustomTab component.
 */
interface CustomTabProps {
    /** An array of tab item definitions. */
    tabs: TabItem[];
    /** The index of the tab to be active by default. Defaults to 0. */
    defaultTabIndex?: number;
    /** Callback function triggered when the active tab changes. Receives the new tab index as an argument. */
    onTabChange?: (tabIndex: number) => void;
}

/**
 * A reusable tab component that manages tab selection and content display.
 * @param props - The props for the CustomTab component.
 */
const CustomTab: React.FC<CustomTabProps> = ({
    tabs,
    defaultTabIndex = 0,
    onTabChange,
}) => {
    const [activeTabIndex, setActiveTabIndex] =
        useState<number>(defaultTabIndex);

    /**
     * Handles the click event on a tab, updating the active tab index
     * and calling the onTabChange callback if provided.
     * @param index - The index of the clicked tab.
     */
    const handleTabClick = (index: number) => {
        const isDisabled = tabs[index].disabled;
        if (isDisabled) {
            return;
        }
        setActiveTabIndex(index);
        if (onTabChange) {
            onTabChange(index);
        }
    };

    return (
        <div className="text-sm font-medium text-center border-b border-gray-200">
            <ul className="flex flex-wrap gap-6">
                {tabs.map((tab, index) => (
                    <li className="me-2" key={index}>
                        <button
                            onClick={() => handleTabClick(index)}
                            disabled={tab.disabled}
                            className={clsx(
                                "inline-block py-3 px-1 border-b-2",
                                {
                                    "text-gray-400 cursor-not-allowed": tab.disabled,
                                    "text-ace-text-primary-gray border-ace-text-primary-gray active font-medium":
                                        !tab.disabled && activeTabIndex === index,
                                    "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300":
                                        !tab.disabled && activeTabIndex !== index,
                                }
                            )}
                            aria-current={
                                activeTabIndex === index ? "page" : undefined
                            }
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CustomTab;
