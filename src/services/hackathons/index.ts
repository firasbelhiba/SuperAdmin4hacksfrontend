/**
 * Service pour Hackathons (Admin)
 * 
 * Endpoints disponibles:
 * - GET /hackathon : Liste des hackathons avec filtres et pagination
 */

import api from "@/lib/api";
import { PaginatedResponse } from "@/hooks/usePaginatedApi";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type HackathonStatus = "ACTIVE" | "ARCHIVED" | "CANCELLED";
export type HackathonType = "IN_PERSON" | "ONLINE" | "HYBRID";

export interface HackathonCategory {
  id: string;
  name: string;
  description: string;
}

export interface HackathonOrganization {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export interface Hackathon {
  id: string;
  title: string;
  slug: string;
  status: HackathonStatus;
  type: HackathonType;
  category: HackathonCategory;
  banner: string;
  tagline: string;
  prizePool: number;
  prizeToken: string;
  isPrivate: boolean;
  registrationStart: string;
  registrationEnd: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  organization: HackathonOrganization;
}

export interface HackathonFilters {
  status?: HackathonStatus;
  type?: HackathonType;
  isPrivate?: boolean;
  prizePoolFrom?: number;
  prizePoolTo?: number;
  startDateFrom?: string;
  startDateTo?: string;
  organizationId?: string;
  search?: string;
  sortBy?: "createdAt" | "startDate" | "endDate" | "prizePool" | "title" | "registrationDate" | "registrationEnd";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Récupère la liste des hackathons avec filtres et pagination
 */
export async function getHackathons(
  filters: HackathonFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Hackathon>> {
  const params: Record<string, any> = { page, limit };

  // Add filters only if defined
  if (filters.status) params.status = filters.status;
  if (filters.type) params.type = filters.type;
  if (filters.isPrivate !== undefined) params.isPrivate = filters.isPrivate;
  if (filters.prizePoolFrom) params.prizePoolFrom = filters.prizePoolFrom;
  if (filters.prizePoolTo) params.prizePoolTo = filters.prizePoolTo;
  if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
  if (filters.startDateTo) params.startDateTo = filters.startDateTo;
  if (filters.organizationId) params.organizationId = filters.organizationId;
  if (filters.search) params.search = filters.search;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  const response = await api.get<PaginatedResponse<Hackathon>>(
    "/hackathon",
    { params }
  );

  return response.data;
}
