import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js 16 Proxy (replaces middleware.ts)
 *
 * IMPORTANT: This proxy is for UX/routing ONLY, not primary security.
 * Following Next.js 16 best practices:
 * - Keep proxy lightweight for high-level traffic control
 * - Move detailed auth validation to Server Components/Actions
 *
 * Primary auth is handled by:
 * - NextAuth session management
 * - useAuthGuard hook (client-side)
 * - API route protection
 *
 * This proxy provides:
 * - Faster redirect to signin for unauthenticated users (better UX)
 * - Redirect authenticated users away from auth pages
 */

// Routes that don't require authentication
const publicRoutes = [
  "/signin",
  "/signup",
  "/reset-password",
  "/resetpassword",
  "/forgot-password",
  "/verify-email",
  "/api/auth", // NextAuth API routes AND OAuth callback page
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/signin", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle OAuth callback: backend redirects to /?token=... instead of /api/auth/callback?token=...
  // Redirect to the proper callback page to process the token
  const oauthToken = searchParams.get("token");
  if (oauthToken && pathname === "/") {
    const callbackUrl = new URL("/api/auth/callback", request.url);
    callbackUrl.searchParams.set("token", oauthToken);
    return NextResponse.redirect(callbackUrl);
  }

  // Skip proxy for static files and internal Next.js routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api/auth") || // Let NextAuth handle its own routes + OAuth callback
    pathname.includes(".") // Static files like .ico, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if this is an auth route (signin, signup)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get the NextAuth token (lightweight check for session existence)
  // Note: This only checks for token existence, not detailed validation
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Consider user authenticated if they have a token
  // Detailed validation happens in useAuthGuard and API routes
  const hasSession = !!token;

  // If user has a session and is trying to access auth routes, redirect to dashboard
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no session and route is protected, redirect to signin
  // Note: This is for UX only - actual auth is enforced by useAuthGuard and API routes
  if (!hasSession) {
    const signInUrl = new URL("/signin", request.url);
    // Store the original URL to redirect back after login
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api/auth (NextAuth routes - let them handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/auth).*)",
  ],
};
