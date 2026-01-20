/**
 * Service pour la gestion des notifications utilisateur
 * 
 * Endpoints disponibles:
 * - GET /notifications : Récupérer les notifications avec pagination
 * - PATCH /notifications/{id}/mark-as-read : Marquer une notification comme lue
 * - PATCH /notifications/mark-all-as-read : Marquer toutes les notifications comme lues
 */

import api from "@/lib/api";

// ==================== TYPES ====================

export interface NotificationPayload {
  teamId?: string;
  hackathonId?: string;
  [key: string]: string | undefined;
}

export interface Notification {
  id: string;
  toUserId: string;
  fromUserId: string;
  type: string;
  content: string;
  payload: NotificationPayload;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: NotificationsMeta;
}

export interface MarkAsReadResponse {
  message: string;
  data: {
    id: string;
    content: string;
    isRead: boolean;
  };
}

export interface MarkAllAsReadResponse {
  message: string;
  notificationsCount: number;
}

// ==================== NOTIFICATION SERVICES ====================

/**
 * Récupère les notifications de l'utilisateur connecté
 * Endpoint: GET /notifications
 * 
 * @param page - Numéro de page (commence à 1)
 * @param limit - Nombre d'éléments par page
 * @returns Liste paginée des notifications
 */
export async function getNotifications(
  page: number = 1,
  limit: number = 10
): Promise<NotificationsResponse> {
  try {
    const response = await api.get<NotificationsResponse>("/notifications", {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch notifications");
  }
}

/**
 * Marque une notification comme lue
 * Endpoint: PATCH /notifications/{id}/mark-as-read
 * 
 * @param notificationId - L'identifiant de la notification
 * @returns Les données de confirmation
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<MarkAsReadResponse> {
  try {
    const response = await api.patch<MarkAsReadResponse>(
      `/notifications/${notificationId}/mark-as-read`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to mark notification as read");
  }
}

/**
 * Marque toutes les notifications comme lues
 * Endpoint: PATCH /notifications/mark-all-as-read
 * 
 * @returns Les données de confirmation avec le nombre de notifications marquées
 */
export async function markAllNotificationsAsRead(): Promise<MarkAllAsReadResponse> {
  try {
    const response = await api.patch<MarkAllAsReadResponse>(
      "/notifications/mark-all-as-read"
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to mark all notifications as read");
  }
}
