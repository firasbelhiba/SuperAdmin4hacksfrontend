"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, CheckCircle2, XCircle, Calendar, Zap, Edit, Trash2, DollarSign, Plus } from "lucide-react";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card/Card";
import { 
  getPlanById, 
  deletePlan, 
  Plan, 
  PlanPrice,
  getPlanPrices,
  createPlanPrice,
  updatePlanPrice,
  deletePlanPrice,
  CreatePriceData
} from "@/services/plans";
import { useAlert } from "@/context/AlertProvider";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/modal";
import PriceForm, { PriceFormData } from "@/components/form/PriceForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlanDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { isLoading: authLoading } = useAuthGuard();

  const [planId, setPlanId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [prices, setPrices] = useState<PlanPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Price modals state
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PlanPrice | null>(null);
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);
  const [deletePriceModalOpen, setDeletePriceModalOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<PlanPrice | null>(null);
  const [isDeletingPrice, setIsDeletingPrice] = useState(false);

  // Charger les détails du plan
  useEffect(() => {
    params.then(async (p) => {
      setPlanId(p.id);
      
      try {
        const planData = await getPlanById(p.id);
        setPlan(planData);
        
        // Charger les prix du plan
        const pricesData = await getPlanPrices(p.id);
        setPrices(pricesData);
      } catch (err: any) {
        const errorMessage = err.response?.status === 404 
          ? "Plan not found" 
          : err.response?.data?.message || "Failed to load plan details";
        setError(errorMessage);
        showAlert("error", "Error", errorMessage);
      } finally {
        setLoading(false);
      }
    });
  }, [showAlert]);

  const handleDelete = async () => {
    if (!planId) return;
    
    setIsDeleting(true);
    try {
      await deletePlan(planId);
      showAlert("success", "Success", "Plan deleted successfully!");
      router.push("/plans");
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to delete plan"
      );
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // Price handlers
  const handleAddPrice = () => {
    setEditingPrice(null);
    setPriceModalOpen(true);
  };

  const handleEditPrice = (price: PlanPrice) => {
    setEditingPrice(price);
    setPriceModalOpen(true);
  };

  const handlePriceSubmit = async (data: PriceFormData) => {
    if (!planId) return;

    setIsSubmittingPrice(true);
    try {
      if (editingPrice) {
        // Update existing price
        const updatedPrice = await updatePlanPrice(editingPrice.id, data);
        setPrices((prev) =>
          prev.map((p) => (p.id === updatedPrice.id ? updatedPrice : p))
        );
        showAlert("success", "Success", "Price updated successfully!");
      } else {
        // Create new price
        const newPrice = await createPlanPrice(planId, data as CreatePriceData);
        setPrices((prev) => [...prev, newPrice]);
        showAlert("success", "Success", "Price created successfully!");
      }
      setPriceModalOpen(false);
      setEditingPrice(null);
    } catch (error: any) {
      console.error("Error saving price:", error);
      
      // Gestion spécifique de l'erreur 409 (Conflict)
      if (error.response?.status === 409) {
        showAlert(
          "error",
          "Duplicate Price",
          `A ${data.interval.toLowerCase()} price already exists for this plan. Please edit the existing price or choose a different interval.`
        );
      } else {
        showAlert(
          "error",
          "Error",
          error.response?.data?.message || "Failed to save price"
        );
      }
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  const handleDeletePrice = (price: PlanPrice) => {
    setPriceToDelete(price);
    setDeletePriceModalOpen(true);
  };

  const confirmDeletePrice = async () => {
    if (!priceToDelete) return;

    setIsDeletingPrice(true);
    try {
      await deletePlanPrice(priceToDelete.id);
      setPrices((prev) => prev.filter((p) => p.id !== priceToDelete.id));
      showAlert("success", "Success", "Price deleted successfully!");
      setDeletePriceModalOpen(false);
      setPriceToDelete(null);
    } catch (error: any) {
      console.error("Error deleting price:", error);
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to delete price"
      );
    } finally {
      setIsDeletingPrice(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading plan details..." />;
  }

  if (error || !plan) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/plans")}
          className="neo-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>
        <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0px_0px_rgba(24,25,31,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,213,219,0.3)] p-12">
          <div className="flex flex-col items-center justify-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-[#18191F] dark:text-white mb-2">
              Plan Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {error || "The plan you're looking for doesn't exist."}
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
          onClick={() => router.push("/plans")}
          className="neo-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>
        <div className="flex items-center gap-3">
          <Button
            variant="success"
            onClick={() => router.push(`/plans/${planId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit size={18} />
            Edit Plan
          </Button>
          <Button
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </Button>
        </div>
      </div>

      {/* Plan Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0px_0px_rgba(24,25,31,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,213,219,0.3)] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#56CCA9]/10 border-2 border-[#18191F] dark:border-gray-300">
              <Package className="w-8 h-8 text-[#56CCA9]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
                {plan.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {plan.description}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Slug: <span className="font-mono text-[#18191F] dark:text-white">{plan.slug}</span>
                </span>
              </div>
            </div>
          </div>
          <div>
            {plan.isActive ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-[#18191F] dark:border-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-2 border-[#18191F] dark:border-gray-600">
                <XCircle className="w-4 h-4" />
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Features Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0px_0px_rgba(24,25,31,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,213,219,0.3)] p-6">
            <h2 className="text-xl font-bold text-[#18191F] dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FFBD12]" />
              Features
            </h2>
            <div className="space-y-3">
              {Object.entries(plan.features).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                >
                  <span className="font-medium text-[#18191F] dark:text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm">
                    {typeof value === "boolean" ? (
                      value ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )
                    ) : (
                      <span className="font-semibold text-[#18191F] dark:text-white">
                        {value}
                      </span>
                    )}
                  </span>
                </div>
              ))}
              {Object.keys(plan.features).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No features defined
                </p>
              )}
            </div>
          </div>

          {/* Prices Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0px_0px_rgba(24,25,31,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,213,219,0.3)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#18191F] dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#FFBD12]" />
                Pricing Options
              </h2>
              <Button
                variant="primary"
                onClick={handleAddPrice}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Price
              </Button>
            </div>
            
            {prices && prices.length > 0 ? (
              <div className="space-y-3">
                {prices.map((price) => (
                  <div
                    key={price.id}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-[#56CCA9] dark:hover:border-[#56CCA9] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-[#18191F] dark:text-white">
                            {formatPrice(price.amount, price.currency)}
                          </span>
                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#2B7FFF]/10 text-[#2B7FFF] dark:bg-[#2B7FFF]/20 border border-[#2B7FFF]/30">
                            {price.interval === "MONTHLY" ? "Monthly" : "Annual"}
                          </span>
                          {price.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Currency: {price.currency}</span>
                          {price._count && (
                            <span>Subscriptions: {price._count.subscriptions}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditPrice(price)}
                          className="p-2!"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeletePrice(price)}
                          className="p-2!"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No pricing options available
                </p>
                <Button
                  variant="primary"
                  onClick={handleAddPrice}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  Add First Price
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Subscriptions Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0px_0px_rgba(24,25,31,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,213,219,0.3)] p-6">
            <h2 className="text-lg font-bold text-[#18191F] dark:text-white mb-4">
              Statistics
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#2B7FFF]/10 border-2 border-[#18191F] dark:border-gray-300">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Subscriptions
                </p>
                <p className="text-3xl font-bold text-[#18191F] dark:text-white">
                  {plan._count.subscriptions}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-gray-300 shadow-[4px_4px_0px_0px_rgba(24,25,31,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,213,219,0.3)] p-6">
            <h2 className="text-lg font-bold text-[#18191F] dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FEC5EE]" />
              Metadata
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Created At
                </p>
                <p className="text-sm font-medium text-[#18191F] dark:text-white">
                  {new Date(plan.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Updated At
                </p>
                <p className="text-sm font-medium text-[#18191F] dark:text-white">
                  {new Date(plan.updatedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Plan ID
                </p>
                <p className="text-xs font-mono text-[#18191F] dark:text-white break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {plan.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Plan"
        message={`Are you sure you want to delete "${plan?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Plan"
        cancelLabel="Cancel"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Price Form Modal */}
      <Modal
        isOpen={priceModalOpen}
        onClose={() => {
          setPriceModalOpen(false);
          setEditingPrice(null);
        }}
        className="max-w-2xl mx-4 p-6"
      >
        <PriceForm
          initialData={editingPrice || undefined}
          existingPrices={prices}
          onSubmit={handlePriceSubmit}
          onCancel={() => {
            setPriceModalOpen(false);
            setEditingPrice(null);
          }}
          isSubmitting={isSubmittingPrice}
          submitLabel={editingPrice ? "Update Price" : "Create Price"}
        />
      </Modal>

      {/* Delete Price Confirmation Modal */}
      <ConfirmModal
        open={deletePriceModalOpen}
        title="Delete Price"
        message={`Are you sure you want to delete this price (${priceToDelete ? formatPrice(priceToDelete.amount, priceToDelete.currency) : ''} ${priceToDelete?.interval})? This action cannot be undone.`}
        confirmLabel="Delete Price"
        cancelLabel="Cancel"
        loading={isDeletingPrice}
        onConfirm={confirmDeletePrice}
        onCancel={() => {
          setDeletePriceModalOpen(false);
          setPriceToDelete(null);
        }}
      />
    </div>
  );
}
