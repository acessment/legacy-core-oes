import React from "react";

export type SortingOrder = "asc" | "desc";

// Make Column interface generic
export interface Column<TData> {
    /** The text to display in the column header. */
    header: string;
    /** The key in the data object to access the cell's value. */
    accessor: keyof TData | string; // string for flexibility, keyof TData for type safety
    /** Optional custom renderer function for the cell. Takes the entire row data as an argument. */
    cell?: (row: TData) => React.ReactNode;
    /** Optional ratio for distributing column width. If provided, widths are calculated based on the sum of all ratios. */
    ratio?: number;
    /** Is the column sortable? */
    sortable?: boolean;
}

/**
 * Props for the CustomTable component.
 */
export interface CustomTableProps<TData> {
    /** An array of column definitions. */
    columns: Column<TData>[];
    /** An array of data objects to display in the table. */
    data: TData[] | undefined;
    // Pagination props
    /** The current active page number (1-indexed). */
    currentPage?: number;
    /** The number of items to display per page. */
    itemsPerPage?: number;
    /** The total number of items in the dataset. */
    totalItems?: number;
    /** Callback function triggered when the page changes. Receives the new page number as an argument. */
    onPageChange?: (page: number) => void;
    /** Optional loading state for the table. */
    isLoading?: boolean;
    /** Callback function triggered when a column is sorted. */
    onSort?: (accessor: keyof TData | string, order: SortingOrder) => void;
    /** Optional menu items for additional actions. */
    menuItems?: Array<{
        label: string;
        onClick: (props: any) => void;
    }>;
    /** Optional selected row data for row selection support. */
    selectedRows?: TData[];
    /** Callback function triggered when a row is selected or deselected. */
    onSelectedRowsChange?: (selectedRows: TData[]) => void;
    /**
     * Optional accessor for a unique ID of a row item.
     * Can be a key of TData or a function that takes a row item and returns a unique string or number.
     * Defaults to object reference if not provided, but using a unique ID is more robust.
     */
    idAccessor?: keyof TData | ((item: TData) => string | number);
    /** Enable client-side sorting by clicking header. */
    allowSort?: boolean;
    /** Callback for row click. */
    onRowClick?: (row: any) => void;
    enableCheckbox?:boolean;
}

/**
 * Props for the CustomTH component.
 */
export interface CustomTHeadProps<TData> {
    column: Column<TData>;
    onClick?: () => void;
    handleSort?: (accessor: keyof TData | string, order: SortingOrder) => void;
    totalColumnRatio: number;
    // Props for select all checkbox
    isSelectAllCell?: boolean; // Indicates if this TH is for the select-all checkbox
    allRowsSelected?: boolean;
    onSelectAllRows?: () => void;
    enableCheckbox?:boolean;
}
