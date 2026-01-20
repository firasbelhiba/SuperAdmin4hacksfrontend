"use client";

import { Doughnut } from "react-chartjs-2";
import { useTheme } from "@/context/ThemeContext";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  /** Titre du graphique */
  title: string;
  /** Données du graphique {label: value} */
  data: Record<string, number>;
  /** Couleurs pour chaque segment (dans l'ordre des clés) */
  colors: string[];
  /** Description optionnelle */
  subtitle?: string;
}

export function DonutChart({
  title,
  data,
  colors,
  subtitle,
}: DonutChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const labels = Object.keys(data);
  const values = Object.values(data);
  const total = values.reduce((sum, val) => sum + val, 0);

  const chartData = {
    labels: labels.map((label) => label.charAt(0).toUpperCase() + label.slice(1)),
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: isDark ? "#1F2937" : "#18191F",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
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
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "65%",
  };

  return (
    <div className="chart-card">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#18191F] dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
        <p className="text-3xl font-bold text-[#18191F] dark:text-white mt-2">
          {total.toLocaleString()}
        </p>
      </div>
      <div className="h-70 relative">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
