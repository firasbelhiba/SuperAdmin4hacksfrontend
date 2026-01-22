/**
 * Service pour Health Dashboard (Admin)
 * 
 * Endpoints disponibles:
 * - GET /admin/hackathons/health : Récupère les métriques globales de santé
 * - GET /admin/hackathons/{id}/diagnostics : Récupère le diagnostic détaillé d'un hackathon
 */

import api from "@/lib/api";
import { HealthOverview, HackathonDiagnostic, AtRiskOrganizersResponse, AtRiskOrganizer, AnomaliesResponse, Anomaly } from "./healthType";
import { PaginatedResponse } from "@/hooks/usePaginatedApi";


// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Récupère les métriques globales de santé de tous les hackathons
 */
export async function getHealthOverview(): Promise<HealthOverview> {
  const response = await api.get<HealthOverview>("/admin/hackathons/health");
  return response.data;
}

/**
 * Récupère le diagnostic détaillé d'un hackathon spécifique
 */
export async function getHackathonDiagnostic(
  hackathonId: string
): Promise<HackathonDiagnostic> {
  const response = await api.get<HackathonDiagnostic>(
    `/admin/hackathons/${hackathonId}/diagnostics`
  );
  return response.data;
}


export async function getOrgAtRiskOrganizers(
  filters: Record<string, never>,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<AtRiskOrganizer>> {
  const params: Record<string, any> = { page, limit };

  const response = await api.get<AtRiskOrganizersResponse>(
    "/admin/organizers/at-risk",
    { params }
  );

  // Transform API response to PaginatedResponse format
  return {
    data: response.data.organizers,
    meta: {
      page: response.data.page,
      limit: response.data.limit,
      total: response.data.totalCount,
      totalPages: Math.ceil(response.data.totalCount / response.data.limit),
      hasNextPage: response.data.page * response.data.limit < response.data.totalCount,
      hasPrevPage: response.data.page > 1,
    },
  };
}

/**
 * Récupère les détails d'un organisateur à risque spécifique
 */
export async function getOrganizerAtRiskDetail(
  organizerId: string,
  hackathonId: string
): Promise<AtRiskOrganizer> {
  const response = await api.get<AtRiskOrganizer>(
    `/admin/organizers/${organizerId}/at-risk`,
    { params: { hackathonId } }
  );
  return response.data;
}

/**
 * Récupère la liste des anomalies détectées
 */
export async function getAnomalies(
  filters: Record<string, never>,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Anomaly>> {
  const params: Record<string, any> = { page, limit };

  const response = await api.get<AnomaliesResponse>(
    "/admin/activity/anomalies",
    { params }
  );

  // Transform API response to PaginatedResponse format
  return {
    data: response.data.anomalies,
    meta: {
      page: response.data.page,
      limit: response.data.limit,
      total: response.data.totalCount,
      totalPages: Math.ceil(response.data.totalCount / response.data.limit),
      hasNextPage: response.data.page * response.data.limit < response.data.totalCount,
      hasPrevPage: response.data.page > 1,
    },
  };
}

