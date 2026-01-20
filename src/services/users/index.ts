/**
 * Service pour la gestion des utilisateurs (Admin)
 * 
 * Endpoints disponibles:
 * - GET /admin/users : Liste tous les utilisateurs avec filtres
 * - POST /admin/users/{userId}/ban : Bannir un utilisateur
 * - POST /admin/users/{userId}/unban : Débannir un utilisateur
 */

import api from "@/lib/api";
import { PaginatedResponse } from "@/hooks/usePaginatedApi";

/**
 * Filtres pour les utilisateurs
 */
export interface UserFilters {
  isBanned?: boolean;
  role?: "ADMIN" | "USER";
  search?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Informations d'un utilisateur
 */
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: "ADMIN" | "USER";
  image: string | null;
  isBanned: boolean;
  bannedAt: string | null;
  bannedReason: string | null;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

/**
 * Payload pour bannir un utilisateur
 */
export interface BanUserPayload {
  reason: string;
}

/**
 * Payload pour débannir un utilisateur
 */
export interface UnbanUserPayload {
  reason?: string;
}

/**
 * Récupère les utilisateurs avec pagination et filtres
 * Endpoint: GET /admin/users
 * 
 * @param filters - Filtres à appliquer (isBanned, role, search, sortOrder)
 * @param page - Numéro de page (commence à 1)
 * @param limit - Nombre d'éléments par page
 * @returns Réponse paginée avec les utilisateurs et les métadonnées
 */
export async function getUsers(
  filters: UserFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<User>> {
  const params: Record<string, any> = {
    page,
    limit,
  };

  // Ajouter les filtres uniquement s'ils sont définis
  if (filters.isBanned !== undefined) params.isBanned = filters.isBanned;
  if (filters.role) params.role = filters.role;
  if (filters.search) params.search = filters.search;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  const response = await api.get<PaginatedResponse<User>>(
    "/admin/users",
    { params }
  );
  
  return response.data;
}

/**
 * Bannir un utilisateur
 * Endpoint: POST /admin/users/{userId}/ban
 * 
 * @param userId - L'identifiant unique de l'utilisateur
 * @param reason - La raison du bannissement
 * @returns L'utilisateur mis à jour avec le statut banni
 */
export async function banUser(
  userId: string,
  reason: string
): Promise<User> {
  const response = await api.post<User>(
    `/admin/users/${userId}/ban`,
    { reason }
  );
  return response.data;
}

/**
 * Débannir un utilisateur
 * Endpoint: POST /admin/users/{userId}/unban
 * 
 * @param userId - L'identifiant unique de l'utilisateur
 * @param reason - La raison du débannissement (optionnel)
 * @returns L'utilisateur mis à jour avec le statut débanni
 */
export async function unbanUser(
  userId: string,
  reason?: string
): Promise<User> {
  const response = await api.post<User>(
    `/admin/users/${userId}/unban`,
    reason ? { reason } : {}
  );
  return response.data;
}
