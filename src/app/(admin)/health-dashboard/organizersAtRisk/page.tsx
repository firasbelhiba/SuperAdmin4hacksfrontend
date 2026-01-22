import { Suspense } from "react";
import { Metadata } from "next";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import HealthRiskClient from "./HealthRiskClient";

export const metadata: Metadata = {
  title: "Organization Health Risk | 4Hacks Admin",
  description: "Organizers with hackathons showing negative health indicators",
};

export default function HealthRiskPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
            Organization Health Risk
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organizers with hackathons showing negative health indicators
          </p>
        </div>
      </div>
      
      <Suspense fallback={<LoadingSpinner text="Loading health metrics..." />}>
        <HealthRiskClient />
      </Suspense>
    </div>
  );
}
