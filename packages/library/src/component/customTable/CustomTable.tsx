import React, { useState, useMemo } from "react";
import CustomTH from "./CustomTH"; // Import CustomTH component
import { Column, CustomTableProps, SortingOrder } from "./types"; // Import types
import CustomTableFooter from "./CustomTableFooter"; // Import CustomTableFooter

const CustomTable = <TData,>(props: CustomTableProps<TData>) => {
    const {
        columns,
        data,
        currentPage,
        itemsPerPage,
        totalItems,
        onPageChange,
        isLoading,
        onSort,
        selectedRows = [], // Default to empty array
        onSelectedRowsChange,
        idAccessor, // New prop for unique row ID
        enableCheckbox = true,
    } = props;

    // Helper function to get a unique ID for a row item
    const getRowId = useMemo(() => {
        if (typeof idAccessor === "function") {
            return idAccessor;
        }
        if (typeof idAccessor === "string") {
            return (item: TData) => item[idAccessor as keyof TData] as string | number;
        }
        // Fallback if idAccessor is not provided, though not recommended for production
        return (item: TData) => JSON.stringify(item); // Or use a symbol or a weakmap if items are objects
    }, [idAccessor]);

    const handleSelectRow = (row: TData) => {
        if (!onSelectedRowsChange) return;

        const rowId = getRowId(row);
        const isSelected = selectedRows.some((selectedRow) => getRowId(selectedRow) === rowId);
        let newSelectedRows;
        if (isSelected) {
            newSelectedRows = selectedRows.filter((selectedRow) => getRowId(selectedRow) !== rowId);
        } else {
            newSelectedRows = [...selectedRows, row];
        }
        onSelectedRowsChange(newSelectedRows);
    };

    const handleSelectAllRows = () => {
        if (!onSelectedRowsChange || !data) return;

        if (selectedRows.length === data.length) {
            onSelectedRowsChange([]); // Deselect all
        } else {
            onSelectedRowsChange([...data]); // Select all
        }
    };

    const allRowsOnCurrentPageSelected = useMemo(() => {
        if (!data || data.length === 0) return false;
        return data.every((row) => selectedRows.some((selected) => getRowId(selected) === getRowId(row)));
    }, [data, selectedRows, getRowId]);

    const totalColumnRatio = React.useMemo(() => {
        return columns.reduce((sum, col) => sum + (col.ratio || 0), 0);
    }, [columns]);

    const totalPages = React.useMemo(() => {
        if (totalItems && itemsPerPage) {
            return Math.ceil(totalItems / itemsPerPage);
        }
        return 1;
    }, [totalItems, itemsPerPage]);

    const handlePreviousPage = () => {
        if (onPageChange && currentPage && currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (onPageChange && currentPage && totalPages && currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handleSort = onSort
        ? onSort
        : (accessor: keyof TData | string, order: SortingOrder) => {
              console.log(`Sorting by ${String(accessor)} in ${order} order (default handler)`);
          };

    // Local sort state
    const [sortField, setSortField] = useState<string | keyof TData | null>(null);
    const [sortOrder, setSortOrder] = useState<SortingOrder>("asc");

    // Sort data if allowSort is true and no server-side onSort
    const sortedData = useMemo(() => {
        if (!props.allowSort || !sortField || !data) return data;
        const sorted = [...data].sort((a, b) => {
            const aValue =
                typeof sortField === "string" && sortField.includes(".")
                    ? sortField.split(".").reduce((obj: any, key) => obj && obj[key], a)
                    : a[sortField as keyof TData];
            const bValue =
                typeof sortField === "string" && sortField.includes(".")
                    ? sortField.split(".").reduce((obj: any, key) => obj && obj[key], b)
                    : b[sortField as keyof TData];
            if (aValue == null) return 1;
            if (bValue == null) return -1;
            if (aValue === bValue) return 0;
            return (aValue > bValue ? 1 : -1) * (sortOrder === "asc" ? 1 : -1);
        });
        return sorted;
    }, [data, sortField, sortOrder, props.allowSort]);

    const handleHeaderSort = (accessor: keyof TData | string, order: SortingOrder) => {
        if (props.allowSort) {
            setSortField(accessor);
            setSortOrder(order);
        }
    };

    return (
        <>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                <thead className="text-xs text-ace-table-text-gray bg-ace-table-th-bg-gray border-b border-ace-border-gray">
                    <tr>
                        <CustomTH<TData>
                            column={{
                                header: "",
                                accessor: "__select__",
                                sortable: false,
                                ratio: 0.5,
                            }} // Ratio for checkbox column
                            totalColumnRatio={totalColumnRatio + 0.5} // Adjust total ratio
                            isSelectAllCell={true}
                            allRowsSelected={allRowsOnCurrentPageSelected}
                            onSelectAllRows={handleSelectAllRows}
                            enableCheckbox={enableCheckbox}
                        />
                        {columns.map((column, index) => (
                            <CustomTH<TData>
                                key={index.toString() + String(column.accessor)}
                                column={column}
                                handleSort={handleHeaderSort}
                                totalColumnRatio={totalColumnRatio}
                            />
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="text-center py-10">
                                <div className="flex justify-center items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span className="text-lg text-gray-500">Loading...</span>
                                </div>
                            </td>
                        </tr>
                    ) : sortedData && sortedData.length > 0 ? (
                        sortedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={
                                    "bg-white border-b border-ace-border-gray hover:bg-gray-50 " +
                                    (selectedRows.some((selectedRow) => getRowId(selectedRow) === getRowId(row))
                                        ? " ring-2 ring-blue-400"
                                        : "")
                                }
                                onClick={() => {
                                    handleSelectRow(row);
                                    if (props.onRowClick) props.onRowClick(row);
                                }}
                                style={{
                                    cursor: "pointer",
                                }}
                            >
                                <td className="w-4 p-4">
                                    {onSelectedRowsChange && enableCheckbox && (
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            checked={selectedRows.some(
                                                (selectedRow) => getRowId(selectedRow) === getRowId(row)
                                            )}
                                            onChange={(e) => {
                                                e.stopPropagation(); // Prevent row click from firing
                                                handleSelectRow(row);
                                            }}
                                            onClick={(e) => e.stopPropagation()} // Prevent row click from firing
                                        />
                                    )}
                                </td>
                                {columns.map((column, colIndex) => {
                                    let value =
                                        column.accessor &&
                                        typeof column.accessor === "string" &&
                                        (column.accessor as string).includes(".")
                                            ? (column.accessor as string)
                                                  .split(".")
                                                  .reduce((obj: any, key) => obj && obj[key], row)
                                            : row[column.accessor as keyof TData];
                                        if (column.accessor === "expiryDate" && value) {
                                            // Format date value
                                            value = new Date(value as unknown as string).toLocaleDateString("en-US", { timeZone: "Asia/Hong_Kong" });
                                        }
                                    return (
                                        <td key={colIndex.toString() + String(column.accessor)} className="px-6 py-4">
                                            {column.cell
                                                ? column.cell(row)
                                                : value !== undefined && value !== null
                                                ? String(value)
                                                : "-"}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + 1} className="text-center py-10 text-lg text-gray-500">
                                No data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <CustomTableFooter
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                totalPages={totalPages}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
            />
        </>
    );
};

export default CustomTable;
export type { Column, SortingOrder };
