"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import {
  CardProps,
  cardTypeColors,
  statusToCardType,
  statusLabels,
} from "./types";

/**
 * Composant Card réutilisable pour afficher des informations
 * Supporte deux variantes : 'list' (pour les listes de cards) et 'detail' (pour les sections de détails)
 * 
 * Props obligatoires : title
 * Props par défaut : type='success', variant='detail'
 */
export const Card: React.FC<CardProps> = ({
  // Apparence
  type = "success",
  status,
  image,
  
  // Contenu (title est REQUIS)
  title,
  subtitle,
  data,
  children,
  
  // Métadonnées
  date,
  location,
  participants,
  prizePool,
  prizeToken = "USD",
  
  // Actions
  onClick,
  
  // Style
  className = "",
  variant = "detail",
}) => {
  // Déterminer le type de carte basé sur le statut (si fourni)
  const cardType = status ? statusToCardType[status] : type;
  const colors = cardTypeColors[cardType];

  // Composant en mode "list" (comme dans les images)
  if (variant === "list") {
    return (
      <div
        onClick={onClick}
        className={`group rounded-xl border-2 border-[#18191F] dark:border-l-brand-700 dark:border-r-brand-700 dark:border-b-brand-700 dark:border-t-[#18191F] bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] hover:shadow-[2px_2px_0_0_#18191F] dark:hover:shadow-[2px_2px_0_0_var(--color-brand-700)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all overflow-hidden ${
          onClick ? "cursor-pointer" : ""
        } ${className}`}
      >
        {/* Bordure de couleur supérieure */}
        <div className={`h-2 ${colors.border}`} />

        {/* Image optionnelle */}
        {image && (
          <div className="relative w-full h-48">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Contenu principal */}
        <div className="p-6">
          {/* Badge de statut */}
          {status && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${colors.badge}`}
            >
              {statusLabels[status]}
            </span>
          )}

          {/* Titre */}
          <h3 className="text-xl font-bold text-[#18191F] dark:text-white mb-4 line-clamp-2">
            {title}
          </h3>

          {/* Sous-titre */}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{subtitle}</p>
          )}

          {/* Métadonnées */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            {date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span>{new Date(date).toLocaleDateString()}</span>
              </div>
            )}

            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span>{location}</span>
              </div>
            )}

            {participants !== undefined && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span>{participants}+ participants</span>
              </div>
            )}
          </div>

          {/* Séparateur */}
          {prizePool && (
            <>
              <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 my-4" />

              {/* Prize Pool */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#18191F] dark:text-white font-bold">
                  <DollarSign className="h-5 w-5 text-[#FF4B1E] dark:text-error-400" />
                  <span>Prize Pool</span>
                </div>
                <span className="text-xl font-bold text-[#FF4B1E] dark:text-error-400">
                  ${prizePool.toLocaleString()} {prizeToken !== "USD" && prizeToken}
                </span>
              </div>
            </>
          )}

          {/* Contenu custom */}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    );
  }

  // Composant en mode "detail" (sections de la page détails)
  return (
    <div
      className={`rounded-xl border-2 border-[#18191F] dark:border-l-brand-700 dark:border-r-brand-700 dark:border-b-brand-700 dark:border-t-[#18191F] bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] overflow-hidden ${className}`}
    >
      {/* Bordure de couleur supérieure */}
      <div className={`h-1.5 ${colors.border}`} />

      {/* Image optionnelle */}
      {image && (
        <div className="relative w-full h-64">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Contenu */}
      <div className="p-6">
        {/* Header avec badge */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-[#18191F] dark:text-white flex items-center gap-2">
            {title}
          </h2>
          
          {status && (
            <span
              className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${colors.badge}`}
            >
              {statusLabels[status]}
            </span>
          )}
        </div>

        {/* Sous-titre */}
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{subtitle}</p>
        )}

        {/* Données structurées */}
        {data && typeof data === "object" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {Object.entries(data).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Données en string */}
        {data && typeof data === "string" && (
          <p className="text-[#18191F] dark:text-white whitespace-pre-wrap mb-4">{data}</p>
        )}

        {/* Contenu custom */}
        {children}
      </div>
    </div>
  );
};

/**
 * Export du composant par défaut
 */
export default Card;
