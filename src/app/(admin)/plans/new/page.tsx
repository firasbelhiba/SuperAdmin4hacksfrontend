"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PlanForm, { PlanFormData } from "@/components/form/PlanForm";
import { createPlan } from "@/services/plans";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { useAlert } from "@/context/AlertProvider";

export default function NewPlanPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    try {
      const newPlan = await createPlan(data);
      showAlert("success", "Success", "Plan created successfully! You can now add pricing options.");
      router.push(`/plans/${newPlan.id}`);
    } catch (error: any) {
      console.error("Error creating plan:", error);
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to create plan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/plans");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/plans")}
          className="neo-btn"
        >
          <ArrowLeft size={18} />
          Back to Plans
        </button>
      </div>

      {/* Form Container */}
      <div
        className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] 
        dark:border-gray-300 p-6 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_#56CCA9]"
      >
        <PlanForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel="Create Plan"
        />
      </div>
    </div>
  );
}
