"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Activity, AlertTriangle, CheckCircle, Users, FileText, Gavel, TrendingUp, TrendingDown, Target, Send, UserCheck, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { getHackathonDiagnostic } from "@/services/health";
import { cancelHackathon } from "@/services/hackathons";
import {  HackathonDiagnostic, RiskLevel, SignalSeverity } from "@/services/health/healthType";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import {StatCard} from "@/components/ui/stat-card/StatCard";
import { createDynamicChart } from "@/hooks/useDynamicComponent";
import { createDynamicModal } from "@/hooks/useDynamicComponent";
import Button from "@/components/ui/button/Button";
import { useAlert } from "@/context/AlertProvider";

const BarChart = createDynamicChart(() => import("@/components/chart/BarChart").then(mod => ({ default: mod.BarChart })));
const PolarChart = createDynamicChart(() => import("@/components/chart/PolarChart").then(mod => ({ default: mod.PolarChart })));
// Import dynamique du modal pour éviter de charger Portal/animations avant l'interaction
const ConfirmModal = createDynamicModal(() => import("@/components/ui/ConfirmModal"));

interface DiagnosticDetailClientProps {
  hackathonId: string;
}

export default function DiagnosticDetailClient({ hackathonId }: DiagnosticDetailClientProps) {
  const { isLoading: authLoading } = useAuthGuard();
  const router = useRouter();
    const { showAlert } = useAlert();
  const [data, setData] = useState<HackathonDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getHackathonDiagnostic(hackathonId);
        console.log(result)
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load diagnostic data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hackathonId]);

   const handelConfirmCancel = async () => {

    // Implement the cancel confirmation logic here
     if (!data) return;
    
        try {
          setActionLoading(true);
          await cancelHackathon(data.hackathonId, cancelReason);
          
          // Mettre à jour manuellement l'utilisateur (l'API ne retourne pas l'objet complet)
          setData({
            ...data,
            status: "CANCELLED",
          });
          
          setShowCancelModal(false);
          setCancelReason("");
          showAlert("success", "Success", "Hackathon cancelled successfully");
        } catch (err: any) {
          showAlert("error", "Error", err.response?.data?.message || "Failed to cancel hackathon");
        } finally {
          setActionLoading(false);
        }
  };




  if (authLoading || loading) {
    return <LoadingSpinner text="Loading diagnostic data..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!data) {
    return <ErrorDisplay message="No diagnostic data available" />;
  }

  const getRiskLevelStyle = (level: RiskLevel) => {
    switch (level) {
      case "CRITICAL":
        return "risk-level-critical";
      case "HIGH":
        return "risk-level-high";
      case "MEDIUM":
        return "risk-level-medium";
      case "LOW":
        return "risk-level-low";
    }
  };

  const getSeverityIcon = (severity: SignalSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case "INFO":
        return <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const sortedSignals = [...(data.activitySignals ?? [])].sort((a, b) => {
    const severityOrder: Record<SignalSeverity, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Prepare chart data for health percentages
  const healthChartData = [
    { 
      label: "Registration Health", 
      count: data.registrationMetrics?.registrationHealthPercent ?? 0 
    },
    { 
      label: "Submission Health", 
      count: data.submissionMetrics?.submissionHealthPercent ?? 0 
    },
    { 
      label: "Judge Health", 
      count: data.judgeMetrics?.judgeHealthPercent ?? 0 
    },
  ];

  // Prepare chart data for submission status distribution
  const submissionStatusData = [
    { name: "Draft", value: data.submissionMetrics?.draftSubmissions ?? 0 },
    { name: "Submitted", value: data.submissionMetrics?.submittedSubmissions ?? 0 },
    { name: "Under Review", value: data.submissionMetrics?.underReviewSubmissions ?? 0 },
    { name: "Rejected", value: data.submissionMetrics?.rejectedSubmissions ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#18191F] dark:text-white">
            {data.hackathonTitle}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ID: {data.hackathonId}
          </p>
        </div>


         {/* Actions */}
        <div className="flex gap-3">
          {(data.status ==="DRAFT" || data.status === "ACTIVE") && (
         <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-2 bg-[#FFE8E8]! border-[#FF4B1E]! text-[#FF4B1E]! hover:bg-[#FF4B1E]! hover:text-white!"
            >
              <Ban className="h-4 w-4" />
              Cancel Hackathon
            </Button>
          ) 
          }
        </div>

      </div>

      {/* 1. Overview: Title, Status, Risk Level, Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-xl font-bold text-[#18191F] dark:text-white">{data.status}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-xl border-2 border-[#18191F] dark:border-brand-700 ${getRiskLevelStyle(data.riskLevel)}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Risk Level</p>
              <p className="text-xl font-bold">{data.riskLevel}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
              <p className="text-xl font-bold text-[#18191F] dark:text-white">{data.healthScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Registration Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#18191F] dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6" />
          Registration Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            title="Target Registrations"
            value={data.registrationMetrics?.targetRegistrations ?? 0}
            icon={Target}
            borderColor="#8b5cf6"
          />
          <StatCard
            title="Actual Registrations"
            value={data.registrationMetrics?.actualRegistrations ?? 0}
            icon={Users}
            borderColor="#3b82f6"
          />
          <StatCard
            title="Approval Rate"
            value={Math.round((data.registrationMetrics?.approvalRate ?? 0) * 100)}
            icon={CheckCircle}
            borderColor="#10b981"
            subtitle={`${Math.round((data.registrationMetrics?.approvalRate ?? 0) * 100)}%`}
          />
          <StatCard
            title="Registration Gap"
            value={data.registrationMetrics?.registrationGap ?? 0}
            icon={TrendingDown}
            borderColor="#ef4444"
          />
          <StatCard
            title="Health Percent"
            value={Math.round(data.registrationMetrics?.registrationHealthPercent ?? 0)}
            icon={Activity}
            borderColor="#f59e0b"
            subtitle={`${Math.round(data.registrationMetrics?.registrationHealthPercent ?? 0)}%`}
          />
        </div>
      </div>

      {/* 2. Submission Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#18191F] dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Submission Metrics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Stats Cards */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Total Teams"
                value={data.submissionMetrics?.totalTeams ?? 0}
                icon={Users}
                borderColor="#8b5cf6"
              />
              <StatCard
                title="Total Submissions"
                value={data.submissionMetrics?.totalSubmissions ?? 0}
                icon={FileText}
                borderColor="#3b82f6"
              />
              <StatCard
                title="Submission Rate"
                value={Math.round((data.submissionMetrics?.submissionRate ?? 0) * 100)}
                icon={TrendingUp}
                borderColor="#10b981"
                subtitle={`${Math.round((data.submissionMetrics?.submissionRate ?? 0) * 100)}%`}
              />
              <StatCard
                title="Health Percent"
                value={Math.round(data.submissionMetrics?.submissionHealthPercent ?? 0)}
                icon={Activity}
                borderColor="#f59e0b"
                subtitle={`${Math.round(data.submissionMetrics?.submissionHealthPercent ?? 0)}%`}
              />
            </div>
          </div>

          {/* Column 2: Polar Area Chart */}
          <div className="p-6 rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900">
            <PolarChart
              title="Submission Status Distribution"
              data={submissionStatusData}
              colors={["#6b7280", "#3b82f6", "#f59e0b", "#ef4444"]}
            />
          </div>
        </div>
      </div>

      {/* 2. Judge Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#18191F] dark:text-white flex items-center gap-2">
          <Gavel className="w-6 h-6" />
          Judge Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            title="Total Invited"
            value={data.judgeMetrics?.totalInvited ?? 0}
            icon={Send}
            borderColor="#8b5cf6"
          />
          <StatCard
            title="Total Accepted"
            value={data.judgeMetrics?.totalAccepted ?? 0}
            icon={UserCheck}
            borderColor="#10b981"
          />
          <StatCard
            title="Acceptance Rate"
            value={Math.round((data.judgeMetrics?.acceptanceRate ?? 0) * 100)}
            icon={TrendingUp}
            borderColor="#3b82f6"
            subtitle={`${Math.round((data.judgeMetrics?.acceptanceRate ?? 0) * 100)}%`}
          />
          <StatCard
            title="Pending Invitations"
            value={data.judgeMetrics?.pendingInvitations ?? 0}
            icon={Activity}
            borderColor="#f59e0b"
          />
          <StatCard
            title="Health Percent"
            value={Math.round(data.judgeMetrics?.judgeHealthPercent ?? 0)}
            icon={Activity}
            borderColor="#f59e0b"
            subtitle={`${Math.round(data.judgeMetrics?.judgeHealthPercent ?? 0)}%`}
          />
        </div>
      </div>

      {/* 3. Activity Signals */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#18191F] dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Activity Signals ({sortedSignals.length})
        </h2>
        <div className="space-y-3">
          {sortedSignals.map((signal, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 severity-${signal.severity.toLowerCase()}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">{getSeverityIcon(signal.severity)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {signal.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      signal.severity === "CRITICAL" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                      signal.severity === "WARNING" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    }`}>
                      {signal.severity}
                    </span>
                  </div>
                  <p className="font-medium text-[#18191F] dark:text-white">{signal.message}</p>
                  {signal.recommendation && (
                    <div className="mt-2 pl-4 border-l-4 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-blue-700 dark:text-blue-400">💡 Recommendation:</span> {signal.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Health Percentages Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#18191F] dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Health Percentages Overview
        </h2>
        <div className="p-6 rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900">
          <BarChart
            title="Health Percentages"
            data={healthChartData}
            barColor="#3b82f6"
            orientation="vertical"
          />
        </div>
      </div>

         {/* Ban Modal */}
      <ConfirmModal
        open={showCancelModal}
        onCancel={() => {
          setShowCancelModal(false);
          setCancelReason("");
        }}
        onConfirm={handelConfirmCancel}
        title="Cancel Hackathon"
        message={`Are you sure you want to Cancel ${data.hackathonTitle}?`}
        confirmLabel="Cancel Hackathon"
        loading={actionLoading}
      >
        <div>
          <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
            Reason <span className="text-[#FF4B1E] dark:text-error-400">*</span>
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Violation of community guidelines, spam, harassment, etc."
            className="w-full px-4 py-3 rounded-lg border-2 border-[#18191F] dark:border-brand-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFBD12] min-h-[120px] resize-none"
            required
            autoFocus
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This reason will be visible to the user and stored in their profile.
          </p>
        </div>
      </ConfirmModal>
    </div>
  );
}
