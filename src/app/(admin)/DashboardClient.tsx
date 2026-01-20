"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertProvider";
import useAuthGuard from "@/hooks/useAuthGuard";
import { StatCard } from "@/components/ui/stat-card";
import { LineChart, BarChart, DonutChart } from "@/components/chart";
import Select from "@/components/ui/select/Select";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  getDashboardStats,
  getUserStats,
  getHackathonStats,
  getSubmissionStats,
  DashboardStats,
  UserStats,
  HackathonStats,
  SubmissionStats,
  StatsPeriod,
} from "@/services/stats";
import {
  Building2,
  Zap,
  FileText,
  Users,
  Trophy,
  Calendar,
  Rocket,
  Award,
} from "lucide-react";

export default function DashboardClient() {
  const { user } = useAuth();
  const { isLoading: authLoading } = useAuthGuard();
  const { showAlert } = useAlert();
  const [initialLoading, setInitialLoading] = useState(true);
  const [userStatsLoading, setUserStatsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [hackathonStats, setHackathonStats] = useState<HackathonStats | null>(null);
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>("last_30_days");

  const periodOptions = [
    { value: "last_7_days", label: "Last 7 Days" },
    { value: "last_30_days", label: "Last 30 Days" },
    { value: "last_90_days", label: "Last 90 Days" },
    { value: "last_year", label: "Last Year" },
    { value: "all_time", label: "All Time" },
  ];

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value as StatsPeriod);
  };

  useEffect(() => {
    async function fetchInitialStats() {
      try {
        const [dashboardData, hackathonData, submissionData] = await Promise.all([
          getDashboardStats(),
          getHackathonStats(),
          getSubmissionStats(),
        ]);
        setStats(dashboardData);
        setHackathonStats(hackathonData);
        setSubmissionStats(submissionData);
      } catch (error: any) {
        console.error("Error fetching initial stats:", error);
        showAlert("error", "Error", "Failed to load dashboard statistics");
      } finally {
        setInitialLoading(false);
      }
    }

    fetchInitialStats();
  }, [showAlert]);

  useEffect(() => {
    async function fetchUserStats() {
      try {
        setUserStatsLoading(true);
        const userData = await getUserStats(period);
        setUserStats(userData);
      } catch (error: any) {
        console.error("Error fetching user stats:", error);
        showAlert("error", "Error", "Failed to load user statistics");
      } finally {
        setUserStatsLoading(false);
      }
    }

    fetchUserStats();
  }, [period, showAlert]);

  if (authLoading || initialLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#18191F] dark:text-white">
          Welcome back, {user?.name || "Admin"}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your platform
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#18191F] dark:text-white mb-4">
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} borderColor="#D6FF25" subtitle="Registered users" />
          <StatCard title="Total Hackathons" value={stats?.totalHackathons || 0} icon={Rocket} borderColor="#FEC5EE" subtitle="All hackathons" />
          <StatCard title="Total Submissions" value={stats?.totalSubmissions || 0} icon={FileText} borderColor="#2B7FFF" subtitle="Project submissions" />
          <StatCard title="Organizations" value={stats?.totalOrganizations || 0} icon={Building2} borderColor="#56CCA9" subtitle="Active organizations" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#18191F] dark:text-white mb-4">
          Last 30 Days Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="New Users" value={stats?.newUsersLast30Days || 0} icon={Users} borderColor="#D6FF25" subtitle="Last 30 days" />
          <StatCard title="New Hackathons" value={stats?.newHackathonsLast30Days || 0} icon={Calendar} borderColor="#FEC5EE" subtitle="Last 30 days" />
          <StatCard title="New Submissions" value={stats?.newSubmissionsLast30Days || 0} icon={Trophy} borderColor="#2B7FFF" subtitle="Last 30 days" />
          <StatCard title="Active Hackathons" value={stats?.activeHackathons || 0} icon={Zap} borderColor="#FF4B1E" subtitle="Currently running" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#18191F] dark:text-white mb-4">
          Analytics & Insights
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#18191F] dark:text-white">User Growth</h3>
              <div className="w-48">
                <Select name="period" value={period} onChange={handlePeriodChange} options={periodOptions} placeholder="Select period" />
              </div>
            </div>
            {userStatsLoading ? (
              <div className="chart-card flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-700 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading user growth data...</p>
                </div>
              </div>
            ) : (
              userStats && userStats.userGrowth.length > 0 && (
                <LineChart title="User Growth" data={userStats.userGrowth} lineColor="#2B7FFF" fillColor="#2B7FFF" subtitle="New user registrations over time" period={period} />
              )
            )}
          </div>
          {hackathonStats && hackathonStats.hackathonsByCategory.length > 0 && (
            <BarChart title="Hackathons by Category" data={hackathonStats.hackathonsByCategory} barColor="#FEC5EE" subtitle="Distribution by category" orientation="vertical" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {hackathonStats && (
            <>
              <DonutChart title="Hackathons by Status" data={hackathonStats.hackathonsByStatus} colors={["#FFBD12", "#56CCA9", "#9CA3AF", "#FF4B1E"]} subtitle="Draft, Active, Archived, Cancelled" />
              <DonutChart title="Hackathons by Type" data={hackathonStats.hackathonsByType} colors={["#2B7FFF", "#D6FF25", "#FEC5EE"]} subtitle="In-person, Online, Hybrid" />
              <DonutChart title="Hackathons by Privacy" data={hackathonStats.hackathonsByPrivacy} colors={["#56CCA9", "#FF4B1E"]} subtitle="Public vs Private" />
            </>
          )}
        </div>
        {hackathonStats && (
          <div className="mt-6">
            <StatCard title="Average Prize Pool" value={Math.round(hackathonStats.averagePrizePool)} icon={Trophy} borderColor="#FFBD12" subtitle="Average across all hackathons" />
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#18191F] dark:text-white mb-4">
          Submission Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <StatCard title="Total Submissions" value={submissionStats?.totalSubmissions || 0} icon={FileText} borderColor="#2B7FFF" subtitle="All project submissions" />
            <StatCard title="Avg per Hackathon" value={submissionStats ? Number(submissionStats.averageSubmissionsPerHackathon.toFixed(2)) : 0} icon={Zap} borderColor="#FFBD12" subtitle="Average submissions per hackathon" />
            <StatCard title="Winners" value={submissionStats?.winnerSubmissions || 0} icon={Award} borderColor="#56CCA9" subtitle="Total winning submissions" />
          </div>
          <div>
            {submissionStats && submissionStats.topHackathonsBySubmissions.length > 0 && (
              <BarChart title="Top Hackathons by Submissions" data={submissionStats.topHackathonsBySubmissions.map((item) => ({ category: item.hackathonTitle, count: item.submissionCount }))} barColor="#FEC929" subtitle="Hackathons with most submissions" orientation="vertical" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
