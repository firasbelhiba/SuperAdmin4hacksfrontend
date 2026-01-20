"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Subscription, SubscriptionStatus } from "@/services/subscriptions";
import { getPlans, Plan, PlanPrice, getPlanPrices } from "@/services/plans";
import { getUsers, User } from "@/services/users";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import SearchableSelect, { SearchableOption } from "@/components/form/SearchableSelect";
import Select from "@/components/ui/select/Select";
import DateRangePicker from "@/components/form/DateRangePicker";
import { CreditCard, User as UserIcon, Package, DollarSign } from "lucide-react";

export interface SubscriptionFormData {
  userId: string;
  planId: string;
  planPriceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

interface SubscriptionFormProps {
  initialData?: Subscription;
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export default function SubscriptionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Save Subscription",
}: SubscriptionFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [prices, setPrices] = useState<PlanPrice[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    mode: "onChange",
    defaultValues: initialData
      ? {
          userId: initialData.userId,
          planId: initialData.planId,
          planPriceId: initialData.planPriceId,
          status: initialData.status,
          currentPeriodStart: new Date(initialData.currentPeriodStart).toISOString().slice(0, 16),
          currentPeriodEnd: new Date(initialData.currentPeriodEnd).toISOString().slice(0, 16),
        }
      : {
          userId: "",
          planId: "",
          planPriceId: "",
          status: "ACTIVE",
          currentPeriodStart: new Date().toISOString().slice(0, 16),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        },
  });

  // Enregistrer les validations pour les champs custom
  register("userId", { required: "User is required" });
  register("planId", { required: "Plan is required" });
  register("planPriceId", { 
    validate: (value) => {
      const planId = watch("planId");
      // Seulement valider si un plan est sélectionné
      if (planId && !value) {
        return "Pricing option is required";
      }
      return true;
    }
  });
  register("status", { required: "Status is required" });
  register("currentPeriodStart", { 
    required: "Period start is required",
    validate: (value) => {
      const endDate = watch("currentPeriodEnd");
      if (endDate && new Date(value) >= new Date(endDate)) {
        return "Start date must be before end date";
      }
      return true;
    }
  });
  register("currentPeriodEnd", { 
    required: "Period end is required",
    validate: (value) => {
      const startDate = watch("currentPeriodStart");
      if (startDate && new Date(value) <= new Date(startDate)) {
        return "End date must be after start date";
      }
      return true;
    }
  });

  const selectedPlanId = watch("planId");

  // Au début du composant, ajoutez ces fonctions de recherche
  const searchUsers = async (query: string): Promise<SearchableOption[]> => {
    try {
      const response = await getUsers({ search: query }, 1, 20);
      return response.data.map((user) => ({
        value: user.id,
        label: user.name,
        subtitle: user.email,
        searchText: `${user.username} ${user.email} ${user.name}`,
      }));
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  };

  const searchPlans = async (query: string): Promise<SearchableOption[]> => {
    try {
      const response = await getPlans({ search: query }, 1, 20);
      // Filtrer seulement les plans actifs
      return response.data
        .filter((plan) => plan.isActive)
        .map((plan) => ({
          value: plan.id,
          label: plan.name,
          subtitle: plan.description,
          searchText: `${plan.slug} ${plan.description}`,
        }));
    } catch (error) {
      console.error("Error searching plans:", error);
      return [];
    }
  };

  // Charger les données initiales (optimisé - un seul appel par ressource)
  useEffect(() => {
    const fetchInitialData = async () => {
      // Utilisateurs initiaux (limité à 10)
      try {
        const usersResponse = await getUsers({}, 1, 10);
        let allUsers = usersResponse.data;
        
        // En mode édition, vérifier si l'utilisateur sélectionné est dans la liste
        if (initialData && initialData.user) {
          const selectedUserExists = allUsers.some(u => u.id === initialData.userId);
          if (!selectedUserExists) {
            // Créer un objet User compatible depuis les données de subscription
            const userFromSubscription: User = {
              id: initialData.user.id,
              username: initialData.user.username,
              name: initialData.user.name,
              email: initialData.user.email,
              role: 'USER',
              image: null,
              isBanned: false,
              bannedAt: null,
              bannedReason: null,
              isEmailVerified: true,
              emailVerifiedAt: null,
              lastLoginAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            // Ajouter l'utilisateur sélectionné au début de la liste
            allUsers = [userFromSubscription, ...allUsers];
          }
        }
        
        setUsers(allUsers);
        setErrorUsers(null);
      } catch (error: any) {
        console.error("Error fetching initial users:", error);
        setErrorUsers(error.response?.data?.message || "Failed to load users");
      } finally {
        setLoadingUsers(false);
      }

      // Plans initiaux actifs uniquement (limité à 10)
      try {
        const plansResponse = await getPlans({}, 1, 10);
        // Filtrer seulement les plans actifs
        let activePlans = plansResponse.data.filter((plan) => plan.isActive);
        
        // En mode édition, vérifier si le plan sélectionné est dans la liste
        if (initialData && initialData.plan) {
          const selectedPlanExists = activePlans.some(p => p.id === initialData.planId);
          if (!selectedPlanExists) {
            // Créer un objet Plan compatible depuis les données de subscription
            const planFromSubscription: Plan = {
              id: initialData.plan.id,
              name: initialData.plan.name,
              slug: initialData.plan.slug,
              description: initialData.plan.description || '',
              isActive: initialData.plan.isActive,
              features: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              prices: [],
              _count: { subscriptions: 0 },
            };
            // Ajouter le plan sélectionné au début de la liste (même s'il est inactif)
            activePlans = [planFromSubscription, ...activePlans];
          }
        }
        
        setPlans(activePlans);
        setErrorPlans(null);
      } catch (error: any) {
        console.error("Error fetching initial plans:", error);
        setErrorPlans(error.response?.data?.message || "Failed to load plans");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchInitialData();
  }, [initialData]);

  // Charger les prix quand un plan est sélectionné
  useEffect(() => {
    if (selectedPlanId) {
      const fetchPrices = async () => {
        setLoadingPrices(true);
        try {
          const pricesData = await getPlanPrices(selectedPlanId);
          console.log("Prices loaded for plan", selectedPlanId, ":", pricesData);
          setPrices(pricesData);
          
          // Vérifier si le prix actuel existe dans les nouveaux prix
          const currentPriceId = watch("planPriceId");
          const currentPriceExists = pricesData.some(p => p.id === currentPriceId);
          
          // Si le prix actuel n'existe pas dans les nouveaux prix, réinitialiser
          if (!currentPriceExists) {
            if (pricesData.length > 0) {
              // Sélectionner le premier prix disponible
              setValue("planPriceId", pricesData[0].id, { shouldValidate: true });
            } else {
              // Aucun prix disponible, réinitialiser
              setValue("planPriceId", "", { shouldValidate: true });
            }
          }
        } catch (error) {
          console.error("Error fetching prices:", error);
          setPrices([]);
          setValue("planPriceId", "", { shouldValidate: true });
        } finally {
          setLoadingPrices(false);
        }
      };
      fetchPrices();
    } else {
      setPrices([]);
      setValue("planPriceId", "", { shouldValidate: true });
    }
  }, [selectedPlanId, setValue, watch]);

  const handleFormSubmit = (data: SubscriptionFormData) => {
    
    // Convertir les dates au format ISO complet
    const formattedData = {
      ...data,
      currentPeriodStart: new Date(data.currentPeriodStart).toISOString(),
      currentPeriodEnd: new Date(data.currentPeriodEnd).toISOString(),
    };
    onSubmit(formattedData);
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="p-3 rounded-xl bg-[#56CCA9]/10 border-2 border-[#18191F] dark:border-gray-300">
          <CreditCard className="w-6 h-6 text-[#56CCA9]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#18191F] dark:text-white">
            {initialData ? "Edit Subscription" : "Create New Subscription"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {initialData
              ? "Update subscription details"
              : "Add a new subscription for a user"}
          </p>
        </div>
      </div>

      {/* User & Plan Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#18191F] dark:text-white flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-[#2B7FFF]" />
          User & Plan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Selection */}
          <div>
            <Label htmlFor="userId">
              User <span className="text-red-500">*</span>
            </Label>
            {loadingUsers ? (
              <div className="w-full px-4 py-3 rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-900 text-gray-400">
                Loading users...
              </div>
            ) : errorUsers ? (
              <div className="w-full px-4 py-3 rounded-xl border-2 border-red-500 bg-white dark:bg-gray-900 text-red-600">
                Error: {errorUsers}
              </div>
            ) : (
              <SearchableSelect
                id="userId"
                value={watch("userId")}
                onChange={(value) => {
                  setValue("userId", value, { shouldValidate: true });
                }}
                onSearch={searchUsers}
                initialOptions={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                  subtitle: user.email,
                }))}
                placeholder="Select a user"
                searchPlaceholder="Search by name, email or username..."
                emptyMessage="Type to search users"
                noResultsMessage="No users found"
                minSearchLength={2}
                debounceMs={500}
                disabled={!!initialData}
                error={!!errors.userId}
              />
            )}
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                User is required
              </p>
            )}
            {initialData && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                User cannot be changed after creation
              </p>
            )}
          </div>

          {/* Plan Selection */}
          <div>
            <Label htmlFor="planId">
              Plan <span className="text-red-500">*</span>
            </Label>
            {loadingPlans ? (
              <div className="w-full px-4 py-3 rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-900 text-gray-400">
                Loading plans...
              </div>
            ) : errorPlans ? (
              <div className="w-full px-4 py-3 rounded-xl border-2 border-red-500 bg-white dark:bg-gray-900 text-red-600">
                Error: {errorPlans}
              </div>
            ) : (
              <SearchableSelect
                id="planId"
                value={watch("planId")}
                onChange={(value) => {
                  setValue("planId", value, { shouldValidate: true });
                }}
                onSearch={searchPlans}
                initialOptions={plans.map((plan) => ({
                  value: plan.id,
                  label: plan.name,
                  subtitle: plan.description,
                }))}
                placeholder="Select a plan"
                searchPlaceholder="Search plans..."
                emptyMessage="Type to search plans"
                noResultsMessage="No plans found"
                minSearchLength={2}
                debounceMs={500}
                error={!!errors.planId}
              />
            )}
            {errors.planId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Plan is required
              </p>
            )}
          </div>
        </div>

        {/* Price Selection */}
        <div>
          <Label htmlFor="planPriceId">
            Pricing Option <span className="text-red-500">*</span>
          </Label>
          <Select
            name="planPriceId"
            value={watch("planPriceId")}
            onChange={(e) => {
              setValue("planPriceId", e.target.value, { shouldValidate: true });
            }}
            options={[
              {
                value: "",
                label: !selectedPlanId
                  ? "Select a plan first"
                  : loadingPrices
                  ? "Loading prices..."
                  : "Select a price",
              },
              ...prices.map((price) => ({
                value: price.id,
                label: `${formatPrice(price.amount, price.currency)} - ${price.interval} (${price.currency})`,
              })),
            ]}
            placeholder="Select a price"
            error={!!errors.planPriceId}
            disabled={!selectedPlanId || loadingPrices}
          />
          {errors.planPriceId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.planPriceId.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            name="status"
            value={watch("status")}
            onChange={(e) => {
              setValue("status", e.target.value as SubscriptionStatus, { shouldValidate: true });
            }}
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "CANCELED", label: "Canceled" },
              { value: "EXPIRED", label: "Expired" },
              { value: "PAUSED", label: "Paused" },
            ]}
            placeholder="Select status"
            error={!!errors.status}
          />
          {errors.status && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Status is required
            </p>
          )}
        </div>
      </div>

      {/* Billing Period */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#18191F] dark:text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#FFBD12]" />
          Billing Period
        </h3>

        <DateRangePicker
          startLabel="Period Start"
          endLabel="Period End"
          startValue={watch("currentPeriodStart")}
          endValue={watch("currentPeriodEnd")}
          onStartChange={(value) => {
            setValue("currentPeriodStart", value, { shouldValidate: true });
          }}
          onEndChange={(value) => {
            setValue("currentPeriodEnd", value, { shouldValidate: true });
          }}
          startError={!!errors.currentPeriodStart}
          endError={!!errors.currentPeriodEnd}
          startHint={errors.currentPeriodStart?.message}
          endHint={errors.currentPeriodEnd?.message}
          required
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || loadingUsers || loadingPlans}
          className="flex-1"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
