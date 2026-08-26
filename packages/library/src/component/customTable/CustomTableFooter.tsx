import React from "react";

interface CustomTableFooterProps {
    currentPage?: number;
    itemsPerPage?: number;
    totalItems?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void; // Keep this for flexibility, or pass individual handlers
    handlePreviousPage: () => void;
    handleNextPage: () => void;
}

const CustomTableFooter: React.FC<CustomTableFooterProps> = ({
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    handlePreviousPage,
    handleNextPage,
}) => {
    // if (totalPages === undefined || totalPages <= 1) {
    //     return null; // Don't render footer if not needed
    // }

    return (
        <nav
            className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4 p-4"
            aria-label="Table navigation"
        >
            <span className="text-sm font-normal text-gray-500  mb-4 md:mb-0 block w-full md:inline md:w-auto">
                Showing{" "}
                <span className="font-semibold text-gray-900 ">
                    {currentPage && itemsPerPage
                        ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                              currentPage * itemsPerPage,
                              totalItems || 0
                          )}`
                        : "0-0"}
                </span>{" "}
                of <span className="font-semibold text-gray-900 ">{totalItems || 0}</span>
            </span>
            <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                <li>
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 "
                    >
                        Previous
                    </button>
                </li>
                <li>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 "
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default CustomTableFooter;
