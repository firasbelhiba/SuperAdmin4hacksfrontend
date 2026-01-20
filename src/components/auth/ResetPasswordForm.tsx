"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/services/auth";
import Alert from "../ui/alert/Alert";

// ✅ Schema for reset password
const ResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ResetData = z.infer<typeof ResetSchema>;

export default function ResetPasswordForm()  {
 const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);



  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetData>({
    resolver: zodResolver(ResetSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ResetData) => {
     try {
      const res = await requestPasswordReset({ email: data.email });
      setAlert({
        variant: "success",
        title: "Email Sent!",
        message: res.message,
      });
    } catch (error: any) {
      setAlert({
        variant: "error",
        title: "Error",
        message: error.message || "Failed to send reset email.",
      });
    }
    
  };

  return (
    <div className="w-full">
      {/* Alert */}
      {alert && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[400px] z-50">
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
          Reset Password
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email to receive a password reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Email</Label>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 z-10" />
            <Input
              type="email"
              placeholder="you@example.com"
              className="pl-12"
              error={!!errors.email}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-[#FF4B1E] text-xs mt-1.5 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" size="md" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-5 text-center">
        <p className="text-[#18191F] dark:text-gray-400">
          Remembered your password?{" "}
          <Link href="/signin" className="text-[#FF4B1E] hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
