/**
 * Service pour les statistiques (Admin)
 * 
 * Endpoints disponibles:
 * - GET /admin/stats/dashboard : Statistiques globales du dashboard
 * - GET /admin/stats/users : Statistiques détaillées des utilisateurs
 */

import api from "@/lib/api";

/**
 * Statistiques du dashboard
 */
export interface DashboardStats {
  totalUsers: number;
  totalHackathons: number;
  totalSubmissions: number;
  totalOrganizations: number;
  activeHackathons: number;
  newUsersLast30Days: number;
  newHackathonsLast30Days: number;
  newSubmissionsLast30Days: number;
}

/**
 * Statistiques détaillées des utilisateurs
 */
export interface UserStats {
  totalUsers: number;
  usersByRole: {
    admin: number;
    user: number;
  };
  usersByVerification: {
    verified: number;
    unverified: number;
  };
  usersByBanStatus: {
    active: number;
    banned: number;
  };
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Statistiques détaillées des hackathons
 */
export interface HackathonStats {
  totalHackathons: number;
  hackathonsByStatus: {
    draft: number;
    active: number;
    archived: number;
    cancelled: number;
  };
  hackathonsByType: {
    inPerson: number;
    online: number;
    hybrid: number;
  };
  hackathonsByCategory: Array<{
    category: string;
    count: number;
  }>;
  hackathonsByPrivacy: {
    public: number;
    private: number;
  };
  averagePrizePool: number;
}

/**
 * Statistiques détaillées des soumissions
 */
export interface SubmissionStats {
  totalSubmissions: number;
  submissionsByStatus: {
    draft: number;
    submitted: number;
    underReview: number;
    rejected: number;
    withdrawn: number;
  };
  topHackathonsBySubmissions: Array<{
    hackathonId: string;
    hackathonTitle: string;
    submissionCount: number;
  }>;
  averageSubmissionsPerHackathon: number;
  winnerSubmissions: number;
}

/**
 
/**
 * Récupère les statistiques détaillées des hackathons
 * Endpoint: GET /admin/stats/hackathons
 * 
 * @returns Statistiques détaillées des hackathons
 */
export async function getHackathonStats(): Promise<HackathonStats> {
  const response = await api.get<HackathonStats>("/admin/stats/hackathons");
  return response.data;
}
export type StatsPeriod = "last_7_days" | "last_30_days" | "last_90_days" | "last_year" | "all_time";

/**
 * Récupère les statistiques globales du dashboard
 * Endpoint: GET /admin/stats/dashboard
 * 
 * @returns Statistiques du dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/admin/stats/dashboard");
  return response.data;
}

/**
 * Récupère les statistiques détaillées des utilisateurs
 * Endpoint: GET /admin/stats/users
 * 
 * @param period - Période pour les statistiques (last_7_days, last_30_days, etc.)
 * @returns Statistiques détaillées des utilisateurs
 */
export async function getUserStats(timeRange: StatsPeriod = "last_30_days"): Promise<UserStats> {
  const response = await api.get<UserStats>("/admin/stats/users", {
    params: { timeRange},
  });
  return response.data;
}

/**
 * Récupère les statistiques détaillées des soumissions
 * Endpoint: GET /admin/stats/submissions
 * 
 * @returns Statistiques détaillées des soumissions
 */
export async function getSubmissionStats(): Promise<SubmissionStats> {
  const response = await api.get<SubmissionStats>("/admin/stats/submissions");
  return response.data;
}
