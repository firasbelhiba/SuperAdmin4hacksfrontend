import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

/**
 * Composant Pagination pour naviguer entre les pages
 * Respecte le thème neo-brutalism avec bordures épaisses et couleurs vives
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage,
  showPageNumbers = true,
  maxPageNumbers = 5,
}: PaginationProps) {
  // Calculer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxPageNumbers) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher un sous-ensemble de pages
      const halfMax = Math.floor(maxPageNumbers / 2);
      let startPage = Math.max(1, currentPage - halfMax);
      let endPage = Math.min(totalPages, currentPage + halfMax);
      
      // Ajuster si on est près du début ou de la fin
      if (currentPage <= halfMax) {
        endPage = maxPageNumbers;
      } else if (currentPage >= totalPages - halfMax) {
        startPage = totalPages - maxPageNumbers + 1;
      }
      
      // Ajouter la première page et ellipsis si nécessaire
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }
      
      // Ajouter les pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Ajouter ellipsis et dernière page si nécessaire
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_rgba(209,213,219,0.3)] p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-bold text-[#18191F] dark:text-white">{startItem}</span> to{" "}
          <span className="font-bold text-[#18191F] dark:text-white">{endItem}</span> of{" "}
          <span className="font-bold text-[#18191F] dark:text-white">{totalItems}</span> results
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* First Page */}
          <button
            onClick={onFirstPage}
            disabled={!hasPrevPage}
            className={`p-2 rounded-lg border-2 border-[#18191F] dark:border-gray-300 transition-all
              ${hasPrevPage
                ? "bg-white dark:bg-gray-800 hover:bg-[#FFBD12] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_rgba(209,213,219,0.3)]"
                : "bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed"
              }`}
            title="First Page"
          >
            <ChevronsLeft className="h-5 w-5 text-[#18191F] dark:text-white" />
          </button>

          {/* Previous Page */}
          <button
            onClick={onPrevPage}
            disabled={!hasPrevPage}
            className={`p-2 rounded-lg border-2 border-[#18191F] dark:border-gray-300 transition-all
              ${hasPrevPage
                ? "bg-white dark:bg-gray-800 hover:bg-[#FFBD12] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_rgba(209,213,219,0.3)]"
                : "bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed"
              }`}
            title="Previous Page"
          >
            <ChevronLeft className="h-5 w-5 text-[#18191F] dark:text-white" />
          </button>

          {/* Page Numbers */}
          {showPageNumbers && (
            <div className="flex items-center gap-2">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="px-3 py-2 text-[#18191F] dark:text-white">...</span>
                  ) : (
                    <button
                      onClick={() => onPageChange(page as number)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg border-2 border-[#18191F] dark:border-gray-300 font-medium transition-all
                        ${currentPage === page
                          ? "bg-[#FFBD12] text-[#18191F] shadow-[2px_2px_0_0_#18191F] dark:shadow-[2px_2px_0_0_rgba(209,213,219,0.3)]"
                          : "bg-white dark:bg-gray-800 text-[#18191F] dark:text-white hover:bg-[#FFFBEA] dark:hover:bg-gray-700 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_rgba(209,213,219,0.3)]"
                        }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Next Page */}
          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className={`p-2 rounded-lg border-2 border-[#18191F] dark:border-gray-300 transition-all
              ${hasNextPage
                ? "bg-white dark:bg-gray-800 hover:bg-[#FFBD12] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_rgba(209,213,219,0.3)]"
                : "bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed"
              }`}
            title="Next Page"
          >
            <ChevronRight className="h-5 w-5 text-[#18191F] dark:text-white" />
          </button>

          {/* Last Page */}
          <button
            onClick={onLastPage}
            disabled={!hasNextPage}
            className={`p-2 rounded-lg border-2 border-[#18191F] dark:border-gray-300 transition-all
              ${hasNextPage
                ? "bg-white dark:bg-gray-800 hover:bg-[#FFBD12] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_rgba(209,213,219,0.3)]"
                : "bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed"
              }`}
            title="Last Page"
          >
            <ChevronsRight className="h-5 w-5 text-[#18191F] dark:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
