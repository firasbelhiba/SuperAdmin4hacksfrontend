"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaEnvelope, FaLinkedinIn } from "react-icons/fa";
import { FiLock } from "react-icons/fi";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "../ui/alert/Alert";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://fourhacks.hedera-quests.com/api/v1";

function redirectToOAuth(provider: "google" | "github" | "linkedin") {
  const returnUrl = window.location.origin;
  window.location.href = `${BASE_URL}/auth/${provider}/login?returnUrl=${encodeURIComponent(returnUrl)}`;
}

const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInData = z.infer<typeof SignInSchema>;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInData>({
    resolver: zodResolver(SignInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await login({
        identifier: data.email,
        password: data.password,
      });

      setAlert({
        variant: "success",
        title: "Login Successful",
        message: "Redirecting to your dashboard...",
      });

      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid credentials or network error.";

      setAlert({
        variant: "error",
        title: "Login Failed",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="flex items-center justify-center ">
        <Image
          src="/images/logo/Logo-4hacks.svg"
          alt="4Hacks Logo"
          width={100}
          height={100}
         
          priority
        />
      </div>

      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-2xl font-bold text-[#18191F] dark:text-white mb-1">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign in to continue your journey
        </p>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-2 mb-4">
        <button
          type="button"
          onClick={() => redirectToOAuth("google")}
          className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-xl
            bg-white dark:bg-gray-800 border-2 border-[#18191F]
            shadow-[4px_4px_0_0_#18191F] hover:shadow-[2px_2px_0_0_#18191F] hover:translate-y-0.5
            active:shadow-none active:translate-y-1
            text-[#18191F] dark:text-gray-100 font-medium transition-all duration-150"
        >
          <FcGoogle className="text-xl" />
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={() => redirectToOAuth("github")}
          className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-xl
            bg-white dark:bg-gray-800 border-2 border-[#18191F]
            shadow-[4px_4px_0_0_#18191F] hover:shadow-[2px_2px_0_0_#18191F] hover:translate-y-0.5
            active:shadow-none active:translate-y-1
            text-[#18191F] dark:text-gray-100 font-medium transition-all duration-150"
        >
          <FaGithub className="text-xl" />
          <span>Continue with GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => redirectToOAuth("linkedin")}
          className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-xl
            bg-white dark:bg-gray-800 border-2 border-[#18191F]
            shadow-[4px_4px_0_0_#18191F] hover:shadow-[2px_2px_0_0_#18191F] hover:translate-y-0.5
            active:shadow-none active:translate-y-1
            text-[#18191F] dark:text-gray-100 font-medium transition-all duration-150"
        >
          <FaLinkedinIn className="text-xl text-[#0077B5]" />
          <span>Continue with LinkedIn</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-[#18191F] dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className="mb-4">
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Email */}
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

        {/* Password */}
        <div>
          <Label>Password</Label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 z-10" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-12 pr-12"
              error={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? (
                <EyeIcon className="w-5 h-5 fill-current" />
              ) : (
                <EyeCloseIcon className="w-5 h-5 fill-current" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[#FF4B1E] text-xs mt-1.5 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex items-center justify-end">
          <Link
            href="/resetpassword"
            className="text-sm text-[#FF4B1E] hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="md"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

   
    </div>
  );
}
