"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createDynamicForm } from "@/hooks/useDynamicComponent";
import { PlanFormData } from "@/components/form/PlanForm";
import { getPlanById, updatePlan, Plan } from "@/services/plans";
import { ArrowLeft, XCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { useAlert } from "@/context/AlertProvider";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Import dynamique du formulaire lourd (244 lignes, react-hook-form, validation complexe)
const PlanForm = createDynamicForm(() => import("@/components/form/PlanForm"));

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert } = useAlert();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planId = params?.id as string;

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPlanById(planId);
        setPlan(data);
      } catch (error: any) {
        console.error("Error fetching plan:", error);
        if (error.response?.status === 404) {
          setError("Plan not found");
        } else {
          setError(error.response?.data?.message || "Failed to load plan");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const handleSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    try {
      const updatedPlan = await updatePlan(planId, data);
      showAlert("success", "Success", "Plan updated successfully!");
      router.push(`/plans/${updatedPlan.id}`);
    } catch (error: any) {
      console.error("Error updating plan:", error);
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to update plan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/plans/${planId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-[#18191F] dark:text-white">
          {error || "Plan not found"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The plan you're looking for doesn't exist or has been deleted.
        </p>
        <Button
          variant="primary"
          onClick={() => router.push("/plans")}
          className="mt-4"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/plans/${planId}`)}
          className="neo-btn"
        >
          <ArrowLeft size={18} />
          Back to Plan Details
        </button>
      </div>

      {/* Form Container */}
      <div
        className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] 
        dark:border-gray-300 p-6 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_#56CCA9]"
      >
        <PlanForm
          initialData={plan}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel="Update Plan"
        />
      </div>
    </div>
  );
}
