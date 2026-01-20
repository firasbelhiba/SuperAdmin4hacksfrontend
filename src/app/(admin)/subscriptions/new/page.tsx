"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SubscriptionForm, { SubscriptionFormData } from "@/components/form/SubscriptionForm";
import { createSubscription } from "@/services/subscriptions";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { useAlert } from "@/context/AlertProvider";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SubscriptionFormData) => {
    setIsSubmitting(true);
    try {
      const newSubscription = await createSubscription(data);
      showAlert("success", "Success", "Subscription created successfully!");
      router.push(`/subscriptions/${newSubscription.id}`);
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to create subscription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/subscriptions");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/subscriptions")}
          className="neo-btn"
        >
          <ArrowLeft size={18} />
          Back to Subscriptions
        </button>
      </div>

      {/* Form Container */}
      <div
        className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] 
        dark:border-gray-300 p-6 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_#56CCA9]"
      >
        <SubscriptionForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel="Create Subscription"
        />
      </div>
    </div>
  );
}
