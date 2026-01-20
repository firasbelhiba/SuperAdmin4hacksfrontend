/**
 * Service pour la gestion des subscriptions (Admin)
 * 
 * Endpoints disponibles:
 * - GET /admin/subscriptions : Liste paginée des subscriptions
 * - GET /admin/subscriptions/:id : Détails d'une subscription
 * - POST /admin/subscriptions : Créer une nouvelle subscription
 */

import api from "@/lib/api";

/**
 * Statut d'une subscription
 */
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "EXPIRED" | "PENDING";

/**
 * Informations utilisateur dans une subscription
 */
export interface SubscriptionUser {
  id: string;
  email: string;
  name: string;
  username: string;
}

/**
 * Informations plan dans une subscription
 */
export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  isActive: boolean;
  features: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Informations prix du plan dans une subscription
 */
export interface SubscriptionPlanPrice {
  id: string;
  planId: string;
  amount: number;
  currency: "USD" | "EUR";
  interval: "MONTHLY" | "ANNUAL";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Structure d'une subscription
 */
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planPriceId: string;
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  endedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: SubscriptionUser;
  plan: SubscriptionPlan;
  planPrice: SubscriptionPlanPrice;
}

/**
 * Paramètres de filtrage pour la liste des subscriptions
 */
export interface SubscriptionsFilterParams {
  status?: SubscriptionStatus;
  userId?: string;
  planId?: string;
  sortBy?: "createdAt" | "startedAt" | "currentPeriodEnd";
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
 * Données pour créer une nouvelle subscription
 */
export interface CreateSubscriptionData {
  userId: string;
  planId: string;
  planPriceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

/**
 * Récupère la liste paginée des subscriptions avec filtres
 * Endpoint: GET /admin/subscriptions
 * 
 * @param filters - Paramètres de filtrage
 * @param page - Numéro de page
 * @param limit - Nombre d'éléments par page
 * @returns Liste paginée des subscriptions
 */
export async function getSubscriptions(
  filters: SubscriptionsFilterParams = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Subscription>> {
  const params: Record<string, any> = {
    page,
    limit,
    
  };

  // Ajouter les filtres uniquement s'ils sont définis
  if (filters.status) params.status = filters.status;
  if (filters.userId) params.userId = filters.userId;
  if (filters.planId) params.planId = filters.planId;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  const response = await api.get<PaginatedResponse<Subscription>>("/admin/subscriptions", {
    params,
  });
  
  return response.data;
}

/**
 * Récupère les détails d'une subscription spécifique
 * Endpoint: GET /admin/subscriptions/:id
 * 
 * @param id - ID de la subscription
 * @returns Détails de la subscription
 */
export async function getSubscriptionById(id: string): Promise<Subscription> {
  const response = await api.get<Subscription>(`/admin/subscriptions/${id}`);
  return response.data;
}

/**
 * Crée une nouvelle subscription
 * Endpoint: POST /admin/subscriptions
 * 
 * @param data - Données de la subscription à créer
 * @returns Subscription créée
 */
export async function createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
  const response = await api.post<{ message: string; data: Subscription }>(
    "/admin/subscriptions",
    data
  );
  return response.data.data;
}

/**
 * Met à jour une subscription existante
 * Endpoint: PATCH /admin/subscriptions/:id
 * 
 * @param id - ID de la subscription
 * @param data - Données à mettre à jour
 * @returns Subscription mise à jour
 */
export async function updateSubscription(
  id: string,
  data: Partial<CreateSubscriptionData>
): Promise<Subscription> {
  const response = await api.patch<{ message: string; data: Subscription }>(
    `/admin/subscriptions/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Supprime une subscription
 * Endpoint: DELETE /admin/subscriptions/:id
 * 
 * @param id - ID de la subscription à supprimer
 */
export async function deleteSubscription(id: string): Promise<void> {
  await api.delete(`/admin/subscriptions/${id}`);
}

/**
 * Annule une subscription
 * Endpoint: PATCH /admin/subscriptions/:id/cancel
 * 
 * @param id - ID de la subscription à annuler
 * @returns Subscription annulée
 */
export async function cancelSubscription(id: string): Promise<Subscription> {
  const response = await api.patch<{ message: string; data: Subscription }>(
    `/admin/subscriptions/${id}/cancel`
  );
  return response.data.data;
}
