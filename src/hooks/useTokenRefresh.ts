"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useCallback, useState } from "react";
import { refreshTokenClient, ACCESS_TOKEN_LIFETIME_MS } from "@/services/auth";

// Proactive token refresh - refresh 2 minutes before expiry
const REFRESH_BUFFER_MS = 2 * 60 * 1000;
// Minimum time between refresh attempts to prevent spam
const MIN_REFRESH_INTERVAL_MS = 10 * 1000;

/**²
 * This hook handles ALL token refresh client-side.
 * Server-side refresh is disabled because the backend uses refresh token rotation,
 * and Set-Cookie headers from server-side calls don't reach the browser.
 */
export function useTokenRefresh() {
  const { data: session, status, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const lastRefreshRef = useRef<number>(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const now = Date.now();

    // Prevent concurrent refresh attempts
    if (isRefreshing) {
      console.log("Token refresh already in progress, skipping");
      return false;
    }

    // Prevent rapid refresh attempts
    if (now - lastRefreshRef.current < MIN_REFRESH_INTERVAL_MS) {
      console.log("Token refresh attempted too soon, skipping");
      return false;
    }

    setIsRefreshing(true);
    setRefreshError(null);
    lastRefreshRef.current = now;

    try {
      console.log("Starting client-side token refresh...");

      // Use centralized auth service
      const newAccessToken = await refreshTokenClient();

      console.log("Client-side token refresh successful");

      // Update NextAuth session with the new token
      // This triggers the JWT callback with trigger="update"
      await update({
        accessToken: newAccessToken,
        accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
      });

      setRefreshError(null);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Client-side token refresh failed:", errorMessage);
      setRefreshError(errorMessage);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, update]);

  // Effect to handle token refresh scheduling
  useEffect(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // Wait for session to load and ensure we have authenticated session
    if (status !== "authenticated" || !session?.accessToken) {
      // Clear refresh error when not authenticated
      if (refreshError) {
        setRefreshError(null);
      }
      return;
    }

    // Get expiry time first - we need it for all refresh logic
    const expiresAt = session.user?.accessTokenExpires;

    // If no expiry info, we can't schedule refresh properly
    // This prevents unnecessary refresh attempts when session is malformed or incomplete
    if (!expiresAt || typeof expiresAt !== "number") {
      // Only log if there's an error indicating we should refresh
      if (session.error === "TokenExpired") {
        console.warn("Token marked as expired but no expiry info in session, cannot refresh");
      }
      return;
    }

    // Check if token is marked as expired by server-side
    if (session.error === "TokenExpired") {
      console.log("Token marked as expired by server, refreshing immediately...");
      refreshToken();
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const timeUntilRefresh = timeUntilExpiry - REFRESH_BUFFER_MS;

    // If token is expired or about to expire, refresh immediately
    if (timeUntilRefresh <= 0) {
      console.log("Token expired or expiring soon, refreshing immediately...");
      refreshToken();
      return;
    }

    // Schedule refresh before expiry
    console.log(`Scheduling token refresh in ${Math.round(timeUntilRefresh / 1000)}s`);
    refreshTimeoutRef.current = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [status, session?.accessToken, session?.user?.accessTokenExpires, session?.error, refreshToken, refreshError]);

  return {
    refreshToken,
    isRefreshing,
    refreshError,
  };
}

// Expose function for manual testing in dev console
// Usage in browser console: window.__forceRefreshToken()
// if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
//   (window as any).__forceRefreshToken = async () => {
//     console.log("🔧 Manual refresh triggered from console");
//     try {
//       const token = await refreshTokenClient();
//       console.log("✅ Manual refresh successful:", token.substring(0, 20) + "...");
//       return token;
//     } catch (error) {
//       console.error("❌ Manual refresh failed:", error);
//       throw error;
//     }
//   };
// }