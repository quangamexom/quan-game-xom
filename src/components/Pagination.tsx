import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages to show around current page

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      const left = currentPage - delta;
      const right = currentPage + delta;

      if (left > 2) {
        pages.push('...');
      }

      const start = Math.max(2, left);
      const end = Math.min(totalPages - 1, right);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (right < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      id="games-pagination-controls"
      className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 select-none"
    >
      {/* Informative Label */}
      <div className="text-xs font-mono text-slate-400 order-2 sm:order-1 text-center sm:text-left">
        <span>
          Đang hiển thị{' '}
          <strong className="text-amber-300 font-bold">
            {startItem} – {endItem}
          </strong>{' '}
          trên tổng số <strong className="text-white font-bold">{totalItems}</strong> game
        </span>
        <span className="hidden md:inline text-slate-600 mx-2">•</span>
        <span className="hidden md:inline text-slate-400">
          Trang <strong className="text-amber-400">{currentPage}</strong> / {totalPages}
        </span>
      </div>

      {/* Pagination Navigation Buttons */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
        {/* First Page (if many pages) */}
        {totalPages > 5 && (
          <button
            id="btn-page-first"
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            aria-label="Về trang đầu tiên"
            title="Về trang đầu"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/40 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-800 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Previous Page */}
        <button
          id="btn-page-prev"
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Trang trước"
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 disabled:opacity-30 disabled:hover:text-slate-300 disabled:hover:border-slate-800 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-xs font-display font-bold cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1.5 text-xs font-mono text-slate-500 font-bold"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                id={`btn-page-${pageNum}`}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105 font-black border border-amber-400'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          id="btn-page-next"
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Trang sau"
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 disabled:opacity-30 disabled:hover:text-slate-300 disabled:hover:border-slate-800 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-xs font-display font-bold cursor-pointer"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page (if many pages) */}
        {totalPages > 5 && (
          <button
            id="btn-page-last"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-label="Đến trang cuối cùng"
            title="Đến trang cuối"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/40 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-800 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
