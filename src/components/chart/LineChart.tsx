"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/context/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  /** Titre du graphique */
  title: string;
  /** Données du graphique [{date, count}] */
  data: Array<{ date: string; count: number }>;
  /** Couleur de la ligne */
  lineColor?: string;
  /** Couleur du gradient de remplissage */
  fillColor?: string;
  /** Description optionnelle */
  subtitle?: string;
  /** Période sélectionnée pour adapter le format des dates */
  period?: "last_7_days" | "last_30_days" | "last_90_days" | "last_year" | "all_time";
}

export const LineChart = React.memo(function LineChart({
  title,
  data,
  lineColor = "#2B7FFF",
  fillColor = "#2B7FFF",
  subtitle,
  period = "last_30_days",
}: LineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Aggregate data based on period to control X-axis scale
  const aggregateData = React.useMemo(() => {
    if (data.length === 0) return data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (period) {
      case "last_7_days": {
        // Generate 7 days with fixed labels
        const days: Array<{ date: string; count: number }> = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split('T')[0];
          
          // Find matching data point
          const dataPoint = data.find(d => d.date === dateKey);
          days.push({
            date: dateKey,
            count: dataPoint ? dataPoint.count : 0
          });
        }
        return days;
      }
      
      case "last_30_days": {
        // Generate 4 weeks (4 labels for 4 weeks)
        const weeks: Array<{ date: string; count: number }> = [];
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          const weekKey = weekStart.toISOString().split('T')[0];
          
          // Sum all data points in this week
          let weekCount = 0;
          data.forEach(item => {
            const itemDate = new Date(item.date);
            if (itemDate >= weekStart && itemDate <= weekEnd) {
              weekCount += item.count;
            }
          });
          
          weeks.push({
            date: weekKey,
            count: weekCount
          });
        }
        return weeks;
      }
      
      case "last_90_days": {
        // Generate last 3 months
        const months: Array<{ date: string; count: number }> = [];
        for (let i = 2; i >= 0; i--) {
          const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`;
          
          const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
          
          // Sum all data in this month
          let monthCount = 0;
          data.forEach(item => {
            const itemDate = new Date(item.date);
            if (itemDate >= monthDate && itemDate < nextMonth) {
              monthCount += item.count;
            }
          });
          
          months.push({
            date: monthKey,
            count: monthCount
          });
        }
        return months;
      }
      
      case "last_year": {
        // Generate 12 months
        const months: Array<{ date: string; count: number }> = [];
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`;
          
          const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
          
          // Sum all data in this month
          let monthCount = 0;
          data.forEach(item => {
            const itemDate = new Date(item.date);
            if (itemDate >= monthDate && itemDate < nextMonth) {
              monthCount += item.count;
            }
          });
          
          months.push({
            date: monthKey,
            count: monthCount
          });
        }
        return months;
      }
      
      case "all_time": {
        // Yearly aggregation - keep only years with data
        const yearlyData: Record<string, number> = {};
        
        data.forEach(item => {
          const date = new Date(item.date);
          const yearKey = `${date.getFullYear()}-01-01`;
          
          yearlyData[yearKey] = (yearlyData[yearKey] || 0) + item.count;
        });
        
        return Object.entries(yearlyData)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }
      
      default:
        return data;
    }
  }, [data, period]);
  
  // Format dates for display based on period
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return dateString;
    }
    
    switch (period) {
      case "last_7_days":
      case "last_30_days":
        // Daily: "Jan 5"
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      
      case "last_90_days":
        // Weekly: "Jan 5" (show week start)
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      
      case "last_year":
        // Monthly: "Jan 2026"
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      
      case "all_time":
        // Yearly: "2026"
        return date.getFullYear().toString();
      
      default:
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
    }
  };

  const chartData = {
    labels: aggregateData.map((item) => formatDate(item.date)),
    datasets: [
      {
        label: "Users",
        data: aggregateData.map((item) => item.count),
        borderColor: lineColor,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, fillColor + "40");
          gradient.addColorStop(1, fillColor + "00");
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: isDark ? "#1F2937" : "#FFFFFF",
        pointBorderColor: lineColor,
        pointBorderWidth: 2,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: isDark ? "#FFFFFF" : "#FFFFFF",
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
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
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            return `${(context.parsed.y || 0).toLocaleString()} new users`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
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
          maxRotation: 45,
          minRotation: 0,
          // Force display of all data points for better visibility
          autoSkip: false,
          autoSkipPadding: 5,
          // Allow more labels to be displayed
          maxTicksLimit: aggregateData.length > 0 ? aggregateData.length : undefined,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: (() => {
          const maxValue = Math.max(...aggregateData.map(d => d.count), 0);
          // Ensure minimum scale for better visibility
          if (maxValue < 10) return 10;
          if (maxValue < 50) return 50;
          // Add 20% padding to max value for better visualization
          return Math.ceil(maxValue * 1.2);
        })(),
        grace: '5%',
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
          lineWidth: 1,
        },
        border: {
          color: isDark ? '#FEC929' : '#18191F',
          width: 2,
          dash: [5, 5],
        },
        ticks: {
          color: isDark ? '#FFFFFF' : '#18191F',
          font: {
            size: 12,
            weight: 600,
          },
          callback: function (value) {
            return value.toLocaleString();
          },
          stepSize: (() => {
            const maxValue = Math.max(...aggregateData.map(d => d.count), 0);
            if (maxValue < 10) return 2;
            if (maxValue < 50) return 10;
            return undefined; // Auto
          })(),
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  const totalGrowth = aggregateData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="chart-card">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#18191F] dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
        <p className="text-3xl font-bold text-[#18191F] dark:text-white mt-2">
          +{totalGrowth.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">New users in this period</p>
      </div>
      <div className="h-[300px] relative">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
});
