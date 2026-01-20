"use client";

import { useRouter } from "next/navigation";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { GenericFilterBar } from "@/components/common/GenericFilterBar";
import { Pagination } from "@/components/common/Pagination";
import { usePaginatedApi } from "@/hooks/usePaginatedApi";
import {
  getSubscriptions,
  Subscription,
  SubscriptionsFilterParams,
  SubscriptionStatus,
} from "@/services/subscriptions";
import { CreditCard } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/ui/select/Select";
import SearchableSelect from "@/components/form/SearchableSelect";
import { DataTable } from "@/components/ui/table/DataTable";
import { subscriptionColumns } from "@/components/subscriptions/SubscriptionColumns";
import { getUsers } from "@/services/users";
import { getPlans } from "@/services/plans";

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuthGuard();

  // Hook avec pagination et filtres
  const {
    data: subscriptions,
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
  } = usePaginatedApi<Subscription, SubscriptionsFilterParams>({
    fetchFn: getSubscriptions,
    initialLimit: 10,
    debounceDelay: 500,
  });

  const handleSubscriptionClick = (subscription: Subscription) => {
    router.push(`/subscriptions/${subscription.id}`);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== "");

  if (authLoading) {
    return <LoadingSpinner text="Checking permissions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
            Subscriptions Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user subscriptions and billing
          </p>
        </div>
        <Button
          variant="warning"
          onClick={() => router.push("/subscriptions/new")}
          className="flex items-center gap-2"
        >
          <CreditCard size={18} />
          New Subscription
        </Button>
      </div>

      {/* Filtres */}
      <GenericFilterBar
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        totalResults={meta?.total}
        showingResults={subscriptions?.length}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* User Filter */}
              <div>
                <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
                  User
                </label>
                <SearchableSelect
                  value={filters.userId as string || ""}
                  onChange={(value) => setFilter("userId", value || undefined)}
                  onSearch={async (query) => {
                    const response = await getUsers({ search: query }, 1, 20);
                    return response.data.map((user) => ({
                      value: user.id,
                      label: user.name,
                      subtitle: user.email,
                    }));
                  }}
                  placeholder="All Users"
                  searchPlaceholder="Search users..."
                  emptyMessage="Type to search users"
                  noResultsMessage="No users found"
                />
              </div>

              {/* Plan Filter */}
              <div>
                <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
                  Plan
                </label>
                <SearchableSelect
                  value={filters.planId as string || ""}
                  onChange={(value) => setFilter("planId", value || undefined)}
                  onSearch={async (query) => {
                    const response = await getPlans({ search: query, isActive: true }, 1, 20);
                    return response.data.map((plan) => ({
                      value: plan.id,
                      label: plan.name,
                      subtitle: plan.description,
                    }));
                  }}
                  placeholder="All Plans"
                  searchPlaceholder="Search plans..."
                  emptyMessage="Type to search plans"
                  noResultsMessage="No plans found"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
                  Status
                </label>
                <Select
                  name="status"
                  value={filters.status as string || ""}
                  onChange={(e) => setFilter("status", e.target.value as SubscriptionStatus)}
                  options={[
                    { value: "", label: "All Status" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "CANCELED", label: "Canceled" },
                    { value: "EXPIRED", label: "Expired" },
                    { value: "PAUSED", label: "Paused" },
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
                  onChange={(e) => setFilter("sortBy", e.target.value as "createdAt" | "startedAt" | "currentPeriodEnd")}
                  options={[
                    { value: "createdAt", label: "Date Created" },
                    { value: "startedAt", label: "Start Date" },
                    { value: "currentPeriodEnd", label: "Period End" },
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
                    { value: "desc", label: "Newest First" },
                    { value: "asc", label: "Oldest First" },
                  ]}
                />
              </div>
            </div>
          </GenericFilterBar>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border-2 border-[#FF4B1E] dark:border-error-500 bg-[#FFE8E8] dark:bg-error-950 p-6 text-center">
          <p className="text-[#FF4B1E] dark:text-error-400 font-medium">{error.message}</p>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={subscriptionColumns}
        data={subscriptions || []}
        onRowClick={handleSubscriptionClick}
        loading={loading}
        emptyMessage={
          hasActiveFilters
            ? "No subscriptions found matching your filters"
            : "No subscriptions available yet"
        }
        emptyIcon={<CreditCard className="h-16 w-16 text-gray-300 dark:text-gray-600" />}
      />
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
    </div>
  );
}
