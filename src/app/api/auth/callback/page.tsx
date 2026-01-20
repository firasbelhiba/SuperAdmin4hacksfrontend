"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen text-gray-700 dark:text-gray-200">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}

function getProviderDisplayName(provider: string | null): string {
  if (!provider) return "OAuth";
  const providerMap: Record<string, string> = {
    github: "GitHub",
    google: "Google",
    linkedin: "LinkedIn",
  };
  return providerMap[provider.toLowerCase()] || provider;
}

function OAuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { loginWithOAuthToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const providerParam = params.get("provider");
  const provider = getProviderDisplayName(providerParam);

  useEffect(() => {
    const handleCallback = async () => {
      const token = params.get("token");
      const errorParam = params.get("error");

      if (errorParam) {
        setError(errorParam);
        setTimeout(() => router.push("/signin"), 2000);
        return;
      }

      if (token) {
        try {
          await loginWithOAuthToken(token);
          router.push("/");
        } catch (err) {
          console.error(`${provider} callback error:`, err);
          setError("Authentication failed");
          setTimeout(() => router.push("/signin"), 2000);
        }
      } else {
        setError("No token received");
        setTimeout(() => router.push("/signin"), 2000);
      }
    };

    handleCallback();
  }, [params, router, loginWithOAuthToken, provider]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-700 dark:text-gray-200">
        <p className="text-red-500 mb-2">Error: {error}</p>
        <p>Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen text-gray-700 dark:text-gray-200">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        <p>Signing you in with {provider}...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
