"use client";

import { useRouter } from "next/navigation";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { GenericFilterBar } from "@/components/common/GenericFilterBar";
import { Pagination } from "@/components/common/Pagination";
import { Card } from "@/components/ui/card/Card";
import { usePaginatedApi } from "@/hooks/usePaginatedApi";
import {
  getPlans,
  Plan,
  PlansFilterParams,
} from "@/services/plans";
import { Package, CheckCircle2, XCircle, Search } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/ui/select/Select";

export default function PlansPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuthGuard();

  // Hook avec pagination et filtres
  const {
    data: plans,
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
  } = usePaginatedApi<Plan, PlansFilterParams>({
    fetchFn: getPlans,
    initialLimit: 20,
    debounceDelay: 500,
  });

  const handlePlanClick = (planId: string) => {
    router.push(`/plans/${planId}`);
  };

  if (authLoading) {
    return <LoadingSpinner text="Checking permissions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
            Plans Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage subscription plans and pricing
          </p>
        </div>
        <Button
          variant="warning"
          onClick={() => router.push("/plans/new")}
          className="flex items-center gap-2"
        >
          <Package size={18} />
          Add Plan
        </Button>
      </div>

      {/* Filtres */}
      <GenericFilterBar
        hasActiveFilters={Object.values(filters).some((value) => value !== undefined && value !== "")}
        onClearFilters={clearFilters}
        totalResults={meta?.total}
        showingResults={plans?.length}
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
                placeholder="Search by plan name..."
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
              name="isActive"
              value={filters.isActive !== undefined ? String(filters.isActive) : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "true") {
                  setFilter("isActive", true);
                } else if (value === "false") {
                  setFilter("isActive", false);
                } else {
                  setFilter("isActive", undefined);
                }
              }}
              options={[
                { value: "", label: "All Status" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
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
              onChange={(e) => setFilter("sortBy", e.target.value as "name" | "id" | "createdAt" | undefined)}
              options={[
                { value: "createdAt", label: "Date Created" },
                { value: "name", label: "Name" },
                { value: "id", label: "ID" },
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
          <LoadingSpinner text="Loading plans..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border-2 border-[#FF4B1E] dark:border-error-500 bg-[#FFE8E8] dark:bg-error-950 p-6 text-center">
          <p className="text-[#FF4B1E] dark:text-error-400 font-medium">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!plans || plans.length === 0) && (
        <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#18191F] dark:text-white mb-2">
            No plans found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {Object.keys(filters).length > 0
              ? "Try adjusting your filters"
              : "No subscription plans available yet"}
          </p>
        </div>
      )}

      {/* Plans Grid */}
      {!loading && !error && plans && plans.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handlePlanClick(plan.id)}
                className="rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_rgba(209,213,219,0.3)] hover:shadow-[6px_6px_0_0_#18191F] dark:hover:shadow-[6px_6px_0_0_rgba(209,213,219,0.3)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#56CCA9]/10 border-2 border-[#18191F] dark:border-gray-300">
                        <Package className="w-6 h-6 text-[#56CCA9]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#18191F] dark:text-white">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {plan.slug}
                        </p>
                      </div>
                    </div>
                    {plan.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-[#18191F] dark:border-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-2 border-[#18191F] dark:border-gray-600">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-[#18191F] dark:text-white">
                        {plan._count.subscriptions}
                      </span>
                      Subscriptions
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(plan.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
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
