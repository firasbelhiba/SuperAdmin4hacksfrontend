"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Package,
  DollarSign,
  Clock,
  Ban,
  Edit,
} from "lucide-react";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/button/Button";
import Card from "@/components/ui/card/Card";
import { 
  getSubscriptionById, 
  Subscription, 
  cancelSubscription 
} from "@/services/subscriptions";
import { useAlert } from "@/context/AlertProvider";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SubscriptionDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { isLoading: authLoading } = useAuthGuard();

  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Charger les détails de la subscription
  useEffect(() => {
    params.then(async (p) => {
      setSubscriptionId(p.id);

      try {
        const subscriptionData = await getSubscriptionById(p.id);
        setSubscription(subscriptionData);
      } catch (err: any) {
        const errorMessage =
          err.response?.status === 404
            ? "Subscription not found"
            : err.response?.data?.message || "Failed to load subscription details";
        setError(errorMessage);
        showAlert("error", "Error", errorMessage);
      } finally {
        setLoading(false);
      }
    });
  }, [showAlert]);

  const handleCancel = async () => {
    if (!subscriptionId) return;

    setIsCanceling(true);
    try {
      const canceledSubscription = await cancelSubscription(subscriptionId);
      setSubscription(canceledSubscription);
      showAlert("success", "Success", "Subscription canceled successfully!");
      setCancelModalOpen(false);
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to cancel subscription"
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle2 className="w-5 h-5" />;
      case "CANCELED":
        return <Ban className="w-5 h-5" />;
      case "EXPIRED":
        return <XCircle className="w-5 h-5" />;
      case "PENDING":
        return <Clock className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-700";
      case "CANCELED":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-700";
      case "EXPIRED":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-600";
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-600";
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading subscription details..." />;
  }

  if (error || !subscription) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/subscriptions")}
          className="neo-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subscriptions
        </button>
        <div className="neo-card p-12">
          <div className="flex flex-col items-center justify-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-[#18191F] dark:text-white mb-2">
              Subscription Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {error || "The subscription you're looking for doesn't exist."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/subscriptions")}
          className="neo-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subscriptions
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="success"
            onClick={() => router.push(`/subscriptions/${subscriptionId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit size={18} />
            Edit Subscription
          </Button>
          {subscription.status === "ACTIVE" && (
            <Button
              variant="danger"
              onClick={() => setCancelModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Ban size={18} />
              Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Subscription Header Card */}
      <div className="neo-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="icon-container-accent">
              <CreditCard className="w-8 h-8 text-[#56CCA9]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
                Subscription Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                ID: <span className="font-mono text-sm">{subscription.id}</span>
              </p>
            </div>
          </div>
          <span
            className={`status-badge ${getStatusColor(subscription.status)}`}
          >
            {getStatusIcon(subscription.status)}
            {subscription.status}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User & Plan Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information Card */}
          <Card
            title="User Information"
            type="info"
            variant="detail"
          >
            <div className="space-y-3">
              <div className="info-row">
                <span className="info-label">Name</span>
                <span className="info-value">
                  {subscription.user.name}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">
                  {subscription.user.email}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Username</span>
                <span className="info-value">
                  {subscription.user.username}
                </span>
              </div>
            </div>
          </Card>

          {/* Plan Information Card */}
          <Card
            title="Plan Information"
            type="success"
            variant="detail"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#18191F] dark:text-white mb-2">
                  {subscription.plan.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {subscription.plan.description}
                </p>
                <span className="badge-mono">
                  {subscription.plan.slug}
                </span>
              </div>
              
              <div className="section-divider">
                <h4 className="text-sm font-bold text-[#18191F] dark:text-white mb-2">
                  Features
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(subscription.plan.features).map(([key, value]) => (
                    <div
                      key={key}
                      className="feature-item"
                    >
                      {typeof value === "boolean" ? (
                        value ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )
                      ) : null}
                      <span className="text-sm text-[#18191F] dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}: {typeof value !== "boolean" && value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Information Card */}
          <Card
            title="Pricing Details"
            type="warning"
            variant="detail"
          >
            <div className="pricing-display">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {subscription.planPrice.interval === "MONTHLY" ? "Monthly" : "Annual"} Payment
                </p>
                <p className="text-3xl font-bold text-[#18191F] dark:text-white">
                  {formatPrice(subscription.planPrice.amount, subscription.planPrice.currency)}
                </p>
              </div>
              <div className="text-right">
                <span className="badge-currency">
                  {subscription.planPrice.currency}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Timeline & Metadata */}
        <div className="space-y-6">
          {/* Billing Period Card */}
          <Card
            title="Billing Period"
            type="info"
            variant="detail"
          >
            <div className="space-y-3">
              <div>
                <p className="info-label">Period Start</p>
                <p className="info-value">
                  {formatDate(subscription.currentPeriodStart)}
                </p>
              </div>
              <div>
                <p className="info-label">Period End</p>
                <p className="info-value">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>
          </Card>

          {/* Timeline Card */}
          <Card
            title="Timeline"
            type="default"
            variant="detail"
          >
            <div className="space-y-4">
              <div>
                <p className="info-label">Started At</p>
                <p className="info-value">
                  {formatDate(subscription.startedAt)}
                </p>
              </div>
              <div>
                <p className="info-label">Created At</p>
                <p className="info-value">
                  {formatDate(subscription.createdAt)}
                </p>
              </div>
              <div>
                <p className="info-label">Updated At</p>
                <p className="info-value">
                  {formatDate(subscription.updatedAt)}
                </p>
              </div>
              {subscription.canceledAt && (
                <div>
                  <p className="info-label">Canceled At</p>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {formatDate(subscription.canceledAt)}
                  </p>
                </div>
              )}
              {subscription.endedAt && (
                <div>
                  <p className="info-label">Ended At</p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {formatDate(subscription.endedAt)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        open={cancelModalOpen}
        title="Annuler l'abonnement"
        message="Êtes-vous sûr de vouloir annuler cet abonnement ? L'utilisateur perdra l'accès aux fonctionnalités premium à la fin de la période de facturation actuelle."
        confirmLabel="Annuler l'abonnement"
        cancelLabel="Retour"
        loading={isCanceling}
        onConfirm={handleCancel}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}
