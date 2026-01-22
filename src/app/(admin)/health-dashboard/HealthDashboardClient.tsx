"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle,  Info, Users, FileText, Gavel } from "lucide-react";
import { HealthOverview, SignalSeverity } from "@/services/health/healthType";
import { getHealthOverview } from "@/services/health/index";
import  useAuthGuard  from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import {StatCard} from "@/components/ui/stat-card/StatCard";
import { createDynamicChart } from "@/hooks/useDynamicComponent";
import Link from "next/link";

const DonutChart = createDynamicChart(() => import("@/components/chart/DonutChart").then(mod => ({ default: mod.DonutChart })));
const BarChart = createDynamicChart(() => import("@/components/chart/BarChart").then(mod => ({ default: mod.BarChart })));

export default function HealthDashboardClient() {
  const { isLoading: authLoading } = useAuthGuard();
  const [data, setData] = useState<HealthOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getHealthOverview();
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load health metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading]);

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading health dashboard..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!data) {
    return <ErrorDisplay message="No health data available" />;
  }

  // Prepare data for severity distribution chart
  const severityCount: Record<SignalSeverity, number> = {
    CRITICAL: 0,
    WARNING: 0,
    INFO: 0,
  };

  data.keySignals.forEach((signal) => {
    severityCount[signal.severity]++;
  });

  const severityChartData = {
    CRITICAL: severityCount.CRITICAL,
    WARNING: severityCount.WARNING,
    INFO: severityCount.INFO,
  };

  const severityColors = ["#FF4B1E", "#FFBD12", "#6366F1"];

  // Prepare data for signal types bar chart
  const signalTypeData = data.keySignals.map((signal) => ({
    label: signal.type.replace(/_/g, " "),
    count: signal.affectedCount,
  }));

  // Risk level styling
  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-500";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-500";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-500";
      case "LOW":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-500";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-500";
    }
  };

  const getSeverityIcon = (severity: SignalSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "INFO":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadgeStyle = (severity: SignalSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "WARNING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "INFO":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    }
  };

  return (
    <div className="space-y-8">
      {/* Overall Health Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#18191F] dark:text-white">
                  {data.overallHealthScore}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Score
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#18191F] dark:text-white mb-1">
              Overall Platform Health
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg border-2 text-sm font-semibold ${getRiskLevelStyle(
                  data.riskLevel
                )}`}
              >
                {data.riskLevel} RISK
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Updated {new Date(data.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/health-dashboard/diagnostics"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white border-2 border-[#18191F] dark:border-brand-700 rounded-lg shadow-[2px_2px_0_0_#18191F] dark:shadow-[2px_2px_0_0_var(--color-brand-700)] hover:shadow-[1px_1px_0_0_#18191F] dark:hover:shadow-[1px_1px_0_0_var(--color-brand-700)] hover:translate-x-px hover:translate-y-px transition-all duration-150 font-medium text-sm"
        >
          <Activity size={18} />
          View Diagnostics
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Hackathons"
          value={data.totalActiveHackathons}
          icon={Activity}
          borderColor="#2B7FFF"
          subtitle="Currently running"
        />
        <StatCard
          title="Total Registrations"
          value={data.totalRegistrations}
          icon={Users}
          borderColor="#56CCA9"
          subtitle="Platform-wide"
        />
        <StatCard
          title="Total Submissions"
          value={data.totalSubmissions}
          icon={FileText}
          borderColor="#FEC929"
          subtitle="Across all events"
        />
        <StatCard
          title="Active Judges"
          value={data.totalJudges}
          icon={Gavel}
          borderColor="#FEC5EE"
          subtitle="Evaluating projects"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <DonutChart
          title="Issues by Severity"
          data={severityChartData}
          colors={severityColors}
          subtitle="Distribution of health signals"
        />

        {/* Signal Types */}
        <BarChart
          title="Affected Hackathons by Issue Type"
          data={signalTypeData}
          barColor="#FF4B1E"
          subtitle="Number of hackathons affected"
          orientation="vertical"
        />
      </div>

      {/* Key Signals / Alerts */}
      <div>
        <h2 className="text-lg font-semibold text-[#18191F] dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Key Health Signals ({data.keySignals.length})
        </h2>

        <div className="space-y-3">
          {data.keySignals
            .sort((a, b) => {
              const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
              return severityOrder[a.severity] - severityOrder[b.severity];
            })
            .map((signal, index) => (
              <div
                key={index}
                className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] p-4 hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_var(--color-brand-700)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(signal.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#18191F] dark:text-white">
                          {signal.type.replace(/_/g, " ")}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadgeStyle(
                            signal.severity
                          )}`}
                        >
                          {signal.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {signal.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#18191F] dark:text-white">
                      {signal.affectedCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      affected
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
