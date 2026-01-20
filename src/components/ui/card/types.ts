import React, { ReactNode } from "react";

/**
 * Type de carte définissant la couleur de la bordure supérieure
 */
export type CardType = "success" | "danger" | "warning" | "info" | "default";

/**
 * Statut de la request pour déterminer les couleurs
 */
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "OPEN" | "COMING_SOON";

/**
 * Props du composant Card
 */
export interface CardProps {
  // Apparence
  type?: CardType; // Type de carte (défaut: 'success')
  status?: RequestStatus; // Statut pour badge et couleur
  image?: string; // URL d'image optionnelle en haut
  
  // Contenu principal (requis)
  title: string; // Titre de la carte (REQUIS)
  
  // Contenu supplémentaire
  subtitle?: string; // Sous-titre optionnel
  data?: Record<string, any> | string; // Données à afficher
  children?: ReactNode; // Contenu personnalisé
  
  // Métadonnées (pour liste)
  date?: string; // Date de l'événement
  location?: string; // Localisation
  participants?: number; // Nombre de participants
  prizePool?: number; // Prize pool
  prizeToken?: string; // Token du prize
  
  // Actions
  onClick?: () => void; // Action au clic
  onApprove?: () => void; // Action d'approbation
  onReject?: () => void; // Action de rejet
  
  // Style
  className?: string; // Classes CSS additionnelles
  variant?: "list" | "detail"; // Variante d'affichage (défaut: 'detail')
}

/**
 * Mapping des types vers les couleurs du thème
 */
export const cardTypeColors: Record<CardType, { border: string; bg: string; badge: string }> = {
  success: {
    border: "bg-[#56CCA9]",
    bg: "bg-[#E8F8F3]",
    badge: "bg-[#56CCA9] text-white",
  },
  danger: {
    border: "bg-[#FF4B1E]",
    bg: "bg-[#FFE8E8]",
    badge: "bg-[#FF4B1E] text-white",
  },
  warning: {
    border: "bg-[#FFBD12]",
    bg: "bg-[#FFFBEA]",
    badge: "bg-[#FFBD12] text-[#18191F]",
  },
  info: {
    border: "bg-[#6366F1]",
    bg: "bg-[#EEF2FF]",
    badge: "bg-[#6366F1] text-white",
  },
  default: {
    border: "bg-[#18191F]",
    bg: "bg-white",
    badge: "bg-[#18191F] text-white",
  },
};

/**
 * Mapping des statuts vers les types de carte
 */
export const statusToCardType: Record<RequestStatus, CardType> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  OPEN: "success",
  COMING_SOON: "warning",
};

/**
 * Labels pour les statuts
 */
export const statusLabels: Record<RequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  OPEN: "Open",
  COMING_SOON: "Coming Soon",
};
