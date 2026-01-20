"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  emptyIcon,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_rgba(209,213,219,0.3)] p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#56CCA9] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_rgba(209,213,219,0.3)] p-12 text-center">
        {emptyIcon && <div className="flex justify-center mb-4">{emptyIcon}</div>}
        <h3 className="text-xl font-bold text-[#18191F] dark:text-white mb-2">
          {emptyMessage}
        </h3>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_rgba(209,213,219,0.3)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b-2 border-[#18191F] dark:border-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-bold text-[#18191F] dark:text-white uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="hover:text-[#56CCA9] transition-colors"
                          >
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronsUpDown className="w-4 h-4 opacity-50" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={`transition-colors ${
                  onRowClick
                    ? "hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
