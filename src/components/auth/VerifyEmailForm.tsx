"use client";

import { FaEnvelope } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import Alert from "../ui/alert/Alert";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from "axios";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

const VerifySchema = z.object({
  code: z
    .string()
    .min(6, "Code must be 6 digits.")
    .max(6, "Code must be 6 digits.")
    .regex(/^[0-9]+$/, "Code must contain only numbers."),
});

type VerifyType = z.infer<typeof VerifySchema>;

export default function VerifyEmailForm() {
  const router = useRouter();
  const { verifyEmail, sendVerificationEmail, user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const hasSentInitialEmail = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyType>({
    resolver: zodResolver(VerifySchema),
    mode: "onChange",
  });

  // Auto-send verification email on mount (only once)
  useEffect(() => {
    const sendInitialEmail = async () => {
      if (hasSentInitialEmail.current || isLoading || !user) return;
      
      // Don't send if email is already verified
      if (user.isEmailVerified) {
        router.push("/");
        return;
      }

      hasSentInitialEmail.current = true;
      
      try {
        await sendVerificationEmail();
      } catch {
        // Silently fail - user can click resend if needed
      }
    };

    sendInitialEmail();
  }, [sendVerificationEmail, user, isLoading, router]);

  const onSubmit = async (data: VerifyType) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await verifyEmail(parseInt(data.code));

      setAlert({
        variant: "success",
        title: "Success!",
        message: "Email verified successfully! Redirecting...",
      });

      setTimeout(() => {
        router.push("/email-verified");
      }, 1500);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setAlert({
        variant: "error",
        title: "Verification Failed",
        message:
          axiosError.response?.data?.message || "Invalid verification code. Please try again.",
      });
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    
    try {
      await sendVerificationEmail();
      setAlert({
        variant: "success",
        title: "Email Sent!",
        message: "A new verification code has been sent to your email.",
      });
      setTimeout(() => setAlert(null), 4000);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setAlert({
        variant: "error",
        title: "Failed to Resend",
        message:
          axiosError.response?.data?.message || "Failed to resend code. Please try again.",
      });
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
          Verify Your Email
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          We&apos;ve sent a 6-digit verification code to
        </p>
        {user?.email && (
          <p className="text-[#FF4B1E] font-medium mt-1">
            {user.email}
          </p>
        )}
      </div>

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

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Verification Code</Label>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 z-10" />
            <Input
              {...register("code")}
              maxLength={6}
              placeholder="Enter 6-digit code"
              className="pl-12 text-center tracking-widest font-mono text-lg"
              error={!!errors.code}
            />
          </div>
          {errors.code && (
            <p className="text-[#FF4B1E] text-xs mt-1.5 font-medium">
              {errors.code.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="md"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      {/* Resend */}
      <div className="mt-5 text-center text-sm text-[#18191F] dark:text-gray-400">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-[#FF4B1E] hover:underline font-medium disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Resend Code"}
        </button>
      </div>
    </div>
  );
}
