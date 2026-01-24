"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { FiLock } from "react-icons/fi";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "../ui/alert/Alert";
import { resetPassword } from "@/services/auth";
import { useSearchParams } from "next/navigation";


const ChangePasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;

export default function ChangePasswordForm() {
  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ChangePasswordData) => {
    if (!token) {
      setAlert({
        variant: "error",
        title: "Missing Token",
        message: "Reset link is invalid or expired. Please request a new one.",
      });
      return;
    }

    try {
      const res = await resetPassword({
        token,
        newPassword: data.newPassword,
      });

      setAlert({
        variant: "success",
        title: "Password Reset Successful",
        message: res.message || "You can now sign in with your new password.",
      });
    } catch (error: any) {
      setAlert({
        variant: "error",
        title: "Error",
        message: error.message || "Invalid or expired token",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4">
      {/* Back Link */}
      <div className="w-full max-w-md mb-4">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-black dark:text-gray-100 hover:underline mt-12"
        >
          <HiArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>
      </div>

    
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 
        shadow-lg dark:shadow-[0_0_15px_rgba(0,0,0,0.6)] 
        rounded-2xl p-8 transition-colors"
      >
      
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/images/logo/logo-4hacks-new.svg"
              alt="4Hacks Logo"
              width={100}
              height={100}
              priority
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl text-gray-900 dark:text-gray-100 font-semibold">
              Change Password
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Enter your new password to complete the reset.
            </p>
          </div>
        </div>

      
        {alert && (
          <div className="mb-4">
            <Alert
              variant={alert.variant}
              title={alert.title}
              message={alert.message}
            />
          </div>
        )}

       
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
         
          {/* <div>
            <Label>Token</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your reset token"
                error={!!errors.token}
                {...register("token")}
              />
            </div>
            {errors.token && (
              <p className="text-red-500 text-xs mt-1">
                {errors.token.message}
              </p>
            )}
          </div> */}

        
          <div>
            <Label>New Password</Label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-12"
                error={!!errors.newPassword}
                {...register("newPassword")}
              />
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <Button className="w-full" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Changing..." : "Change Password"}
          </Button>
        </form>

      
        <div className="mt-5 text-center text-sm text-gray-700 dark:text-gray-400">
          Remembered your password?{" "}
          <Link
            href="/signin"
            className="text-black dark:text-gray-100 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
