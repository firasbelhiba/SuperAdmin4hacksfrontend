/**
 * Service pour la gestion du profil utilisateur
 * 
 * Endpoints disponibles:
 * - GET /profile/{username} : Récupérer le profil d'un utilisateur
 * - PATCH /profile : Mettre à jour le profil de l'utilisateur connecté
 * - PATCH /profile/username : Mettre à jour le nom d'utilisateur
 * - PATCH /profile/email : Mettre à jour l'email
 * - PATCH /profile/password : Mettre à jour le mot de passe
 * - POST /profile/email/change-code : Demander un code de vérification pour changement d'email
 * - POST /r2/image : Upload d'image
 * - POST /profile/2fa/enable : Activer la 2FA
 * - POST /profile/2fa/enable/verify : Vérifier l'activation de la 2FA
 * - POST /profile/2fa/disable : Désactiver la 2FA
 * - POST /profile/2fa/disable/verify : Vérifier la désactivation de la 2FA
 */

import api from "@/lib/api";

// ==================== TYPES ====================

export interface UserProfileResponse {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | string;

  bio: string | null;
  image: string | null;

  profession: string | null;
  location: string | null;
  org: string | null;

  skills: string[];

  website: string | null;
  github: string | null;
  linkedin: string | null;
  telegram: string | null;
  twitter: string | null;
  whatsapp: string | null;

  otherSocials: string[];

  providers: string[];

  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  passwordUpdatedAt: string | null;

  twoFactorEnabled: boolean;
  twoFactorConfirmedAt: string | null;

  isDisabled: boolean;
  disabledAt: string | null;
  disabledReason: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  name?: string;
  username?: string;
  bio?: string;
  profession?: string;
  location?: string;
  org?: string;
  skills?: string[];
  website?: string;
  github?: string;
  linkedin?: string;
  telegram?: string;
  twitter?: string;
  whatsapp?: string;
  otherSocials?: string[];
}

export interface UpdateInput {
  username: string;
}

export interface ChangeEmailDto {
  password: string;
  newEmail: string;
  twoFactorCode?: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== PROFILE SERVICES ====================

/**
 * Récupère le profil d'un utilisateur
 * Endpoint: GET /profile/{username}
 * 
 * @param username - Le nom d'utilisateur
 * @returns Les informations du profil utilisateur
 */
export async function getUserProfile(
  username: string
): Promise<UserProfileResponse> {
  try {
    // Pour les requêtes authentifiées, le token sera ajouté automatiquement par l'intercepteur
    const response = await api.get<UserProfileResponse>(`/profile/${username}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to load profile");
  }
}

/**
 * Met à jour le profil de l'utilisateur connecté
 * Endpoint: PATCH /profile
 * 
 * @param data - Les données à mettre à jour
 * @param file - L'image de profil (optionnel)
 * @returns Le profil mis à jour
 */
export async function updateUserProfile(
  data: UpdateUserProfileDto,
  file: File | null = null
): Promise<UserProfileResponse> {
  const formData = new FormData();
  if (file) {
    formData.append("image", file);
  }

  Object.entries(data).forEach(([key, value]) => {
    // Skip certain fields
    if (key === "username" || key === "email" || key === "image") return;

    // Skip empty strings
    if (typeof value === "string" && value.trim() === "") return;

    // Skip empty arrays
    if (Array.isArray(value) && value.length === 0) return;

    // Skip null/undefined
    if (value === undefined || value === null) return;

    // Add to FormData
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(`${key}[]`, v));
    } else {
      formData.append(key, value);
    }
  });

  try {
    const response = await api.patch<UserProfileResponse>("/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
}

/**
 * Met à jour le nom d'utilisateur
 * Endpoint: PATCH /profile/username
 * 
 * @param dataInput - Le nouveau nom d'utilisateur
 * @returns Les données de confirmation
 */
export async function updateUsername(dataInput: UpdateInput) {
  try {
    const response = await api.patch("/profile/username", dataInput);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update username");
  }
}

/**
 * Demande un code de vérification pour changer l'email
 * Endpoint: POST /profile/email/change-code
 * 
 * @returns Les données de confirmation
 */
export async function requestEmailChangeCode() {
  try {
    const response = await api.post("/profile/email/change-code");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send verification code");
  }
}

/**
 * Change l'email de l'utilisateur
 * Endpoint: PATCH /profile/email
 * 
 * @param dataInput - Les données de changement d'email (password, newEmail, twoFactorCode)
 * @returns Les données de confirmation
 */
export async function updateEmail(dataInput: ChangeEmailDto) {
  try {
    const response = await api.patch("/profile/email", dataInput);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update email");
  }
}

/**
 * Met à jour le mot de passe de l'utilisateur
 * Endpoint: PATCH /profile/password
 * 
 * @param data - Les données de changement de mot de passe
 * @returns Les données de confirmation
 */
export async function updatePassword(data: UpdatePasswordDto) {
  try {
    const response = await api.patch("/profile/password", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update password");
  }
}

// ==================== IMAGE UPLOAD SERVICES ====================

/**
 * Upload une image vers R2
 * Endpoint: POST /r2/image
 * 
 * @param file - Le fichier image à uploader
 * @returns Les données de l'image uploadée
 */
export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await api.post("/r2/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Upload failed";
    throw new Error(`Upload failed: ${error.response?.status || 'unknown'} → ${errorMsg}`);
  }
}

// ==================== 2FA SERVICES ====================

/**
 * Demande l'activation de la 2FA
 * Endpoint: POST /profile/2fa/enable
 * 
 * @returns Les données de configuration 2FA (QR code, secret, etc.)
 */
export async function enable2FA() {
  try {
    const response = await api.post("/profile/2fa/enable");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to request 2FA code");
  }
}

/**
 * Vérifie et active la 2FA avec le code
 * Endpoint: POST /profile/2fa/enable/verify
 * 
 * @param code - Le code de vérification 2FA
 * @returns Les données de confirmation
 */
export async function verifyEnable2FA(code: string) {
  try {
    const response = await api.post("/profile/2fa/enable/verify", { code });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to verify 2FA code");
  }
}

/**
 * Demande la désactivation de la 2FA
 * Endpoint: POST /profile/2fa/disable
 * 
 * @returns Les données de confirmation
 */
export async function disable2FA() {
  try {
    const response = await api.post("/profile/2fa/disable");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to request 2FA disable code");
  }
}

/**
 * Vérifie et désactive la 2FA avec le code
 * Endpoint: POST /profile/2fa/disable/verify
 * 
 * @param code - Le code de vérification 2FA
 * @returns Les données de confirmation
 */
export async function verifyDisable2FA(code: string) {
  try {
    const response = await api.post("/profile/2fa/disable/verify", { code });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to verify 2FA disable code");
  }
}
