/**
 * Service pour la gestion des demandes de hackathons (Admin)
 * 
 * Endpoints disponibles:
 * - GET /admin/hackathon-requests : Liste toutes les demandes
 * - PATCH /admin/hackathon-requests/{id}/approve : Approuver une demande
 * - PATCH /admin/hackathon-requests/{id}/reject : Rejeter une demande
 */

import api from "@/lib/api";
import { PaginatedResponse } from "@/hooks/usePaginatedApi";

/**
 * Filtres pour les hackathon requests
 */
export interface HackathonRequestFilters {
  status?: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT" | "REVIEWED";
  organizationId?: string;
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface HackathonRequest {
  id: string;
  hackTitle: string;
  hackSlug: string;
  hackId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  organizationId: string;
  
  // Dates
  startDate?: string;
  endDate?: string;
  registrationStart?: string;
  registrationEnd?: string;
  judgingStart?: string;
  judgingEnd?: string;
  
  // Basic Info
  hackType?: string;
  hackCategoryId?: string;
  focus?: string;
  audience?: string;
  expectedAttendees?: number;
  geographicScope?: string;
  
  // Location
  hackCountry?: string;
  hackCity?: string;
  hackState?: string;
  hackZipCode?: string;
  hackAddress?: string;
  
  // Prize & Distribution
  prizePool?: number;
  prizeToken?: string;
  expectedTotalWinners?: number;
  distributionPlan?: string;
  
  // Funding & Sponsors
  fundingSources?: string[];
  confirmedSponsors?: string[];
  needSponsorsHelp?: boolean;
  sponsorLevel?: string;
  
  // Venue & Technical
  venueSecured?: string;
  needVenueHelp?: string;
  technicalSupport?: boolean;
  liveStreaming?: string;
  
  // Marketing & Community
  marketingHelp?: boolean;
  marketingHelpDetails?: string[];
  existingCommunity?: boolean;
  estimatedReach?: string;
  targetRegistrationGoal?: number;
  
  // Support Needs
  needWorkshopsHelp?: boolean;
  workshopsHelpDetails?: string;
  needTechnicalMentors?: boolean;
  technicalMentorCount?: number;
  needEducationalContent?: boolean;
  needSpeakers?: boolean;
  needJudges?: boolean;
  judgesCount?: number;
  judgesProfiles?: string[];
  needJudgingCriteria?: boolean;
  needEvaluationSystem?: boolean;
  needEventLogistics?: boolean;
  eventLogisticsDetails?: string[];
  needVolunteerCoordinators?: boolean;
  needCommunitySetup?: boolean;
  needOnCallSupport?: boolean;
  
  // Approval/Rejection
  approvedAt?: string;
  approvedById?: string;
  rejectedAt?: string;
  rejectedById?: string;
  rejectedReason?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  organization?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    owner?: {
      id: string;
      name: string;
      username: string;
      email: string;
      role: string;
    };
  };
  hackCategory?: {
    id: string;
    name: string;
    description: string;
  };
  hackathon?: {
    id: string;
    title: string;
    slug: string;
    status: string;
    description?: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
  };
  rejectedBy?: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface HackathonRequestsResponse {
  data: HackathonRequest[];
}

/**
 * Récupère toutes les demandes de hackathons (sans pagination - ancien endpoint)
 * Endpoint: GET /admin/hackathon-requests
 * 
 * @returns Liste de toutes les demandes avec leurs détails
 */
export async function getAllHackathonRequests(): Promise<HackathonRequest[]> {
  const response = await api.get<HackathonRequestsResponse>(
    "/admin/hackathon-requests"
  );
  return response.data.data;
}

/**
 * Récupère les demandes de hackathons avec pagination et filtres
 * Endpoint: GET /admin/hackathon-requests
 * 
 * @param filters - Filtres à appliquer (status, search, dates, etc.)
 * @param page - Numéro de page (commence à 1)
 * @param limit - Nombre d'éléments par page
 * @returns Réponse paginée avec les demandes et les métadonnées
 */
export async function getHackathonRequests(
  filters: HackathonRequestFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<HackathonRequest>> {
  const params: Record<string, any> = {
    page,
    limit,
  };

  // Ajouter les filtres uniquement s'ils sont définis
  if (filters.status) params.status = filters.status;
  if (filters.organizationId) params.organizationId = filters.organizationId;
  if (filters.search) params.search = filters.search;
  if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
  if (filters.startDateTo) params.startDateTo = filters.startDateTo;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  const response = await api.get<PaginatedResponse<HackathonRequest>>(
    "/admin/hackathon-requests",
    { params }
  );
  
  return response.data;
}

/**
 * Approuve une demande de hackathon
 * Endpoint: PATCH /admin/hackathon-requests/{id}/approve
 * 
 * @param id - L'identifiant unique de la demande
 * @returns La demande mise à jour avec le statut APPROVED
 */
export async function approveHackathonRequest(
  id: string
): Promise<HackathonRequest> {
  const response = await api.patch<HackathonRequest>(
    `/admin/hackathon-requests/${id}/approve`
  );
  return response.data;
}

/**
 * Rejette une demande de hackathon
 * Endpoint: PATCH /admin/hackathon-requests/{id}/reject
 * 
 * @param id - L'identifiant unique de la demande
 * @param reason - La raison du rejet (minimum 10 caractères)
 * @returns La demande mise à jour avec le statut REJECTED
 */
export async function rejectHackathonRequest(
  id: string,
  reason: string
): Promise<HackathonRequest> {
  const response = await api.patch<HackathonRequest>(
    `/admin/hackathon-requests/${id}/reject`,
    { reason }
  );
  return response.data;
}
