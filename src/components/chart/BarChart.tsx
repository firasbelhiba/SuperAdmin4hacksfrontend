"use client";

import { Bar } from "react-chartjs-2";
import { useTheme } from "@/context/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  /** Titre du graphique */
  title: string;
  /** Données du graphique [{label, count}] */
  data: Array<{ category?: string; label?: string; count: number }>;
  /** Couleur des barres */
  barColor?: string;
  /** Description optionnelle */
  subtitle?: string;
  /** Orientation du graphique */
  orientation?: "vertical" | "horizontal";
}

export function BarChart({
  title,
  data,
  barColor = "#2B7FFF",
  subtitle,
  orientation = "horizontal",
}: BarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const labels = data.map((item) => item.category || item.label || "");
  const values = data.map((item) => item.count);
  const total = values.reduce((sum, val) => sum + val, 0);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Count",
        data: values,
        backgroundColor: barColor,
        borderColor: isDark ? "#1F2937" : "#18191F",
        borderWidth: 2,
        borderRadius: 6,
        barThickness: orientation === "horizontal" ? 32 : undefined,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: orientation === "horizontal" ? "y" : "x",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? "#1F2937" : "#18191F",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context) {
            const value = context.parsed.x || context.parsed.y || 0;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: orientation === "vertical",
          color: isDark ? '#374151' : '#E5E7EB',
        },
        border: {
          color: isDark ? '#FEC929' : '#18191F',
          width: 2,
        },
        ticks: {
          color: isDark ? '#FFFFFF' : '#18191F',
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      y: {
        grid: {
          display: orientation === "horizontal",
          color: isDark ? '#374151' : '#E5E7EB',
        },
        border: {
          color: isDark ? '#FEC929' : '#18191F',
          width: 2,
        },
        ticks: {
          color: isDark ? '#FFFFFF' : '#18191F',
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
    },
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
      <div className="h-75 relative">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
