import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    pageSizeOptions = [5, 10, 20, 50]
}) {
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Dynamic logic for many pages
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, 5);
            } else if (currentPage >= totalPages - 2) {
                pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
            }
        }
        return pages;
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-premium mt-6 transition-all">

            {/* Left Side: Rows per page & Results text */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="tracking-tight">Rows per page</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="h-8 pl-3 pr-8 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none cursor-pointer transition-all dark:text-white"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                <div className="h-4 w-px bg-gray-200 dark:bg-white/10 hidden sm:block"></div>

                <span className="tracking-tight">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{indexOfLastItem}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> results
                </span>
            </div>

            {/* Right Side: Pagination Controls */}
            <div className="flex items-center gap-1.5 bg-gray-50/50 dark:bg-white/5 p-1 rounded-xl border border-gray-100 dark:border-white/5">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 hover:shadow-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    title="First Page"
                >
                    <ChevronsLeft size={16} />
                </button>

                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 hover:shadow-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    title="Previous Page"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 mx-1">
                    {getPageNumbers().map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`
                                h-8 w-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all duration-300
                                ${currentPage === pageNum
                                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-105'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm'
                                }
                            `}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 hover:shadow-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    title="Next Page"
                >
                    <ChevronRight size={16} />
                </button>

                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 hover:shadow-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    title="Last Page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}
