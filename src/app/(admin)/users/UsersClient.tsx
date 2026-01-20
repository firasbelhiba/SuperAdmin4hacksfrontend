"use client";

import { useRouter } from "next/navigation";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { GenericFilterBar } from "@/components/common/GenericFilterBar";
import { Pagination } from "@/components/common/Pagination";
import { Card } from "@/components/ui/card/Card";
import Select from "@/components/ui/select/Select";
import { usePaginatedApi } from "@/hooks/usePaginatedApi";
import { useSelectedUser } from "@/context/SelectedUserContext";
import {
  getUsers,
  User,
  UserFilters,
} from "@/services/users";
import { Users as UsersIcon, Shield, Ban, CheckCircle2, Search } from "lucide-react";

export default function UsersClient() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuthGuard();
  const { setSelectedUser } = useSelectedUser();

  // Utiliser le hook avec pagination et filtres
  const {
    data: users,
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
  } = usePaginatedApi<User, UserFilters>({
    fetchFn: getUsers,
    initialLimit: 12,
    debounceDelay: 500,
  });

  if (authLoading) {
    return <LoadingSpinner text="Checking permissions..." />;
  }

  return (
    <>

      {/* Filtres */}
      <GenericFilterBar
        hasActiveFilters={Object.values(filters).some((value) => value !== undefined && value !== "")}
        onClearFilters={clearFilters}
        totalResults={meta?.total}
        showingResults={users.length}
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
                placeholder="Search by name, email..."
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
              value={filters.isBanned !== undefined ? String(filters.isBanned) : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "true") {
                  setFilter("isBanned", true);
                } else if (value === "false") {
                  setFilter("isBanned", false);
                } else {
                  setFilter("isBanned", undefined);
                }
              }}
              options={[
                { value: "", label: "All Status" },
                { value: "false", label: "Active" },
                { value: "true", label: "Banned" },
              ]}
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
              Role
            </label>
            <Select
              name="role"
              value={filters.role as string || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFilter("role", value ? value as "ADMIN" | "USER" : undefined);
              }}
              options={[
                { value: "", label: "All Roles" },
                { value: "ADMIN", label: "Admin" },
                { value: "USER", label: "User" },
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
          <LoadingSpinner text="Loading users..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border-2 border-[#FF4B1E] dark:border-error-500 bg-[#FFE8E8] dark:bg-error-950 p-6 text-center">
          <p className="text-[#FF4B1E] dark:text-error-400 font-medium">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] p-12 text-center">
          <UsersIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#18191F] dark:text-white mb-2">
            No users found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {Object.keys(filters).length > 0
              ? "Try adjusting your filters"
              : "No users registered yet"}
          </p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && !error && users.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card
                key={user.id}
                variant="list"
                type={user.isBanned ? "danger" : "success"}
                title=""
                onClick={() => {
                  setSelectedUser(user);
                  router.push(`/users/${user.id}`);
                }}
              >
                {/* Header avec avatar et badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-12 h-12 rounded-lg border-2 border-[#18191F] object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg border-2 border-[#18191F] dark:border-brand-700 bg-[#FFFBEA] dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-xl font-bold text-[#18191F] dark:text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-[#18191F] dark:text-white">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>

                  {/* Badges Role et Status */}

                  <div className="flex flex-col gap-2 items-end">
                   {/* Status Badge */}
                    {user.isBanned ? (
                      <span className="px-3 py-1 rounded-lg border-2 border-[#18191F] text-xs font-bold bg-[#FF4B1E] text-white">
                       
                        BANNED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg border-2 border-[#18191F] text-xs font-bold bg-[#56CCA9] text-white">
                    
                        ACTIVE
                      </span>
                    )}

                    {/* Role Badge */}
                    <span className="px-3 py-1 rounded-lg border-2 border-[#18191F] text-xs font-bold bg-[#FFBD12] text-[#18191F]">
                      {user.role === "ADMIN" && <Shield className="inline h-3 w-3 mr-1" />}
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-[#18191F] dark:text-white truncate">{user.email}</p>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Joined</span>
                    <span className="font-medium text-[#18191F] dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex justify-between mt-1">
                      <span>Last Login</span>
                      <span className="font-medium text-[#18191F] dark:text-white">
                        {new Date(user.lastLoginAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Banned Reason */}
                {user.isBanned && user.bannedReason && (
                  <div className="mt-3 p-2 bg-[#FFE8E8] dark:bg-error-950 rounded-lg">
                    <p className="text-xs text-[#FF4B1E] dark:text-error-400 font-medium">
                      Reason: {user.bannedReason}
                    </p>
                  </div>
                )}
              </Card>
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
    </>
  );
}

