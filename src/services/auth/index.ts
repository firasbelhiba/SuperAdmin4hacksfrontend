/**
 * Service pour l'authentification
 * 
 * Endpoints disponibles:
 * - POST /auth/password/reset/request : Demander une réinitialisation de mot de passe
 * - POST /auth/password/reset : Réinitialiser le mot de passe avec un token
 * - POST /auth/email/verify/send : Envoyer un email de vérification
 * - POST /auth/email/verify : Vérifier l'email avec un code
 * - POST /auth/refresh : Rafraîchir le token d'accès
 */

import api, { BASE_URL } from "@/lib/api";
import axios from "axios";

// ==================== CONSTANTS ====================

// Access token lifetime (should match backend)
export const ACCESS_TOKEN_LIFETIME_MS =  15 * 60 * 1000; // 15 minutes

// ==================== TYPES ====================

export interface ResetPasswordRequestInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface VerifyEmailInput {
  code: number;
}

export interface RefreshTokenResponse {
  token?: string;
  accessToken?: string;
}

// ==================== PASSWORD RESET SERVICES ====================

/**
 * Demande une réinitialisation de mot de passe
 * Endpoint: POST /auth/password/reset/request
 * 
 * @param data - L'email de l'utilisateur
 * @returns Les données de confirmation
 */
export async function requestPasswordReset(data: ResetPasswordRequestInput) {
  try {
    const response = await api.post("/auth/password/reset/request", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Invalid email format");
  }
}

/**
 * Réinitialise le mot de passe avec un token
 * Endpoint: POST /auth/password/reset
 * 
 * @param data - Le token et le nouveau mot de passe
 * @returns Les données de confirmation
 */
export async function resetPassword(data: ResetPasswordInput) {
  try {
    const response = await api.post("/auth/password/reset", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Invalid or expired token");
  }
}

// ==================== EMAIL VERIFICATION SERVICES ====================

/**
 * Envoie un email de vérification
 * Endpoint: POST /auth/email/verify/send
 * 
 * @returns Les données de confirmation avec l'email
 */
export async function sendVerificationEmail(): Promise<{ email: string; message: string }> {
  try {
    const response = await api.post("/auth/email/verify/send");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send verification email");
  }
}

/**
 * Vérifie l'email avec un code
 * Endpoint: POST /auth/email/verify
 * 
 * @param data - Le code de vérification
 * @returns Les données de confirmation
 */
export async function verifyEmail(data: VerifyEmailInput): Promise<{ message: string; email: string }> {
  try {
    const response = await api.post("/auth/email/verify", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Invalid or expired verification code");
  }
}

// ==================== TOKEN REFRESH SERVICES ====================

/**
 * Rafraîchit le token d'accès (client-side only)
 * Endpoint: POST /api/auth/refresh (Next.js API route)
 * 
 * Utilise la route Next.js au lieu d'appeler directement le backend.
 * La route Next.js forward correctement les cookies au backend et
 * retourne les Set-Cookie headers au navigateur (crucial pour rotation).
 * 
 * @returns Le nouveau token d'accès
 */
export async function refreshTokenClient(): Promise<string> {
  try {
    const response = await axios.post<{
      success: boolean;
      accessToken: string;
      accessTokenExpires: number;
    }>(
      "/api/auth/refresh", // Route Next.js (same-origin)
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const newAccessToken = response.data.accessToken;

    if (!newAccessToken) {
      throw new Error("No access token in refresh response");
    }

    return newAccessToken;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Unknown error";
    console.error("Client-side token refresh error:", errorMessage);
    throw new Error(errorMessage);
  }
}
