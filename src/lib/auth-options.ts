import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { BASE_URL } from "@/services/config";

// Token configuration
const ACCESS_TOKEN_LIFETIME =  15 * 60 * 1000; // 15 minutes in ms

// NOTE: no Server-side refresh because the backend uses refresh token rotation.
// When backend rotates tokens, the Set-Cookie header goes to Next.js server, not the browser (donc refresh token el jdid ithi3).
// All token refresh is handled client-side via /api/auth/refresh route and useTokenRefresh hook.

// Extend NextAuth types
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
    // Email/Password login - calls backend
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
            credentials: "include", // Important: receive and store cookies from backend
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

    // OAuth token provider - for when backend handles OAuth and returns a token
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
          // Validate token and get user data from backend
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
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
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

      // Handle session update (e.g., after profile update or after client-side refresh)
      if (trigger === "update" && session) {
        // If session contains new token data from client-side refresh, use it
        if (session.accessToken) {
          return {
            ...token,
            accessToken: session.accessToken,
            accessTokenExpires: session.accessTokenExpires || Date.now() + ACCESS_TOKEN_LIFETIME,
            error: undefined,
          };
        }
        // Otherwise just merge the user data
        return {
          ...token,
          ...session.user,
        };
      }

      // Check if token is expired
      // NOTE: We do NOT refresh server-side because backend uses token rotation
      // Client-side useTokenRefresh hook handles all refresh via /api/auth/refresh
      const expiresAt = token.accessTokenExpires;
      const isExpired = !expiresAt || typeof expiresAt !== "number" || Date.now() >= expiresAt;

      if (isExpired) {
        // Mark token as expired but don't try to refresh server-side
        // Client-side will handle refresh and call session.update() with new token
        return {
          ...token,
          error: "TokenExpired",
        };
      }

      // Token still valid
      return token;
    },

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
    async signOut({ token }) {
      // Call backend logout endpoint
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
    maxAge: 24 * 60 * 60, // 24 hours (pour le moment on ne se base pas sur ça pour rafraîchir le token)
  },

  secret: process.env.NEXTAUTH_SECRET,
};