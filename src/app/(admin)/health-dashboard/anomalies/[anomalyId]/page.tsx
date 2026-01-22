"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { Anomaly, AnomalySeverity, AnomalyType } from "@/services/health/healthType";
import {
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BarChart3,
} from "lucide-react";

export default function AnomalyDetailPage() {
  const { isLoading: authLoading } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const encodedData = searchParams.get("data");

  const anomaly = useMemo<Anomaly | null>(() => {
    if (!encodedData) return null;
    
    try {
      return JSON.parse(decodeURIComponent(encodedData));
    } catch (err) {
      console.error("Failed to parse anomaly data:", err);
      return null;
    }
  }, [encodedData]);

  if (authLoading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  if (!anomaly) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="neo-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        <ErrorDisplay message="Anomaly not found" />
      </div>
    );
  }

  const getSeverityBadgeStyle = (severity: AnomalySeverity) => {
    switch (severity) {
      case "INFO":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-500";
      case "WARNING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-500";
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-500";
    }
  };

  const getAnomalyTypeIcon = (type: AnomalyType, severity: AnomalySeverity) => {
    const colorClass = severity === "CRITICAL" 
      ? "text-red-600 dark:text-red-400" 
      : severity === "WARNING" 
      ? "text-yellow-600 dark:text-yellow-400" 
      : "text-blue-600 dark:text-blue-400";
    
    switch (type) {
      case "INACTIVE_PERIOD":
        return <Activity className={`w-6 h-6 ${colorClass}`} />;
      case "SPIKE":
        return <TrendingUp className={`w-6 h-6 ${colorClass}`} />;
      case "DROP":
        return <TrendingDown className={`w-6 h-6 ${colorClass}`} />;
      case "UNUSUAL_PATTERN":
        return <Zap className={`w-6 h-6 ${colorClass}`} />;
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

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="neo-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Anomalies
      </button>

      {/* Header Card */}
      <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] overflow-hidden">
        {/* Severity Banner */}
        <div className={`p-6 ${anomaly.severity === "CRITICAL" ? "bg-red-50 dark:bg-red-900/20" : anomaly.severity === "WARNING" ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {getAnomalyTypeIcon(anomaly.anomalyType, anomaly.severity)}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold uppercase border-2 ${getSeverityBadgeStyle(anomaly.severity)}`}>
                    {anomaly.severity}
                  </div>
                  {anomaly.isResolved && (
                    <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-green-500">
                      RESOLVED
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {getAnomalyTypeLabel(anomaly.anomalyType)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {anomaly.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Deviation
              </p>
              <p className={`text-4xl font-bold ${anomaly.deviation > 50 ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                {anomaly.deviation}%
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Hackathon
                </p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {anomaly.hackathonTitle}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Metric
                </p>
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {anomaly.metric}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Detected At
                </p>
                <p className="text-base text-gray-700 dark:text-gray-300">
                  {new Date(anomaly.detectedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Created
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(anomaly.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Updated
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(anomaly.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b-2 border-[#18191F] dark:border-brand-700">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-bold text-[#18191F] dark:text-white">
              Metric Analysis
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Expected vs actual values comparison
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800">
            <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide font-bold mb-2">
              Expected Value
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {anomaly.expectedValue}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide font-bold mb-2">
              Actual Value
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {anomaly.actualValue}
            </p>
          </div>
        </div>
      </div>

      {/* Causes and Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Possible Causes */}
        <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] overflow-hidden">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-b-2 border-[#18191F] dark:border-brand-700">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-bold text-[#18191F] dark:text-white">
                Possible Causes
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Potential reasons for this anomaly
            </p>
          </div>
          <div className="p-4">
            {anomaly.possibleCauses.length > 0 ? (
              <ul className="space-y-3">
                {anomaly.possibleCauses.map((cause, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800"
                  >
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {cause}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No causes identified
              </p>
            )}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] overflow-hidden">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b-2 border-[#18191F] dark:border-brand-700">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-bold text-[#18191F] dark:text-white">
                Recommended Actions
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Steps to address this anomaly
            </p>
          </div>
          <div className="p-4">
            {anomaly.recommendedActions.length > 0 ? (
              <ul className="space-y-3">
                {anomaly.recommendedActions.map((action, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {action}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No recommended actions
              </p>
            )}
          </div>
        </div>
      </div>

      {/* IDs Section */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          System Information
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Anomaly ID:</span>{" "}
            <span className="text-gray-700 dark:text-gray-300">{anomaly.id}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Hackathon ID:</span>{" "}
            <span className="text-gray-700 dark:text-gray-300">{anomaly.hackathonId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
