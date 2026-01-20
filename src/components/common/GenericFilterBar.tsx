"use client";

import React, { useState, ReactNode } from "react";
import { Filter, X } from "lucide-react";

export interface GenericFilterBarProps {
  children: ReactNode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  totalResults?: number;
  showingResults?: number;
  defaultOpen?: boolean;
}

/**
 * Composant FilterBar générique avec render props
 * Fournit la structure (card, show/hide, clear button, stats)
 * Le contenu des filtres est défini via children pour une flexibilité totale
 */
export function GenericFilterBar({
  children,
  hasActiveFilters = false,
  onClearFilters,
  totalResults,
  showingResults,
  defaultOpen = false,
}: GenericFilterBarProps) {
  const [showFilters, setShowFilters] = useState(defaultOpen);

  return (
    <div className="space-y-4">
      {/* Header avec toggle et clear */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="neo-btn"
        >
          <Filter size={18} />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-[#56CCA9] text-white rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="neo-btn"
          >
            <X size={18} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Contenu des filtres */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_rgba(209,213,219,0.3)] p-6">
          {children}

          {/* Results Info */}
          {totalResults !== undefined && (
            <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-bold text-[#18191F] dark:text-white">
                  {showingResults !== undefined ? showingResults : totalResults}
                </span>{" "}
                of <span className="font-bold text-[#18191F] dark:text-white">{totalResults}</span>{" "}
                results
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
