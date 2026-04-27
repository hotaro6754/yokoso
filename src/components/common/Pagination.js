// src/components/common/Pagination.js
"use client";
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 30, 40, 50],
  className = "",
  showWhenEmpty = false,
}) {  
  const computedTotalPages = Math.ceil(totalItems / itemsPerPage);
  const totalPages = computedTotalPages === 0 && showWhenEmpty ? 1 : computedTotalPages;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis logic
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, safeCurrentPage - 1);
      let end = Math.min(totalPages - 1, safeCurrentPage + 1);
      
      if (safeCurrentPage <= 3) {
        end = 4;
      }
      
      if (safeCurrentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pages.push('ellipsis-left');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('ellipsis-right');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== safeCurrentPage) {
      onPageChange(page);
    }
  };

  if (totalPages === 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-primary-100/50 dark:border-gray-700 ${className}`}>
      {/* Left Section - Rows per page and info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Rows per page</span>
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 pr-8 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer appearance-none"
            >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <span className="text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{startItem}</span> to <span className="font-semibold text-gray-900 dark:text-gray-100">{endItem}</span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{totalItems}</span> results
        </span>
      </div>

      {/* Right Section - Page navigation */}
      <div className="flex items-center gap-1.5">
        {/* First page button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={safeCurrentPage === 1}
          className="p-2 rounded-xl border border-primary-200/50 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="First page"
        >
          <ChevronsLeft size={16} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="p-2 rounded-xl border border-primary-200/50 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis-left' || page === 'ellipsis-right') {
              return (
                <span key={`ellipsis-${index}`} className="px-2">
                  <MoreHorizontal size={16} className="text-gray-400" />
                </span>
              );
            }
            
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`min-w-[36px] px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  safeCurrentPage === page
                    ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20'
                    : 'border border-primary-200/50 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        {/* Next page button */}
        <button
          onClick={() => handlePageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === totalPages}
          className="p-2 rounded-xl border border-primary-200/50 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Next page"
        >
          <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* Last page button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={safeCurrentPage === totalPages}
          className="p-2 rounded-xl border border-primary-200/50 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Last page"
        >
          <ChevronsRight size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}