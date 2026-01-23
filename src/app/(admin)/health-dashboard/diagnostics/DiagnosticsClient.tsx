"use client";

import { Search, Calendar, DollarSign, Building, Activity } from "lucide-react";
import { usePaginatedApi } from "@/hooks/usePaginatedApi";
import { getHackathons, Hackathon, HackathonFilters, HackathonStatus, HackathonType } from "@/services/hackathons";
import  useAuthGuard  from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import {GenericFilterBar} from "@/components/common/GenericFilterBar";
import {Pagination} from "@/components/common/Pagination";
import Input from "@/components/form/input/InputField";
import Select from "@/components/ui/select/Select";
import { useRouter } from "next/navigation";

export default function DiagnosticsClient() {
  const { isLoading: authLoading } = useAuthGuard();
  const router = useRouter();

  const {
    data: hackathons,
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
  } = usePaginatedApi<Hackathon, HackathonFilters>({
    fetchFn: getHackathons,
    initialLimit: 12,
    initialFilters: { status: "ACTIVE" },
  });

  if (authLoading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  const hasActiveFilters =
    !!filters.search ||
    !!filters.type ||
    filters.isPrivate !== undefined ||
    !!filters.prizePoolFrom ||
    !!filters.prizePoolTo ||
    !!filters.startDateFrom ||
    !!filters.startDateTo ||
    !!filters.organizationId ||
    (filters.status && filters.status !== "ACTIVE");

  const getStatusBadgeStyle = (status: HackathonStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "ARCHIVED":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
      case "CANCELLED":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "DRAFT":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    }
  };

  const getTypeBadgeStyle = (type: HackathonType) => {
    switch (type) {
      case "ONLINE":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "IN_PERSON":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      case "HYBRID":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    }
  };

  const handleCardClick = (hackathonId: string) => {
    router.push(`/health-dashboard/diagnostics/${hackathonId}`);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GenericFilterBar
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        totalResults={meta?.total}
        showingResults={hackathons?.length}
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search hackathons..."
                value={filters.search || ""}
                onChange={(e) => setFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Status
            </label>
            <Select
              name="status"
              value={filters.status || ""}
              onChange={(e) => setFilter("status", e.target.value as HackathonStatus)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "ACTIVE", label: "Active" },
                { value: "ARCHIVED", label: "Archived" },
                { value: "CANCELLED", label: "Cancelled" },
                { value: "DRAFT", label: "Draft" },
              ]}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Type
            </label>
            <Select
              name="type"
              value={filters.type || ""}
              onChange={(e) => setFilter("type", e.target.value as HackathonType)}
              options={[
                { value: "", label: "All Types" },
                { value: "ONLINE", label: "Online" },
                { value: "IN_PERSON", label: "In Person" },
                { value: "HYBRID", label: "Hybrid" },
              ]}
            />
          </div>

          {/* Is Private */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Privacy
            </label>
            <Select
              name="isPrivate"
              value={filters.isPrivate === undefined ? "" : filters.isPrivate ? "true" : "false"}
              onChange={(e) =>
                setFilter("isPrivate", e.target.value === "" ? undefined : e.target.value === "true")
              }
              options={[
                { value: "", label: "All" },
                { value: "false", label: "Public" },
                { value: "true", label: "Private" },
              ]}
            />
          </div>

          {/* Prize Pool From */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Min Prize Pool
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                type="number"
                placeholder="0"
                value={filters.prizePoolFrom || ""}
                onChange={(e) => setFilter("prizePoolFrom", e.target.value ? Number(e.target.value) : undefined)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Prize Pool To */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Max Prize Pool
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                type="number"
                placeholder="1000000"
                value={filters.prizePoolTo || ""}
                onChange={(e) => setFilter("prizePoolTo", e.target.value ? Number(e.target.value) : undefined)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Sort By
            </label>
            <Select
              name="sortBy"
              value={filters.sortBy || "createdAt"}
              onChange={(e) => setFilter("sortBy", e.target.value as any)}
              options={[
                { value: "createdAt", label: "Created Date" },
                { value: "startDate", label: "Start Date" },
                { value: "endDate", label: "End Date" },
                { value: "prizePool", label: "Prize Pool" },
                { value: "title", label: "Title" },
                { value: "registrationDate", label: "Registration Start" },
                { value: "registrationEnd", label: "Registration End" },
              ]}
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
              onChange={(e) => setFilter("sortOrder", e.target.value as "asc" | "desc")}
              options={[
                { value: "desc", label: "Descending" },
                { value: "asc", label: "Ascending" },
              ]}
            />
          </div>
        </div>
      </GenericFilterBar>

      {/* Loading State */}
      {loading && <LoadingSpinner text="Loading hackathons..." />}

      {/* Error State */}
      {error && <ErrorDisplay message={error.message} />}

      {/* Hackathons Grid */}
      {!loading && !error && (
        <>
          {hackathons && hackathons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons?.map((hackathon) => (
                <div
                  key={hackathon.id}
                  onClick={() => handleCardClick(hackathon.id)}
                  className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_var(--color-brand-700)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150 overflow-hidden cursor-pointer group"
                >
                  {/* Banner Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-brand-500 to-brand-700 dark:from-brand-600 dark:to-brand-800 flex items-center justify-center">
                    <Activity className="w-16 h-16 text-white/30" />
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Title & Badges */}
                    <div>
                      <h3 className="text-lg font-bold text-[#18191F] dark:text-white mb-2 line-clamp-2">
                        {hackathon.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeStyle(hackathon.status)}`}>
                          {hackathon.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeStyle(hackathon.type)}`}>
                          {hackathon.type.replace("_", " ")}
                        </span>
                        {hackathon.isPrivate && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                            PRIVATE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {hackathon.tagline}
                    </p>

                    {/* Organization */}
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {hackathon.organization.name}
                      </span>
                    </div>

                    {/* Prize Pool */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {hackathon.prizePool.toLocaleString()} {hackathon.prizeToken}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No hackathons found</p>
            </div>
          )}

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
            />
          )}
        </>
      )}

    </div>
  );
}