import { Suspense } from "react";
import { Metadata } from "next";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DiagnosticsClient from "./DiagnosticsClient";

export const metadata: Metadata = {
  title: "Hackathon Diagnostics | 4Hacks Admin",
  description: "Detailed diagnostics and health metrics for individual hackathons",
};

export default function DiagnosticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
            Hackathon Diagnostics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View detailed health metrics and diagnostics for each hackathon
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading hackathons..." />}>
        <DiagnosticsClient />
      </Suspense>
    </div>
  );
}
