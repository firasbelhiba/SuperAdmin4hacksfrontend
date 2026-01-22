"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import useAuthGuard from "@/hooks/useAuthGuard";
import { usePaginatedApi } from "@/hooks/usePaginatedApi";
import { getAnomalies } from "@/services/health";
import { Anomaly, AnomalySeverity, AnomalyType } from "@/services/health/healthType";
import { useRouter } from "next/navigation";
import { AlertTriangle, Activity, Calendar, TrendingUp, TrendingDown, ChevronRight, Zap } from "lucide-react";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { Pagination } from "@/components/common/Pagination";

export default function AnomaliesClient() {
  const { isLoading: authLoading } = useAuthGuard();
  const router = useRouter();

  const {
    data: anomaliesData,
    meta,
    loading,
    error,
    page,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    setPage,
  } = usePaginatedApi<Anomaly, Record<string, never>>({
    fetchFn: getAnomalies,
    initialLimit: 12,
  });

  if (authLoading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  const getSeverityBadgeStyle = (severity: AnomalySeverity) => {
    switch (severity) {
      case "INFO":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "WARNING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    }
  };

  const getAnomalyTypeIcon = (type: AnomalyType) => {
    switch (type) {
      case "INACTIVE_PERIOD":
        return <Activity className="w-5 h-5" />;
      case "SPIKE":
        return <TrendingUp className="w-5 h-5" />;
      case "DROP":
        return <TrendingDown className="w-5 h-5" />;
      case "UNUSUAL_PATTERN":
        return <Zap className="w-5 h-5" />;
    }
  };

  const getAnomalyTypeLabel = (type: AnomalyType) => {
    switch (type) {
      case "INACTIVE_PERIOD":
        return "Inactive Period";
      case "SPIKE":
        return "Spike";
      case "DROP":
        return "Drop";
      case "UNUSUAL_PATTERN":
        return "Unusual Pattern";
    }
  };

  const handleCardClick = (anomaly: Anomaly) => {
    const encodedData = encodeURIComponent(JSON.stringify(anomaly));
    router.push(`/health-dashboard/anomalies/${anomaly.id}?data=${encodedData}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#18191F] dark:text-white">
            Activity Anomalies
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Unusual patterns and activities detected across hackathons
          </p>
        </div>
        {meta && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-[#18191F] dark:text-white">
              {meta.total}
            </span>{" "}
            anomalies detected
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner text="Loading anomalies..." />}

      {/* Error State */}
      {error && <ErrorDisplay message={error.message} />}

      {/* Anomalies Grid */}
      {!loading && !error && (
        <>
          {anomaliesData && anomaliesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {anomaliesData.map((anomaly) => (
                <div
                  key={anomaly.id}
                  onClick={() => handleCardClick(anomaly)}
                  className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_var(--color-brand-700)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150 overflow-hidden cursor-pointer group"
                >
                  {/* Header with Severity */}
                  <div className={`p-4 ${anomaly.severity === "CRITICAL" ? "bg-red-50 dark:bg-red-900/20" : anomaly.severity === "WARNING" ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getAnomalyTypeIcon(anomaly.anomalyType)}
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getSeverityBadgeStyle(anomaly.severity)}`}>
                          {anomaly.severity}
                        </span>
                      </div>
                      {anomaly.isResolved && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          RESOLVED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Anomaly Type */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Type
                      </p>
                      <h3 className="text-base font-bold text-[#18191F] dark:text-white">
                        {getAnomalyTypeLabel(anomaly.anomalyType)}
                      </h3>
                    </div>

                    {/* Hackathon Title */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Hackathon
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 font-medium">
                        {anomaly.hackathonTitle}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {anomaly.description}
                      </p>
                    </div>

                    {/* Metric Info */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Expected:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{anomaly.expectedValue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Actual:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{anomaly.actualValue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Deviation:</span>
                        <span className={`font-bold ${anomaly.deviation > 50 ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                          {anomaly.deviation}%
                        </span>
                      </div>
                    </div>

                    {/* Detected At */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(anomaly.detectedAt).toLocaleDateString()}
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
                No anomalies detected
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                All activities are within normal parameters
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
