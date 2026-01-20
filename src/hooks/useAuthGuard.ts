"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

// Time to wait for refresh to complete before redirecting
const REFRESH_GRACE_PERIOD_MS = 10000;

/**
 * Auth guard hook for protected routes
 * Handles authentication state and redirects unauthenticated users
 */
export default function useAuthGuard() {
  const router = useRouter();
  const { status, error, refreshError } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const graceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (graceTimeoutRef.current) {
        clearTimeout(graceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Wait for session to be fully loaded
    if (status === "loading") {
      return;
    }

    // Clear any existing grace period timeout
    if (graceTimeoutRef.current) {
      clearTimeout(graceTimeoutRef.current);
      graceTimeoutRef.current = null;
    }

    // Handle unauthenticated state - redirect immediately
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }

    // Handle refresh errors - redirect immediately
    if (refreshError) {
      console.log("Client-side refresh failed:", refreshError, "- redirecting to signin");
      setIsRefreshing(false);
      router.replace("/signin");
      return;
    }

    // Handle token expiration
    if (error === "TokenExpired") {
      // If refresh also failed, redirect
      if (refreshError) {
        console.log("Token expired and refresh failed, redirecting to signin");
        router.replace("/signin");
        return;
      }

      // Give client-side refresh a grace period to complete
      console.log("Token expired, waiting for client-side refresh...");
      
      // Show refreshing state only after initialization (keeps UI mounted during background refresh)
      if (hasInitialized.current) {
        setIsRefreshing(true);
      }

      // Set grace period timeout
      graceTimeoutRef.current = setTimeout(() => {
        console.log("Refresh grace period expired, redirecting to signin");
        router.replace("/signin");
      }, REFRESH_GRACE_PERIOD_MS);

      return;
    }

    // Handle unrecoverable refresh token errors
    if (error === "RefreshTokenError") {
      console.log("Refresh token error, redirecting to signin");
      router.replace("/signin");
      return;
    }

    // Session is valid - mark as initialized
    setIsRefreshing(false);
    hasInitialized.current = true;
  }, [status, error, refreshError, router]);

  // Return computed states
  const isLoading = status === "loading" && !hasInitialized.current;
  const isReady = status === "authenticated" && !error;
  const isAuthenticated = status === "authenticated";

  return {
    isLoading,
    isReady,
    isRefreshing,
    isAuthenticated,
  };
}