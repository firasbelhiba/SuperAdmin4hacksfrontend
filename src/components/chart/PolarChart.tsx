"use client";

import { memo } from "react";
import { PolarArea } from "react-chartjs-2";
import { useTheme } from "@/context/ThemeContext";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

interface PolarChartProps {
  /** Données du graphique [{name, value}] */
  data: Array<{ name: string; value: number }>;
  /** Couleurs pour chaque segment */
  colors?: string[];
  /** Titre du graphique */
  title?: string;
  /** Description optionnelle */
  subtitle?: string;
}

function PolarChartComponent({
  data,
  colors = ["#6366f1", "#3b82f6", "#f59e0b", "#ef4444"],
  title,
  subtitle,
}: PolarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const labels = data.map((item) => item.name);
  const values = data.map((item) => item.value);
  const total = values.reduce((sum, val) => sum + val, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors.map((color) =>
          isDark ? `${color}80` : `${color}CC`
        ),
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"polarArea"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: isDark ? "#FFFFFF" : "#18191F",
          font: {
            size: 12,
            weight: 600,
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1F2937" : "#18191F",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const value = context.parsed.r;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          color: isDark ? "#9CA3AF" : "#6B7280",
          backdropColor: "transparent",
          font: {
            size: 10,
          },
        },
        grid: {
          color: isDark ? "#374151" : "#E5E7EB",
        },
        pointLabels: {
          color: isDark ? "#FFFFFF" : "#18191F",
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-[#18191F] dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div style={{ height: "400px" }}>
        <PolarArea data={chartData} options={options} />
      </div>
    </div>
  );
}

export const PolarChart = memo(PolarChartComponent);
