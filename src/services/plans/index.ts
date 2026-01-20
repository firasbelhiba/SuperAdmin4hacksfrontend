/**
 * Service pour la gestion des plans (Admin)
 * 
 * Endpoints disponibles:
 * - GET /admin/plans : Liste paginée des plans avec filtres
 * - GET /admin/plans/:id : Détails d'un plan spécifique
 */

import api from "@/lib/api";

/**
 * Features d'un plan
 */
export interface PlanFeatures {
  aiJudging?: boolean;
  maxHackathons?: number;
  customBranding?: boolean;
  [key: string]: any;
}

/**
 * Interval de prix (Mensuel ou Annuel)
 */
export type PriceInterval = "MONTHLY" | "ANNUAL";

/**
 * Devise du prix
 */
export type PriceCurrency = "USD" | "EUR";

/**
 * Structure d'un prix de plan
 */
export interface PlanPrice {
  id: string;
  planId: string;
  amount: number;
  currency: PriceCurrency;
  interval: PriceInterval;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
}

/**
 * Structure d'un plan
 */
export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  isActive: boolean;
  features: PlanFeatures;
  createdAt: string;
  updatedAt: string;
  prices: PlanPrice[];
  _count: {
    subscriptions: number;
  };
}

/**
 * Paramètres de filtrage pour la liste des plans
 */
export interface PlansFilterParams {
  isActive?: boolean;
  search?: string;
  sortBy?: "name" | "id" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

/**
 * Réponse paginée standard
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Réponse brute de l'API avec pagination complète
 */
interface PlansApiResponse {
  data: Plan[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Récupère la liste paginée des plans avec filtres
 * Endpoint: GET /admin/plans
 * 
 * @param filters - Paramètres de filtrage
 * @param page - Numéro de page
 * @param limit - Nombre d'éléments par page
 * @returns Liste paginée des plans
 */
export async function getPlans(
  filters: PlansFilterParams = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Plan>> {
  const params: Record<string, any> = {
    page,
    limit,
  };

  // Ajouter les filtres uniquement s'ils sont définis
  if (filters.isActive !== undefined) params.isActive = filters.isActive;
  if (filters.search) params.search = filters.search;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  const response = await api.get<PlansApiResponse>("/admin/plans", {
    params,
  });
  
  // L'API retourne { data: [...], meta: {...} }
  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}

/**
 * Récupère les détails d'un plan spécifique
 * Endpoint: GET /admin/plans/:id
 * 
 * @param id - ID du plan
 * @returns Détails du plan
 */
export async function getPlanById(id: string): Promise<Plan> {
  const response = await api.get<Plan>(`/admin/plans/${id}`);
  return response.data;
}

/**
 * Crée un nouveau plan
 * Endpoint: POST /admin/plans
 * 
 * @param data - Données du plan à créer
 * @returns Plan créé
 */
export async function createPlan(data: Omit<Plan, 'id' | 'createdAt' | 'updatedAt' | 'prices' | '_count'>): Promise<Plan> {
  const response = await api.post<{ message: string; data: Plan }>("/admin/plans", data);
  return response.data.data;
}

/**
 * Met à jour un plan existant
 * Endpoint: PATCH /admin/plans/:id
 * 
 * @param id - ID du plan
 * @param data - Données à mettre à jour
 * @returns Plan mis à jour
 */
export async function updatePlan(
  id: string,
  data: Partial<Omit<Plan, 'id' | 'createdAt' | 'updatedAt' | 'prices' | '_count'>>
): Promise<Plan> {
  const response = await api.patch<{ message: string; data: Plan }>(`/admin/plans/${id}`, data);
  return response.data.data;
}

/**
 * Supprime un plan
 * Endpoint: DELETE /admin/plans/:id
 * 
 * @param id - ID du plan à supprimer
 */
export async function deletePlan(id: string): Promise<void> {
  await api.delete(`/admin/plans/${id}`);
}

// ==================== GESTION DES PRIX ====================

/**
 * Données pour créer un nouveau prix
 */
export interface CreatePriceData {
  amount: number;
  currency: PriceCurrency;
  interval: PriceInterval;
  isActive: boolean;
}

/**
 * Données pour mettre à jour un prix existant
 */
export interface UpdatePriceData {
  amount?: number;
  currency?: PriceCurrency;
  interval?: PriceInterval;
  isActive?: boolean;
}

/**
 * Récupère tous les prix d'un plan
 * Endpoint: GET /admin/plans/:planId/prices
 * 
 * @param planId - ID du plan
 * @returns Liste des prix du plan
 */
export async function getPlanPrices(planId: string): Promise<PlanPrice[]> {
  const response = await api.get<PlanPrice[]>(`/admin/plans/${planId}/prices`);
  return response.data;
}

/**
 * Crée un nouveau prix pour un plan
 * Endpoint: POST /admin/plans/:planId/prices
 * 
 * @param planId - ID du plan
 * @param data - Données du prix à créer
 * @returns Prix créé
 */
export async function createPlanPrice(
  planId: string,
  data: CreatePriceData
): Promise<PlanPrice> {
  const response = await api.post<{ message: string; data: PlanPrice }>(
    `/admin/plans/${planId}/prices`,
    data
  );
  return response.data.data;
}

/**
 * Met à jour un prix existant
 * Endpoint: PATCH /admin/plans/prices/:id
 * 
 * @param priceId - ID du prix
 * @param data - Données à mettre à jour
 * @returns Prix mis à jour
 */
export async function updatePlanPrice(
  priceId: string,
  data: UpdatePriceData
): Promise<PlanPrice> {
  const response = await api.patch<{ message: string; data: PlanPrice }>(
    `/admin/plans/prices/${priceId}`,
    data
  );
  return response.data.data;
}

/**
 * Supprime un prix
 * Endpoint: DELETE /admin/plans/prices/:id
 * 
 * @param priceId - ID du prix à supprimer
 */
export async function deletePlanPrice(priceId: string): Promise<void> {
  await api.delete(`/admin/plans/prices/${priceId}`);
}
