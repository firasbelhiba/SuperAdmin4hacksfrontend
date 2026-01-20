"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SubscriptionForm, { SubscriptionFormData } from "@/components/form/SubscriptionForm";
import { getSubscriptionById, updateSubscription, Subscription } from "@/services/subscriptions";
import { ArrowLeft, XCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { useAlert } from "@/context/AlertProvider";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert } = useAlert();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscriptionId = params?.id as string;

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!subscriptionId) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await getSubscriptionById(subscriptionId);
        setSubscription(data);
      } catch (error: any) {
        console.error("Error fetching subscription:", error);
        if (error.response?.status === 404) {
          setError("Subscription not found");
        } else {
          setError(error.response?.data?.message || "Failed to load subscription");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [subscriptionId]);

  const handleSubmit = async (data: SubscriptionFormData) => {
    setIsSubmitting(true);
    try {
      const updatedSubscription = await updateSubscription(subscriptionId, data);
      showAlert("success", "Success", "Subscription updated successfully!");
      router.push(`/subscriptions/${updatedSubscription.id}`);
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/subscriptions/${subscriptionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-[#18191F] dark:text-white">
          {error || "Subscription not found"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The subscription you're looking for doesn't exist or has been deleted.
        </p>
        <Button
          variant="primary"
          onClick={() => router.push("/subscriptions")}
          className="mt-4"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/subscriptions/${subscriptionId}`)}
          className="neo-btn"
        >
          <ArrowLeft size={18} />
          Back to Subscription Details
        </button>
      </div>

      {/* Form Container */}
      <div
        className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] 
        dark:border-gray-300 p-6 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_#56CCA9]"
      >
        <SubscriptionForm
          initialData={subscription}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel="Update Subscription"
        />
      </div>
    </div>
  );
}
