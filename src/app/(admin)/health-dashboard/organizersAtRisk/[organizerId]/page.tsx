"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { AtRiskOrganizer, RiskLevel } from "@/services/health/healthType";
import {
  AlertTriangle,
  Building,
  Calendar,
  TrendingDown,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  Lightbulb,
} from "lucide-react";

export default function OrganizerAtRiskDetailPage() {
  const { isLoading: authLoading } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const encodedData = searchParams.get("data");

  const organizer = useMemo<AtRiskOrganizer | null>(() => {
    if (!encodedData) return null;
    
    try {
      return JSON.parse(decodeURIComponent(encodedData));
    } catch (err) {
      console.error("Failed to parse organizer data:", err);
      return null;
    }
  }, [encodedData]);

  if (authLoading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  if (!organizer) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="neo-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        <ErrorDisplay message="Organizer not found" />
      </div>
    );
  }

  const getRiskLevelBadgeStyle = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-500";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-500";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-500";
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-500";
    }
  };

  const getRiskLevelIcon = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "CRITICAL":
        return <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />;
      case "HIGH":
        return <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />;
      case "MEDIUM":
        return <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
      case "LOW":
        return <TrendingDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
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
        Back to Organizers At Risk
      </button>

      {/* Header Card */}
      <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] overflow-hidden">
        {/* Risk Level Banner */}
        <div className={`p-6 ${organizer.riskLevel === "CRITICAL" ? "bg-red-50 dark:bg-red-900/20" : organizer.riskLevel === "HIGH" ? "bg-orange-50 dark:bg-orange-900/20" : organizer.riskLevel === "MEDIUM" ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {getRiskLevelIcon(organizer.riskLevel)}
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold uppercase border-2 ${getRiskLevelBadgeStyle(organizer.riskLevel)}`}>
                  {organizer.riskLevel} RISK
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This organizer requires immediate attention
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Risk Score
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {organizer.riskScore}
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Organizer
                </p>
                <p className="text-xl font-bold text-[#18191F] dark:text-white">
                  {organizer.organizerName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Hackathon
                </p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {organizer.hackathonTitle}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Last Activity
                </p>
                <p className="text-base text-gray-700 dark:text-gray-300">
                  {organizer.lastActivityAt
                    ? new Date(organizer.lastActivityAt).toLocaleString()
                    : "No recent activity"}
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
                    {new Date(organizer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Updated
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(organizer.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Concerns and Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Concerns */}
        <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] overflow-hidden">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b-2 border-[#18191F] dark:border-brand-700">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-bold text-[#18191F] dark:text-white">
                Primary Concerns
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Critical issues requiring immediate attention
            </p>
          </div>
          <div className="p-4">
            {organizer.primaryConcerns.length > 0 ? (
              <ul className="space-y-3">
                {organizer.primaryConcerns.map((concern, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {concern}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No primary concerns
              </p>
            )}
          </div>
        </div>

        {/* Secondary Concerns */}
        <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] overflow-hidden">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b-2 border-[#18191F] dark:border-brand-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-bold text-[#18191F] dark:text-white">
                Secondary Concerns
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Additional areas that need improvement
            </p>
          </div>
          <div className="p-4">
            {organizer.secondaryConcerns.length > 0 ? (
              <ul className="space-y-3">
                {organizer.secondaryConcerns.map((concern, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800"
                  >
                    <TrendingDown className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {concern}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No secondary concerns
              </p>
            )}
          </div>
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
            Suggested steps to improve the situation
          </p>
        </div>
        <div className="p-4">
          {organizer.recommendedActions.length > 0 ? (
            <ul className="space-y-3">
              {organizer.recommendedActions.map((action, idx) => (
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

      {/* IDs Section (for debugging/admin purposes) */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          System Information
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Organizer ID:</span>{" "}
            <span className="text-gray-700 dark:text-gray-300">{organizer.organizerId}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Hackathon ID:</span>{" "}
            <span className="text-gray-700 dark:text-gray-300">{organizer.hackathonId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
