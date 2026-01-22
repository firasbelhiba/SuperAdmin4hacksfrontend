"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import useAuthGuard from "@/hooks/useAuthGuard";
import { usePaginatedApi } from "@/hooks/usePaginatedApi";
import { getOrgAtRiskOrganizers } from "@/services/health";
import { AtRiskOrganizer, RiskLevel } from "@/services/health/healthType";
import { useRouter } from "next/navigation";
import { AlertTriangle, Building, Calendar, TrendingDown, ChevronRight } from "lucide-react";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { Pagination } from "@/components/common/Pagination";

export default function HealthRiskClient() {
  const { isLoading: authLoading } = useAuthGuard();
  const router = useRouter();

  const {
    data: organizersData,
    meta,
    loading,
    error,
    page,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    setPage,
  } = usePaginatedApi<AtRiskOrganizer, Record<string, never>>({
    fetchFn: getOrgAtRiskOrganizers,
    initialLimit: 12,
  });

  if (authLoading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  const getRiskLevelBadgeStyle = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    }
  };

  const getRiskLevelIcon = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "CRITICAL":
      case "HIGH":
        return <AlertTriangle className="w-5 h-5" />;
      case "MEDIUM":
        return <TrendingDown className="w-5 h-5" />;
      case "LOW":
        return <TrendingDown className="w-5 h-5" />;
    }
  };

  const handleCardClick = (organizer: AtRiskOrganizer) => {
    // Encoder les données dans l'URL pour éviter un appel API supplémentaire
    const encodedData = encodeURIComponent(JSON.stringify(organizer));
    router.push(`/health-dashboard/organizersAtRisk/${organizer.organizerId}?data=${encodedData}`);
  };

  return (
    <div className="space-y-6">


      {/* Loading State */}
      {loading && <LoadingSpinner text="Loading organizers at risk..." />}

      {/* Error State */}
      {error && <ErrorDisplay message={error.message} />}

      {/* Organizers Grid */}
      {!loading && !error && (
        <>
          {organizersData && organizersData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizersData.map((organizer) => (
                <div
                  key={`${organizer.organizerId}-${organizer.hackathonId}`}
                  onClick={() => handleCardClick(organizer)}
                  className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_var(--color-brand-700)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150 overflow-hidden cursor-pointer group"
                >
                  {/* Header with Risk Level */}
                  <div className={`p-4 ${organizer.riskLevel === "CRITICAL" ? "bg-red-50 dark:bg-red-900/20" : organizer.riskLevel === "HIGH" ? "bg-orange-50 dark:bg-orange-900/20" : "bg-yellow-50 dark:bg-yellow-900/20"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getRiskLevelIcon(organizer.riskLevel)}
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getRiskLevelBadgeStyle(organizer.riskLevel)}`}>
                          {organizer.riskLevel} RISK
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {organizer.riskScore}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Organizer Name */}
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Organizer
                        </p>
                        <h3 className="text-base font-bold text-[#18191F] dark:text-white truncate">
                          {organizer.organizerName}
                        </h3>
                      </div>
                    </div>

                    {/* Hackathon Title */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Hackathon
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 font-medium">
                        {organizer.hackathonTitle}
                      </p>
                    </div>

                    {/* Primary Concerns */}
                    {organizer.primaryConcerns.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Primary Concerns
                        </p>
                        <ul className="space-y-1">
                          {organizer.primaryConcerns.slice(0, 2).map((concern, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span className="text-red-500 dark:text-red-400 mt-0.5">•</span>
                              <span className="flex-1">{concern}</span>
                            </li>
                          ))}
                          {organizer.primaryConcerns.length > 2 && (
                            <li className="text-xs text-gray-500 dark:text-gray-500 italic">
                              +{organizer.primaryConcerns.length - 2} more concerns
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Last Activity */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {organizer.lastActivityAt
                            ? `Active ${new Date(organizer.lastActivityAt).toLocaleDateString()}`
                            : "No recent activity"}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No organizers at risk found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                All organizers are performing well!
              </p>
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