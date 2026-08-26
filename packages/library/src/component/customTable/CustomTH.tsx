import React from "react";
import clsx from "clsx";
import { ArrowDownChevronIcon } from "../../assets/image/google_mui_icons";
import { Column, CustomTHeadProps, SortingOrder } from "./types"; // Import types

const CustomTH = <TData,>(props: CustomTHeadProps<TData>) => {
    const {
        column,
        onClick,
        handleSort,
        totalColumnRatio,
        isSelectAllCell,
        allRowsSelected,
        onSelectAllRows,
        enableCheckbox,
    } = props;

    const isClickable = !!column.sortable;

    if (isSelectAllCell) {
        return (
            <th
                scope="col"
                className="p-4"
                style={{
                    width:
                        column.ratio && totalColumnRatio > 0
                            ? `${(column.ratio / totalColumnRatio) * 100}%`
                            : undefined,
                }}
            >
                {onSelectAllRows && enableCheckbox && (
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        checked={allRowsSelected}
                        onChange={onSelectAllRows}
                    />
                )}
            </th>
        );
    }

    return (
        <th
            scope="col"
            className="px-6 py-3"
            style={{
                width:
                    column.ratio && totalColumnRatio > 0
                        ? `${(column.ratio / totalColumnRatio) * 100}%`
                        : undefined,
            }}
        >
            <div
                className={clsx("flex items-center", {
                    "cursor-pointer": isClickable,
                })}
            >
                <span className="text-base font-medium">{column.header}</span>
                {column.sortable && handleSort && (
                    <div className="flex flex-col ml-1">
                        <button
                            className={clsx(
                                "p-0.5",
                                "text-gray-300 hover:text-ace-table-text-gray hover:scale-125 transition-all duration-200"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSort(column.accessor, "asc");
                            }}
                            aria-label={`Sort by ${String(
                                column.header
                            )} ascending`}
                        >
                            <ArrowDownChevronIcon className="w-2.5 h-2.5" />
                        </button>
                        <button
                            className={clsx(
                                "p-0.5",
                                "text-gray-300 hover:text-ace-table-text-gray hover:scale-125 transition-all duration-200"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSort(column.accessor, "desc");
                            }}
                            aria-label={`Sort by ${String(
                                column.header
                            )} descending`}
                        >
                            <ArrowDownChevronIcon className="w-2.5 h-2.5 rotate-180" />
                        </button>
                    </div>
                )}
            </div>
        </th>
    );
};

export default CustomTH;
