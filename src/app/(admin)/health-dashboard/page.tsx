import { Suspense } from "react";
import { Metadata } from "next";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import HealthDashboardClient from "./HealthDashboardClient";

export const metadata: Metadata = {
  title: "Health Dashboard | 4Hacks Admin",
  description: "Monitor hackathon health metrics and system-wide statistics",
};

export default function HealthDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
            Health Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor hackathon health metrics and identify issues across your platform
          </p>
        </div>
      </div>
      
      <Suspense fallback={<LoadingSpinner text="Loading health metrics..." />}>
        <HealthDashboardClient />
      </Suspense>
    </div>
  );
}
