import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  /** Titre de la statistique */
  title: string;
  /** Valeur numérique à afficher */
  value: number;
  /** Icône Lucide à afficher */
  icon: LucideIcon;
  /** Couleur de la bordure supérieure (hex) */
  borderColor: string;
  /** Texte optionnel à afficher sous la valeur */
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  borderColor,
  subtitle,
}: StatCardProps) {
  return (
    <div
      className="relative bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-l-brand-700 dark:border-r-brand-700 dark:border-b-brand-700 dark:border-t-[#18191F] shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#18191F] dark:hover:shadow-[6px_6px_0_0_var(--color-brand-700)]"
    >
      {/* Bordure colorée supérieure */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: borderColor }}
      />

      <div className="p-6 pt-7">
        <div className="flex items-start justify-between">
          {/* Contenu texte */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
            <p className="text-4xl font-bold text-[#18191F] dark:text-white mb-1">
              {value.toLocaleString()}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Icône */}
          <div
            className="rounded-lg p-3 border-2 border-[#18191F] dark:border-brand-700"
            style={{ backgroundColor: borderColor + "20" }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: borderColor }}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
