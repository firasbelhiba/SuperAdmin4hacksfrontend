"use client";

import React, { createContext, useContext, useCallback, useMemo, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { setApiAuthToken } from "@/lib/api";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { sendVerificationEmail, verifyEmail } from "@/services/auth";

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string;
  role: string;
  image?: string;
  isEmailVerified?: boolean;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

// Auth status enum for clearer state management
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  loginWithOAuthToken: (token: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  sendVerificationEmail: () => Promise<{ email: string; message: string }>;
  verifyEmail: (code: number) => Promise<{ message: string; email: string }>;
  error: string | null;
  refreshError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: nextAuthStatus, update } = useSession();

  // Derive auth status - DO NOT compute isAuthenticated during loading
  // This prevents false redirects during session rehydration
  const status: AuthStatus = nextAuthStatus;
  const isLoading = nextAuthStatus === "loading";
  const isAuthenticated = nextAuthStatus === "authenticated" && !!session?.user;
  const accessToken = session?.accessToken || null;
  const error = session?.error || null;

  // Map NextAuth session user to our User type - memoized to prevent unnecessary re-renders
  const user: User | null = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      name: session.user.name,
      role: session.user.role,
      image: session.user.image,
      isEmailVerified: session.user.isEmailVerified,
    };
  }, [session?.user]);

  // Sync access token with axios interceptor
  // This ensures API calls use the current token without calling getSession() on every request
  useEffect(() => {
    setApiAuthToken(accessToken);
  }, [accessToken]);

  // Proactive client-side token refresh
  // This handles refresh token rotation by making sure Set-Cookie headers reach the browser
  const { refreshError } = useTokenRefresh();

  // Authentication actions
  const login = useCallback(async (data: LoginInput) => {
    // First, call our proxy route to get the token AND set the refresh token cookie
    const loginResponse = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: data.identifier,
        password: data.password,
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json().catch(() => ({}));
      throw new Error(errorData.error || "Login failed");
    }

    const { token } = await loginResponse.json();

    // Now authenticate with NextAuth using the token
    const result = await signIn("oauth-token", {
      token,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  const loginWithOAuthToken = useCallback(async (token: string) => {
    const result = await signIn("oauth-token", {
      token,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await update();
  }, [update]);

  // Email verification actions - using auth service
  const handleSendVerificationEmail = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }
    return await sendVerificationEmail();
  }, [isAuthenticated]);

  const handleVerifyEmail = useCallback(
    async (code: number) => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      const result = await verifyEmail({ code });
      
      // Refresh session to get updated user data
      await update();

      return result;
    },
    [isAuthenticated, update]
  );

  const value: AuthContextType = {
    user,
    status,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    logout,
    loginWithOAuthToken,
    refreshSession,
    sendVerificationEmail: handleSendVerificationEmail,
    verifyEmail: handleVerifyEmail,
    error,
    refreshError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}