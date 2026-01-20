# Guide d'Intégration NextAuth dans un Projet Existant

## Table des Matières
1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration de Base](#configuration-de-base)
5. [Explication des Fonctions](#explication-des-fonctions)
6. [Gestion des Erreurs et Cas Particuliers](#gestion-des-erreurs-et-cas-particuliers)
7. [Exemples d'Utilisation](#exemples-dutilisation)
8. [Conclusions et Liens Utiles](#conclusions-et-liens-utiles)

---

## Introduction

### Qu'est-ce que NextAuth ?

NextAuth (Auth.js) est une bibliothèque d'authentification complète et flexible pour les applications Next.js. Elle offre :

- **Authentification Multi-Provider** : Supporte OAuth, credentials, email, et plus
- **Gestion de Session JWT/Database** : Flexible selon vos besoins
- **Sécurité Intégrée** : CSRF protection, token rotation, etc.
- **TypeScript Support** : Typage complet pour une meilleure DX
- **Callbacks Personnalisables** : Contrôle total sur le flux d'authentification

### Architecture de Notre Implémentation

Notre implémentation utilise une architecture moderne basée sur :

1. **JWT Strategy** : Sessions légères côté client
2. **Refresh Token Rotation** : Sécurité maximale avec rotation des tokens
3. **Client-Side Token Refresh** : Gestion proactive des tokens expirés
4. **Axios Interceptors** : Injection automatique des tokens d'accès
5. **React Context** : État d'authentification global accessible

**Points Clés de l'Architecture :**

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐  │
│  │   NextAuth   │───▶│ AuthContext  │◀─▶│  Components  │  │
│  │   Provider   │    │   + Hooks    │   │              │  │
│  └──────────────┘    └──────────────┘   └──────────────┘  │
│         │                    │                              │
│         │                    ▼                              │
│         │           ┌──────────────┐                        │
│         │           │ useTokenRefr │  (Proactive Refresh)  │
│         │           │     esh      │                        │
│         │           └──────────────┘                        │
│         │                    │                              │
│         ▼                    ▼                              │
│  ┌──────────────────────────────────┐                      │
│  │    Axios Interceptors            │                      │
│  │  (Auto Token Injection)          │                      │
│  └──────────────────────────────────┘                      │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │    Backend    │
              │   (FastAPI)   │
              └───────────────┘
```

---

## Prérequis

Avant de commencer l'intégration de NextAuth, assurez-vous d'avoir :

### Environnement Technique

- **Node.js** : Version 18.x ou supérieure
- **Next.js** : Version 14.x ou supérieure (App Router)
- **React** : Version 18.x ou supérieure
- **TypeScript** : Version 5.x ou supérieure (recommandé)

### Connaissances Requises

- Bases de React et Next.js (App Router)
- Compréhension des JWT (JSON Web Tokens)
- Notions de Context API et React Hooks
- Familiarité avec les API REST

### Backend Requirements

Votre backend doit exposer les endpoints suivants :

```typescript
// Endpoints requis
POST /auth/login       // Connexion avec credentials
POST /auth/register    // Inscription
POST /auth/refresh     // Rafraîchissement du token
POST /auth/logout      // Déconnexion
GET  /auth/me          // Récupérer l'utilisateur courant
POST /auth/email/verify/send  // Envoyer email de vérification
POST /auth/email/verify       // Vérifier l'email
```

### Format de Réponse Backend

```typescript
// Réponse de /auth/login
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username",
    "name": "User Name",
    "role": "USER",
    "image": "https://...",
    "isEmailVerified": true
  }
}

// Réponse de /auth/refresh
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Installation

### Étape 1 : Installer les Dépendances

```bash
# NextAuth et dépendances essentielles
npm install next-auth

# Axios pour les requêtes HTTP
npm install axios

# React Hook Form et Zod (optionnel mais recommandé)
npm install react-hook-form @hookform/resolvers zod
```

### Étape 2 : Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# .env.local

# URL de votre backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Secret pour NextAuth (générez avec: openssl rand -base64 32)
NEXTAUTH_SECRET=votre-secret-aleatoire-tres-securise

# URL de votre application (production)
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ Important :** 
- `NEXTAUTH_SECRET` doit être différent en développement et en production
- Ne commitez JAMAIS vos fichiers `.env` dans Git

### Étape 3 : Créer la Configuration Backend

Créez le fichier `src/services/config.ts` :

```typescript
// src/services/config.ts
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
```

---

## Configuration de Base

### 1. Configuration NextAuth Options

Créez le fichier `src/lib/auth-options.ts` :

```typescript
// src/lib/auth-options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { BASE_URL } from "@/services/config";

// Configuration du temps de vie du token (15 minutes)
const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000;

// Extension des types NextAuth pour inclure nos données
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    username: string;
    name: string;
    role: string;
    image?: string;
    isEmailVerified?: boolean;
    accessToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    user: User;
    accessToken: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string;
    name: string;
    role: string;
    image?: string;
    isEmailVerified?: boolean;
    accessToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Provider Credentials : Email/Password
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const response = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Invalid credentials");
          }

          const { token, user } = await response.json();

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            image: user.image,
            isEmailVerified: user.isEmailVerified,
            accessToken: token,
            accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME,
          };
        } catch (error: any) {
          throw new Error(error.message || "Invalid credentials");
        }
      },
    }),

    // Provider OAuth Token : Pour OAuth géré par le backend
    CredentialsProvider({
      id: "oauth-token",
      name: "OAuth Token",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          throw new Error("Token is required");
        }

        try {
          const response = await fetch(`${BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${credentials.token}`,
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Invalid token");
          }

          const user = await response.json();

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            image: user.image,
            isEmailVerified: user.isEmailVerified,
            accessToken: credentials.token,
            accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME,
          };
        } catch (error) {
          console.error("OAuth token validation failed:", error);
          throw new Error("Invalid token");
        }
      },
    }),
  ],

  callbacks: {
    // JWT Callback : Gestion du token JWT
    async jwt({ token, user, trigger, session }) {
      // Connexion initiale : stocker les données utilisateur
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          image: user.image,
          isEmailVerified: user.isEmailVerified,
          accessToken: user.accessToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // Mise à jour de session (ex: après refresh côté client)
      if (trigger === "update" && session) {
        if (session.accessToken) {
          return {
            ...token,
            accessToken: session.accessToken,
            accessTokenExpires: session.accessTokenExpires || Date.now() + ACCESS_TOKEN_LIFETIME,
            error: undefined,
          };
        }
        return {
          ...token,
          ...session.user,
        };
      }

      // Vérifier si le token est expiré
      const expiresAt = token.accessTokenExpires;
      const isExpired = !expiresAt || typeof expiresAt !== "number" || Date.now() >= expiresAt;

      if (isExpired) {
        // Marquer comme expiré (le refresh sera géré côté client)
        return {
          ...token,
          error: "TokenExpired",
        };
      }

      return token;
    },

    // Session Callback : Exposer les données dans la session
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        username: token.username,
        name: token.name,
        role: token.role,
        image: token.image,
        isEmailVerified: token.isEmailVerified,
        accessToken: token.accessToken,
        accessTokenExpires: token.accessTokenExpires,
      };
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
  },

  events: {
    // Logout : Appeler le backend pour invalider le token
    async signOut({ token }) {
      try {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Backend logout failed:", error);
      }
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 heures
  },

  secret: process.env.NEXTAUTH_SECRET,
};
```

### 2. Route API NextAuth

Créez le fichier `src/app/api/auth/[...nextauth]/route.ts` :

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 3. Provider NextAuth

Créez le fichier `src/providers/NextAuthProvider.tsx` :

```typescript
// src/providers/NextAuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function NextAuthProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### 4. Configuration Axios avec Intercepteurs

Créez le fichier `src/lib/api.ts` :

```typescript
// src/lib/api.ts
import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "@/services/config";

export { BASE_URL };

// Stockage du token au niveau du module
let currentAccessToken: string | null = null;

// Instance Axios configurée
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Fonction pour définir le token (appelée par AuthContext)
export function setApiAuthToken(token: string | null) {
  currentAccessToken = token;
}

// Intercepteur de requête : ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse : gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("API request received 401 - session may need refresh");
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 5. Hook de Refresh Token

Créez le fichier `src/hooks/useTokenRefresh.ts` :

```typescript
// src/hooks/useTokenRefresh.ts
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useCallback, useState } from "react";
import { BASE_URL } from "@/services/config";

// Rafraîchir 2 minutes avant expiration
const REFRESH_BUFFER_MS = 2 * 60 * 1000;
// Intervalle minimum entre les refresh
const MIN_REFRESH_INTERVAL_MS = 10 * 1000;
// Durée de vie du token (15 minutes)
const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000;

/**
 * Hook pour gérer le rafraîchissement automatique des tokens
 * 
 * Ce hook effectue un refresh proactif avant l'expiration du token.
 * Le refresh est géré côté client car le backend utilise la rotation
 * des refresh tokens, et les Set-Cookie headers doivent atteindre le navigateur.
 */
export function useTokenRefresh() {
  const { data: session, status, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const lastRefreshRef = useRef<number>(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef<boolean>(false);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const now = Date.now();

    // Éviter les refresh concurrents
    if (isRefreshingRef.current) {
      console.log("Token refresh already in progress, skipping");
      return false;
    }

    // Éviter les refresh trop fréquents
    if (now - lastRefreshRef.current < MIN_REFRESH_INTERVAL_MS) {
      console.log("Token refresh attempted too soon, skipping");
      return false;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setRefreshError(null);
    lastRefreshRef.current = now;

    try {
      console.log("Starting client-side token refresh...");

      // Appeler le backend directement pour que les cookies soient envoyés
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Important pour les cookies cross-origin
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Refresh failed with status ${response.status}`;
        console.error("Client-side token refresh failed:", errorMessage);
        setRefreshError(errorMessage);
        return false;
      }

      const data = await response.json();
      const newAccessToken = data.token || data.accessToken;

      if (!newAccessToken) {
        console.error("No access token in refresh response");
        setRefreshError("No access token in refresh response");
        return false;
      }

      console.log("Client-side token refresh successful");

      // Mettre à jour la session NextAuth avec le nouveau token
      await update({
        accessToken: newAccessToken,
        accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
      });

      setRefreshError(null);
      return true;
    } catch (error) {
      console.error("Client-side token refresh error:", error);
      setRefreshError(error instanceof Error ? error.message : "Unknown error");
      return false;
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [update]);

  // Effet pour planifier le refresh automatique
  useEffect(() => {
    // Nettoyer le timeout existant
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // Ne rien faire pendant le chargement
    if (status === "loading") {
      return;
    }

    // Pas de session = pas de refresh nécessaire
    if (status === "unauthenticated" || !session) {
      return;
    }

    // Pas de token = pas de refresh possible
    if (!session.accessToken) {
      return;
    }

    // Token marqué comme expiré par le serveur
    if (session.error === "TokenExpired") {
      console.log("Token marked as expired by server, refreshing immediately...");
      refreshToken();
      return;
    }

    // Obtenir le temps d'expiration
    const expiresAt = session.user?.accessTokenExpires;

    // Pas d'info d'expiration mais on a un token
    if (!expiresAt || typeof expiresAt !== "number") {
      if (session.accessToken) {
        console.log("No token expiry info, scheduling refresh...");
        refreshToken();
      }
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const timeUntilRefresh = timeUntilExpiry - REFRESH_BUFFER_MS;

    // Token expiré ou sur le point d'expirer
    if (timeUntilRefresh <= 0) {
      console.log("Token expired or expiring soon, refreshing immediately...");
      refreshToken();
      return;
    }

    // Planifier le refresh avant expiration
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
  }, [status, session?.accessToken, session?.user?.accessTokenExpires, session?.error, refreshToken]);

  return {
    refreshToken,
    isRefreshing,
    refreshError,
  };
}
```

### 6. Context d'Authentification

Créez le fichier `src/context/AuthContext.tsx` :

```typescript
// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useCallback, useMemo, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import axios from "axios";
import { BASE_URL } from "@/services/config";
import { setApiAuthToken } from "@/lib/api";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

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

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  loginWithOAuthToken: (token: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  sendVerificationEmail: () => Promise<{ email: string; message: string }>;
  verifyEmail: (code: number) => Promise<{ message: string; email: string }>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: nextAuthStatus, update } = useSession();

  // Dérivation du statut d'authentification
  const status: AuthStatus = nextAuthStatus;
  const isLoading = nextAuthStatus === "loading";
  const isAuthenticated = nextAuthStatus === "authenticated" && !!session?.user;
  const accessToken = session?.accessToken || null;
  const error = session?.error || null;

  // Mapper l'utilisateur NextAuth vers notre type User
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

  // Synchroniser le token avec l'intercepteur Axios
  useEffect(() => {
    setApiAuthToken(accessToken);
  }, [accessToken]);

  // Activer le refresh automatique des tokens
  useTokenRefresh();

  // Fonction de connexion
  const login = useCallback(async (data: LoginInput) => {
    const result = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  }, []);

  // Fonction d'inscription
  const register = useCallback(async (data: RegisterInput) => {
    const response = await axios.post(`${BASE_URL}/auth/register`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(response.data?.message || "Registration failed");
    }

    // Auto-login après inscription réussie
    const loginResult = await signIn("credentials", {
      identifier: data.email,
      password: data.password,
      redirect: false,
    });

    if (loginResult?.error) {
      throw new Error(loginResult.error);
    }
  }, []);

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  // Connexion avec token OAuth
  const loginWithOAuthToken = useCallback(async (token: string) => {
    const result = await signIn("oauth-token", {
      token,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  }, []);

  // Rafraîchir la session manuellement
  const refreshSession = useCallback(async () => {
    await update();
  }, [update]);

  // Envoyer un email de vérification
  const handleSendVerificationEmail = useCallback(async () => {
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await axios.post(
      `${BASE_URL}/auth/email/verify/send`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  }, [accessToken]);

  // Vérifier l'email avec le code
  const handleVerifyEmail = useCallback(
    async (code: number) => {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await axios.post(
        `${BASE_URL}/auth/email/verify`,
        { code },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Rafraîchir la session pour obtenir les données mises à jour
      await update();

      return response.data;
    },
    [accessToken, update]
  );

  const value: AuthContextType = {
    user,
    status,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    register,
    logout,
    loginWithOAuthToken,
    refreshSession,
    sendVerificationEmail: handleSendVerificationEmail,
    verifyEmail: handleVerifyEmail,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

### 7. Hook de Protection de Routes

Créez le fichier `src/hooks/useAuthGuard.ts` :

```typescript
// src/hooks/useAuthGuard.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

// Temps d'attente pour le refresh avant redirection
const REFRESH_GRACE_PERIOD_MS = 5000;

/**
 * Hook pour protéger les routes authentifiées
 * 
 * Redirige vers /signin si l'utilisateur n'est pas authentifié.
 * Donne un délai de grâce pour le refresh token en cas d'expiration.
 */
export default function useAuthGuard() {
  const router = useRouter();
  const { status, isAuthenticated, error } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isWaitingForRefresh, setIsWaitingForRefresh] = useState(false);
  const graceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (graceTimeoutRef.current) {
        clearTimeout(graceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Attendre que la session soit complètement chargée
    if (status === "loading") {
      return;
    }

    // Nettoyer le timeout existant
    if (graceTimeoutRef.current) {
      clearTimeout(graceTimeoutRef.current);
      graceTimeoutRef.current = null;
    }

    // Non authentifié : rediriger immédiatement
    if (status === "unauthenticated") {
      setIsReady(true);
      router.replace("/signin");
      return;
    }

    // Gérer les erreurs
    if (error) {
      // TokenExpired : donner un délai pour le refresh client-side
      if (error === "TokenExpired") {
        console.log("Token expired, waiting for client-side refresh...");
        setIsWaitingForRefresh(true);

        graceTimeoutRef.current = setTimeout(() => {
          console.log("Refresh grace period expired, redirecting to signin");
          router.replace("/signin");
        }, REFRESH_GRACE_PERIOD_MS);

        return;
      }

      // RefreshTokenError : erreur irrécupérable
      if (error === "RefreshTokenError") {
        console.log("Refresh token error, redirecting to signin");
        setIsReady(true);
        router.replace("/signin");
        return;
      }
    }

    // Session valide
    setIsWaitingForRefresh(false);
    setIsReady(true);
  }, [status, isAuthenticated, error, router]);

  return {
    isLoading: status === "loading" || isWaitingForRefresh,
    isReady: isReady && !isWaitingForRefresh,
    isAuthenticated,
  };
}
```

### 8. Intégration dans le Layout Principal

Modifiez votre `src/app/layout.tsx` :

```typescript
// src/app/layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import NextAuthProvider from "@/providers/NextAuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <NextAuthProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
```

---

## Explication des Fonctions

### 1. `authOptions.callbacks.jwt()`

**Rôle :** Gère le cycle de vie du JWT (création, mise à jour, expiration)

**Paramètres :**
- `token` : Le JWT existant
- `user` : Données utilisateur lors de la connexion initiale
- `trigger` : Type d'événement ("signIn", "update", etc.)
- `session` : Nouvelles données de session lors d'une mise à jour

**Retour :** JWT mis à jour avec les nouvelles données

```typescript
// Exemple de flux
// 1. Connexion : user contient les données du backend
if (user) {
  return { ...token, ...user, accessToken: user.accessToken };
}

// 2. Mise à jour manuelle : session contient les nouvelles données
if (trigger === "update" && session) {
  return { ...token, accessToken: session.accessToken };
}

// 3. Vérification d'expiration
if (Date.now() >= token.accessTokenExpires) {
  return { ...token, error: "TokenExpired" };
}
```

### 2. `authOptions.callbacks.session()`

**Rôle :** Expose les données JWT dans la session client

**Paramètres :**
- `session` : Objet session à retourner
- `token` : JWT contenant les données

**Retour :** Session avec les données utilisateur exposées

```typescript
// Les données du JWT sont copiées dans session.user
session.user = {
  id: token.id,
  email: token.email,
  // ... autres données
};
session.accessToken = token.accessToken;
```

### 3. `useTokenRefresh()`

**Rôle :** Rafraîchit automatiquement le token avant expiration

**Algorithme :**
1. Surveille le temps d'expiration du token
2. Planifie un refresh 2 minutes avant expiration
3. Appelle `/auth/refresh` avec les cookies
4. Met à jour la session NextAuth avec le nouveau token

**Anti-Patterns évités :**
- ❌ Refresh server-side (les Set-Cookie n'atteignent pas le navigateur)
- ❌ Refresh réactif (attendre l'expiration avant de rafraîchir)
- ❌ Refresh concurrent (plusieurs refresh simultanés)

```typescript
// Planification du refresh
const timeUntilExpiry = expiresAt - Date.now();
const timeUntilRefresh = timeUntilExpiry - REFRESH_BUFFER_MS;

setTimeout(() => {
  refreshToken(); // Appel proactif
}, timeUntilRefresh);
```

### 4. `setApiAuthToken()`

**Rôle :** Synchronise le token entre NextAuth et Axios

**Avantages :**
- Évite d'appeler `getSession()` à chaque requête API
- Token toujours à jour via l'intercepteur
- Performance optimale (pas d'appel réseau supplémentaire)

```typescript
// Dans AuthContext
useEffect(() => {
  setApiAuthToken(accessToken); // Sync automatique
}, [accessToken]);

// Dans api.ts interceptor
api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});
```

### 5. `useAuthGuard()`

**Rôle :** Protège les routes nécessitant une authentification

**États gérés :**
- `loading` : Session en cours de chargement
- `unauthenticated` : Pas connecté → redirection
- `TokenExpired` : Token expiré → délai de grâce pour refresh
- `RefreshTokenError` : Refresh échoué → redirection immédiate

```typescript
// Utilisation dans une page protégée
export default function ProtectedPage() {
  const { isLoading, isReady } = useAuthGuard();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isReady) {
    return null; // Redirection en cours
  }

  return <PageContent />;
}
```

### 6. `AuthContext` Functions

#### `login(data)`
Connecte un utilisateur avec email/password

```typescript
await login({
  identifier: "user@example.com",
  password: "password123"
});
```

#### `register(data)`
Inscrit un nouvel utilisateur et le connecte automatiquement

```typescript
await register({
  name: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  password: "securepassword"
});
```

#### `logout()`
Déconnecte l'utilisateur et invalide le token côté backend

```typescript
await logout();
router.push("/signin");
```

#### `refreshSession()`
Force le rafraîchissement de la session (après mise à jour du profil)

```typescript
// Après modification du profil
await updateProfile(data);
await refreshSession(); // Recharge les données
```

---

## Gestion des Erreurs et Cas Particuliers

### 1. Erreur : Token Expiré

**Symptôme :** `session.error === "TokenExpired"`

**Cause :** Le token d'accès a expiré avant le refresh automatique

**Solution :** `useTokenRefresh` détecte automatiquement et rafraîchit

```typescript
// Dans useAuthGuard
if (session.error === "TokenExpired") {
  // Donner un délai de grâce pour le refresh
  setIsWaitingForRefresh(true);
  setTimeout(() => {
    // Si toujours expiré après 5s, rediriger
    router.replace("/signin");
  }, 5000);
}
```

### 2. Erreur : Refresh Token Invalide

**Symptôme :** Backend retourne 401 sur `/auth/refresh`

**Cause :** Refresh token expiré, révoqué, ou corrompu

**Solution :** Redirection immédiate vers signin

```typescript
if (error === "RefreshTokenError") {
  router.replace("/signin");
  return;
}
```

### 3. Cas : Rotation de Refresh Token

**Problème :** Chaque refresh invalide l'ancien refresh token

**Solution :** Utiliser `credentials: "include"` pour les cookies

```typescript
// Dans useTokenRefresh
const response = await fetch(`${BASE_URL}/auth/refresh`, {
  method: "POST",
  credentials: "include", // Envoie les cookies HttpOnly
  headers: {
    "Content-Type": "application/json",
  },
});
```

### 4. Cas : Cross-Origin Cookies

**Problème :** Cookies HttpOnly bloqués en cross-origin

**Solutions :**

```typescript
// Backend (FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,  // Important !
    allow_methods=["*"],
    allow_headers=["*"],
)

// Frontend (Next.js)
const response = await fetch(`${BASE_URL}/auth/refresh`, {
  credentials: "include", // Important !
});
```

### 5. Cas : Concurrent Refreshes

**Problème :** Multiples refresh simultanés créent des conflits

**Solution :** Utiliser un flag de refresh en cours

```typescript
// Dans useTokenRefresh
const isRefreshingRef = useRef<boolean>(false);

const refreshToken = async () => {
  if (isRefreshingRef.current) {
    console.log("Refresh already in progress, skipping");
    return false;
  }
  
  isRefreshingRef.current = true;
  try {
    // Refresh logic
  } finally {
    isRefreshingRef.current = false;
  }
};
```

### 6. Debugging : Console Logs

Pour déboguer les problèmes d'authentification :

```typescript
// Activer les logs détaillés
console.log("Session status:", status);
console.log("Token expires at:", new Date(expiresAt));
console.log("Time until expiry:", (expiresAt - Date.now()) / 1000, "seconds");
console.log("Refresh scheduled in:", timeUntilRefresh / 1000, "seconds");
```

### 7. Erreur : Session Non Synchronisée

**Symptôme :** `useAuth()` retourne des données périmées

**Cause :** Session NextAuth pas mise à jour après opération

**Solution :** Appeler `refreshSession()` manuellement

```typescript
// Après une opération qui modifie les données utilisateur
await updateEmail(newEmail);
await refreshSession(); // Force la resync
```

---

## Exemples d'Utilisation

### 1. Page de Connexion

```typescript
// src/app/(auth)/signin/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(formData);
      router.push("/dashboard"); // Rediriger après connexion
    } catch (err: any) {
      setError(err.message || "Connexion échouée");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Connexion</h1>
      
      {error && <div className="error">{error}</div>}

      <input
        type="email"
        placeholder="Email"
        value={formData.identifier}
        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
```

### 2. Page d'Inscription

```typescript
// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register(formData);
      router.push("/dashboard"); // Auto-login après inscription
    } catch (err: any) {
      setError(err.message || "Inscription échouée");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Inscription</h1>
      
      {error && <div className="error">{error}</div>}

      <input
        type="text"
        placeholder="Nom complet"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  );
}
```

### 3. Page Protégée

```typescript
// src/app/dashboard/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const { isLoading, isReady } = useAuthGuard();
  const { user } = useAuth();

  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Ne rien afficher pendant la redirection
  if (!isReady) {
    return null;
  }

  // Page protégée accessible seulement si authentifié
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenue, {user?.name} !</p>
      <p>Email: {user?.email}</p>
      <p>Rôle: {user?.role}</p>
    </div>
  );
}
```

### 4. Composant Header avec Déconnexion

```typescript
// src/components/Header.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <header>
        <nav>
          <a href="/signin">Connexion</a>
          <a href="/signup">Inscription</a>
        </nav>
      </header>
    );
  }

  return (
    <header>
      <nav>
        <span>Bonjour, {user?.name}</span>
        <a href="/dashboard">Dashboard</a>
        <a href="/profile">Profil</a>
        <button onClick={handleLogout}>Déconnexion</button>
      </nav>
    </header>
  );
}
```

### 5. Appel API Protégé

```typescript
// src/services/users.ts
import api from "@/lib/api";

// L'intercepteur ajoute automatiquement le token Authorization
export async function getUsers() {
  try {
    const response = await api.get("/admin/users");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
}

// Utilisation dans un composant
export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers(); // Token ajouté automatiquement
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchUsers();
  }, []);

  return <UsersList users={users} />;
}
```

### 6. Vérification d'Email

```typescript
// src/components/EmailVerification.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function EmailVerification() {
  const { sendVerificationEmail, verifyEmail, user } = useAuth();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    try {
      const result = await sendVerificationEmail();
      setMessage(result.message);
      setError("");
    } catch (err: any) {
      setError(err.message);
      setMessage("");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await verifyEmail(parseInt(code));
      setMessage(result.message);
      setError("");
    } catch (err: any) {
      setError(err.message);
      setMessage("");
    }
  };

  if (user?.isEmailVerified) {
    return <div>✅ Email vérifié</div>;
  }

  return (
    <div>
      <h2>Vérification d'Email</h2>
      
      <button onClick={handleSendCode}>
        Envoyer le code de vérification
      </button>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Code de vérification"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Vérifier</button>
      </form>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### 7. Protection par Rôle

```typescript
// src/hooks/useRoleGuard.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import useAuthGuard from "./useAuthGuard";

export default function useRoleGuard(allowedRoles: string[]) {
  const router = useRouter();
  const { isReady } = useAuthGuard(); // D'abord vérifier l'auth
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      console.log("Access denied: insufficient role");
      router.replace("/dashboard"); // Rediriger si rôle insuffisant
    }
  }, [isReady, isAuthenticated, user, allowedRoles, router]);

  return {
    isLoading: !isReady,
    hasAccess: user ? allowedRoles.includes(user.role) : false,
  };
}

// Utilisation dans une page admin
export default function AdminPage() {
  const { isLoading, hasAccess } = useRoleGuard(["ADMIN"]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasAccess) {
    return null; // Redirection en cours
  }

  return <AdminContent />;
}
```

---

## Conclusions et Liens Utiles

### Résumé de l'Architecture

Notre implémentation NextAuth offre :

✅ **Authentification Robuste** : JWT + Refresh Token Rotation  
✅ **Performance Optimale** : Token refresh proactif, intercepteurs Axios  
✅ **Sécurité Maximale** : HttpOnly cookies, rotation automatique  
✅ **Developer Experience** : Context API, hooks réutilisables, TypeScript  
✅ **Gestion d'Erreurs** : Délais de grâce, retry automatique  

### Points Clés à Retenir

1. **Refresh Client-Side Uniquement** : Backend utilise token rotation, donc refresh côté client pour que Set-Cookie atteigne le navigateur
2. **Intercepteur Axios** : Injection automatique du token sans appel à `getSession()`
3. **Protection de Routes** : Utiliser `useAuthGuard` pour toutes les pages protégées
4. **Synchronisation Session** : Appeler `refreshSession()` après modifications utilisateur

### Checklist de Déploiement

- [ ] Variables d'environnement configurées (NEXTAUTH_SECRET, NEXT_PUBLIC_API_URL)
- [ ] Backend CORS configuré avec `allow_credentials: true`
- [ ] Cookies HttpOnly activés sur le backend
- [ ] Domaines autorisés dans CORS
- [ ] HTTPS activé en production
- [ ] Token lifetimes alignés (backend et frontend)

### Ressources Officielles

- **NextAuth Documentation** : https://next-auth.js.org/
- **NextAuth GitHub** : https://github.com/nextauthjs/next-auth
- **NextAuth Examples** : https://next-auth.js.org/getting-started/example
- **JWT Best Practices** : https://datatracker.ietf.org/doc/html/rfc8725

### Ressources Complémentaires

- **Next.js App Router** : https://nextjs.org/docs/app
- **React Context API** : https://react.dev/reference/react/useContext
- **Axios Interceptors** : https://axios-http.com/docs/interceptors
- **TypeScript with NextAuth** : https://next-auth.js.org/getting-started/typescript

### Support et Communauté

- **NextAuth Discussions** : https://github.com/nextauthjs/next-auth/discussions
- **Stack Overflow** : Tag `next-auth`
- **Discord NextAuth** : https://discord.gg/nextauth

---

## Annexe : Diagramme de Flux d'Authentification

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUX D'AUTHENTIFICATION                      │
└─────────────────────────────────────────────────────────────────┘

1. CONNEXION INITIALE
   ┌──────────┐   credentials   ┌──────────┐   POST /auth/login   ┌──────────┐
   │  Client  │ ──────────────▶ │ NextAuth │ ──────────────────▶ │  Backend │
   └──────────┘                 └──────────┘                      └──────────┘
        │                            │                                  │
        │                            │◀─────────────────────────────────┤
        │                            │  { token, user, refreshToken }   │
        │                            │  (refreshToken via Set-Cookie)   │
        │                            │                                  │
        │◀───────────────────────────┤                                  │
        │  Session with accessToken  │                                  │


2. REQUÊTE API PROTÉGÉE
   ┌──────────┐   api.get(...)   ┌──────────────┐   GET /api/resource   ┌──────────┐
   │Component │ ───────────────▶ │Axios Intercept│ ──────────────────▶ │  Backend │
   └──────────┘                  │+ Authorization│                      └──────────┘
                                 └──────────────┘                            │
                                        │                                    │
                                        │◀───────────────────────────────────┤
                                        │          { data }                  │
                                        │                                    │


3. REFRESH TOKEN AUTOMATIQUE (Avant Expiration)
   ┌──────────────┐  Timer expires   ┌──────────────┐  POST /auth/refresh  ┌──────────┐
   │useTokenRefresh│ ───────────────▶ │   Backend    │◀──────────────────▶ │  Backend │
   └──────────────┘                   │ (fetch direct│  + cookies include   └──────────┘
          │                            │  avec cookies)│                           │
          │                            └──────────────┘                           │
          │                                   │                                   │
          │                                   │◀──────────────────────────────────┤
          │                                   │  { token, newRefreshToken }       │
          │                                   │  (nouveau refresh via Set-Cookie) │
          │                                   │                                   │
          │◀──────────────────────────────────┤                                   │
          │   update NextAuth session         │                                   │
          │   with new accessToken            │                                   │


4. DÉCONNEXION
   ┌──────────┐   logout()   ┌──────────┐   POST /auth/logout   ┌──────────┐
   │  Client  │ ───────────▶ │AuthContext│ ──────────────────▶ │  Backend │
   └──────────┘              └──────────┘                      └──────────┘
        │                         │                                  │
        │                         │   signOut()                      │
        │                         │ ──────────▶ NextAuth             │
        │                         │                                  │
        │◀────────────────────────┤                                  │
        │  Session cleared         │                                  │
        │  Redirect to /signin     │                                  │
```

---

**Version** : 1.0  
**Dernière Mise à Jour** : Janvier 2026  
**Auteur** : Documentation Technique 4Hacks Admin

---
