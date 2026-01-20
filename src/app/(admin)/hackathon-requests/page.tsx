"use client";

import { useRouter } from "next/navigation";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { GenericFilterBar } from "@/components/common/GenericFilterBar";
import { Pagination } from "@/components/common/Pagination";
import { Card } from "@/components/ui/card";
import Select from "@/components/ui/select/Select";
import { usePaginatedApi } from "@/hooks/usePaginatedApi";
import {
  getHackathonRequests,
  HackathonRequest,
  HackathonRequestFilters,
} from "@/services/hackathon-requests";
import { FileText, Search } from "lucide-react";

export default function HackathonRequestsPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuthGuard();

  // Utiliser le hook avec pagination et filtres
  const {
    data: requests,
    meta,
    loading,
    error,
    filters,
    setFilter,
    clearFilters,
    page,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    setPage,
  } = usePaginatedApi<HackathonRequest, HackathonRequestFilters>({
    fetchFn: getHackathonRequests,
    initialLimit: 12,
    debounceDelay: 500,
  });

  if (authLoading) {
    return <LoadingSpinner text="Checking permissions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
            Hackathon Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and review hackathon submissions
          </p>
        </div>
      </div>

      {/* Filtres */}
      <GenericFilterBar
        hasActiveFilters={Object.values(filters).some((value) => value !== undefined && value !== "")}
        onClearFilters={clearFilters}
        totalResults={meta?.total}
        showingResults={requests.length}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, slug..."
                value={(filters.search as string) || ""}
                onChange={(e) => setFilter("search", e.target.value || undefined)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-900 text-[#18191F] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#56CCA9]/20 focus:border-[#56CCA9]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Status
            </label>
            <Select
              name="status"
              value={filters.status as string || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFilter("status", value ? value as any : undefined);
              }}
              options={[
                { value: "", label: "All Status" },
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
              ]}
            />
          </div>

          {/* Organization ID */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Organization ID
            </label>
            <input
              type="text"
              placeholder="Filter by organization..."
              value={(filters.organizationId as string) || ""}
              onChange={(e) => setFilter("organizationId", e.target.value || undefined)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-900 text-[#18191F] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#56CCA9]/20 focus:border-[#56CCA9]"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Sort By
            </label>
            <Select
              name="sortBy"
              value={(filters.sortBy as string) || "createdAt"}
              onChange={(e) => setFilter("sortBy", e.target.value || undefined)}
              options={[
                { value: "createdAt", label: "Date Created" },
                { value: "startDate", label: "Start Date" },
                { value: "prizePool", label: "Prize Pool" },
                { value: "hackTitle", label: "Title" },
              ]}
            />
          </div>

          {/* Start Date From */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Start Date From
            </label>
            <input
              type="date"
              value={(filters.startDateFrom as string) || ""}
              onChange={(e) => setFilter("startDateFrom", e.target.value || undefined)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-900 text-[#18191F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#56CCA9]/20 focus:border-[#56CCA9]"
            />
          </div>

          {/* Start Date To */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Start Date To
            </label>
            <input
              type="date"
              value={(filters.startDateTo as string) || ""}
              onChange={(e) => setFilter("startDateTo", e.target.value || undefined)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-900 text-[#18191F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#56CCA9]/20 focus:border-[#56CCA9]"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Order
            </label>
            <Select
              name="sortOrder"
              value={filters.sortOrder || "desc"}
              onChange={(e) => setFilter("sortOrder", e.target.value as "asc" | "desc" | undefined)}
              options={[
                { value: "desc", label: "Newest First" },
                { value: "asc", label: "Oldest First" },
              ]}
            />
          </div>
        </div>
      </GenericFilterBar>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Loading requests..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border-2 border-[#FF4B1E] dark:border-error-500 bg-[#FFE8E8] dark:bg-error-950 p-6 text-center">
          <p className="text-[#FF4B1E] dark:text-error-400 font-medium">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && requests.length === 0 && (
        <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#18191F] dark:text-white mb-2">
            No requests found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {Object.keys(filters).length > 0
              ? "Try adjusting your filters"
              : "No hackathon requests have been submitted yet"}
          </p>
        </div>
      )}

      {/* Requests Grid */}
      {!loading && !error && requests.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <Card
                key={request.id}
                variant="list"
                status={request.status}
                title={request.hackTitle}
                subtitle={request.organization?.name}
                date={request.startDate}
                location={
                  request.hackCity && request.hackCountry
                    ? `${request.hackCity}, ${request.hackCountry}`
                    : request.hackCountry || request.hackCity
                }
                participants={request.expectedAttendees}
                prizePool={request.prizePool}
                prizeToken={request.prizeToken}
                onClick={() => router.push(`/hackathon-requests/${request.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              onPageChange={setPage}
              onFirstPage={goToFirstPage}
              onLastPage={goToLastPage}
              onNextPage={nextPage}
              onPrevPage={prevPage}
              hasNextPage={meta.hasNextPage}
              hasPrevPage={meta.hasPrevPage}
              showPageNumbers={true}
              maxPageNumbers={5}
            />
          )}
        </>
      )}
    </div>
  );
}
