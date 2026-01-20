"use client";

import { useForm } from "react-hook-form";
import { Plan, PlanFeatures } from "@/services/plans";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import  Label  from "@/components/form/Label";
import { Package } from "lucide-react";

export interface PlanFormData {
  slug: string;
  name: string;
  description: string;
  isActive: boolean;
  features: PlanFeatures;
}

interface PlanFormProps {
  initialData?: Plan;
  onSubmit: (data: PlanFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export default function PlanForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Save Plan",
}: PlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanFormData>({
    defaultValues: initialData
      ? {
          slug: initialData.slug,
          name: initialData.name,
          description: initialData.description,
          isActive: initialData.isActive,
          features: initialData.features,
        }
      : {
          slug: "",
          name: "",
          description: "",
          isActive: true,
          features: {
            maxHackathons: 0,
            aiJudging: false,
            customBranding: false,
          },
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="p-3 rounded-xl bg-[#56CCA9]/10 border-2 border-[#18191F] dark:border-gray-300">
          <Package className="w-6 h-6 text-[#56CCA9]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#18191F] dark:text-white">
            {initialData ? "Edit Plan" : "Create New Plan"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {initialData
              ? "Update plan details and features"
              : "Add a new subscription plan"}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#18191F] dark:text-white">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Plan Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Pro Plan"
              {...register("name", { required: "Plan name is required" })}
              error={!!errors.name}
              hint={errors.name?.message}
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              type="text"
              placeholder="pro-plan"
              {...register("slug", {
                required: "Slug is required",
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: "Slug must contain only lowercase letters, numbers, and hyphens",
                },
              })}
              error={!!errors.slug}
              hint={errors.slug?.message}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="description"
            rows={3}
            placeholder="Perfect for growing teams and organizations"
            {...register("description", { required: "Description is required" })}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150
              ${
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#18191F] dark:border-gray-300 focus:border-[#56CCA9] dark:focus:border-[#56CCA9]"
              }
              bg-white dark:bg-gray-900 text-[#18191F] dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-[#56CCA9]/20
              disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            {...register("isActive")}
            className="w-5 h-5 rounded border-2 border-[#18191F] dark:border-gray-300 
              text-[#56CCA9] focus:ring-2 focus:ring-[#56CCA9]/20 cursor-pointer"
          />
          <Label htmlFor="isActive" className="cursor-pointer mb-0">
            Active Plan
          </Label>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#18191F] dark:text-white">
          Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Max Hackathons */}
          <div>
            <Label htmlFor="maxHackathons">
              Max Hackathons <span className="text-red-500">*</span>
            </Label>
            <Input
              id="maxHackathons"
              type="number"
              min="0"
              placeholder="10"
              {...register("features.maxHackathons", {
                required: "Max hackathons is required",
                valueAsNumber: true,
                min: { value: 0, message: "Must be at least 0" },
              })}
              error={!!errors.features?.maxHackathons}
              hint={errors.features?.maxHackathons?.message as string}
            />
          </div>

          {/* AI Judging */}
          <div className="flex items-center gap-3 pt-8">
            <input
              type="checkbox"
              id="aiJudging"
              {...register("features.aiJudging")}
              className="w-5 h-5 rounded border-2 border-[#18191F] dark:border-gray-300 
                text-[#56CCA9] focus:ring-2 focus:ring-[#56CCA9]/20 cursor-pointer"
            />
            <Label htmlFor="aiJudging" className="cursor-pointer mb-0">
              AI Judging
            </Label>
          </div>

          {/* Custom Branding */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="customBranding"
              {...register("features.customBranding")}
              className="w-5 h-5 rounded border-2 border-[#18191F] dark:border-gray-300 
                text-[#56CCA9] focus:ring-2 focus:ring-[#56CCA9]/20 cursor-pointer"
            />
            <Label htmlFor="customBranding" className="cursor-pointer mb-0">
              Custom Branding
            </Label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
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
