"use client";

import { useForm } from "react-hook-form";
import { PlanPrice, PriceCurrency, PriceInterval } from "@/services/plans";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/ui/select/Select";
import { DollarSign, AlertCircle } from "lucide-react";

export interface PriceFormData {
  amount: number;
  currency: PriceCurrency;
  interval: PriceInterval;
  isActive: boolean;
}

interface PriceFormProps {
  initialData?: PlanPrice;
  existingPrices?: PlanPrice[];
  onSubmit: (data: PriceFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export default function PriceForm({
  initialData,
  existingPrices = [],
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Save Price",
}: PriceFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PriceFormData>({
    defaultValues: initialData
      ? {
          amount: initialData.amount,
          currency: initialData.currency,
          interval: initialData.interval,
          isActive: initialData.isActive,
        }
      : {
          amount: 0,
          currency: "USD",
          interval: "MONTHLY",
          isActive: true,
        },
  });

  const selectedInterval = watch("interval");
  
  // Vérifier si l'intervalle sélectionné existe déjà (sauf si on édite ce prix)
  const intervalExists = existingPrices.some(
    (price) => 
      price.interval === selectedInterval && 
      price.id !== initialData?.id
  );

  // Compter les intervalles existants
  const hasMonthly = existingPrices.some(
    (p) => p.interval === "MONTHLY" && p.id !== initialData?.id
  );
  const hasAnnual = existingPrices.some(
    (p) => p.interval === "ANNUAL" && p.id !== initialData?.id
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="p-3 rounded-xl bg-[#FFBD12]/10 border-2 border-[#18191F] dark:border-gray-300">
          <DollarSign className="w-6 h-6 text-[#FFBD12]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#18191F] dark:text-white">
            {initialData ? "Edit Price" : "Add New Price"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {initialData
              ? "Update pricing details"
              : "Add a new pricing option for this plan"}
          </p>
        </div>
      </div>

      {/* Price Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount">
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="49.99"
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
                min: { value: 0, message: "Amount must be positive" },
              })}
              error={!!errors.amount}
              hint={errors.amount?.message}
            />
          </div>

          {/* Currency */}
          <div>
            <Label htmlFor="currency">
              Currency <span className="text-red-500">*</span>
            </Label>
            <Select
              name="currency"
              value={watch("currency")}
              onChange={(e) => setValue("currency", e.target.value as PriceCurrency)}
              options={[
                { value: "USD", label: "USD - US Dollar" },
                { value: "EUR", label: "EUR - Euro" },
              ]}
              placeholder="Select currency"
              error={!!errors.currency}
            />
            {errors.currency && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.currency.message}
              </p>
            )}
          </div>

          {/* Interval */}
          <div>
            <Label htmlFor="interval">
              Billing Interval <span className="text-red-500">*</span>
            </Label>
            <Select
              name="interval"
              value={watch("interval")}
              onChange={(e) => setValue("interval", e.target.value as PriceInterval)}
              options={[
                { 
                  value: "MONTHLY", 
                  label: `Monthly${hasMonthly && !initialData ? " (Already exists)" : ""}` 
                },
                { 
                  value: "ANNUAL", 
                  label: `Annual${hasAnnual && !initialData ? " (Already exists)" : ""}` 
                },
              ]}
              placeholder="Select interval"
              error={!!errors.interval || intervalExists}
              disabled={false}
            />
            {errors.interval && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.interval.message}
              </p>
            )}
            {intervalExists && (
              <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  A {selectedInterval.toLowerCase()} price already exists for this plan. 
                  Creating this will fail. Please choose a different interval or edit the existing price.
                </p>
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 pt-8">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="w-5 h-5 rounded border-2 border-[#18191F] dark:border-gray-300 
                text-[#56CCA9] focus:ring-2 focus:ring-[#56CCA9]/20 cursor-pointer"
            />
            <Label htmlFor="isActive" className="cursor-pointer mb-0">
              Active Price
            </Label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
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
