import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { BASE_URL } from "@/services/config";

// Access token lifetime (should match backend and auth-options.ts)
const ACCESS_TOKEN_LIFETIME_MS =  15 * 60 * 1000;

/**
 * This API route handles client-side token refresh.
 *
 * Why this exists:
 * - Backend uses refresh token rotation (new token on each refresh)
 * - Server-side refresh (in NextAuth JWT callback) can't forward Set-Cookie to browser
 * - This route runs client-side and properly forwards Set-Cookie headers
 *
 * Flow:
 * 1. Client calls this route with credentials: "include" (sends cookies)
 * 2. We forward cookies to backend /auth/refresh
 * 3. Backend validates refresh token cookie, returns new access token + new refresh token cookie
 * 4. We forward the Set-Cookie header back to the browser
 * 5. Client updates NextAuth session with new access token
 */
export async function POST(request: NextRequest) {
  try {
    // Note: We don't strictly check for a valid session here because
    // the token might be expired, which is why we're refreshing!
    // The backend will validate the refresh token cookie instead.
    
    // Optional: Log if we have a NextAuth session (for debugging)
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("Refresh route: Token status:", token ? "exists (possibly expired)" : "no session");

    // Forward all cookies from the browser request to the backend
    const cookieHeader = request.headers.get("cookie") || "";

    if (!cookieHeader) {
      console.log("Refresh route: No cookies in request");
      return NextResponse.json(
        { error: "No cookies present" },
        { status: 400 }
      );
    }

    console.log("Refresh route: Calling backend refresh endpoint...");
    console.log("Refresh route: Cookies being sent:", cookieHeader.substring(0, 100) + "...");

    // Call the backend refresh endpoint
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookieHeader, // Forward httpOnly cookies including refreshToken
      },
      credentials: "include",
    });

    // Try to parse response body
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Refresh route: Backend returned error:", response.status, data);
      console.error("Refresh route: Backend URL was:", `${BASE_URL}/auth/refresh`);
      return NextResponse.json(
        {
          error: data.message || "Refresh failed",
          details: data.error || null,
        },
        { status: response.status }
      );
    }

    console.log("Refresh route: Backend refresh successful");

    // Extract the new access token
    const newAccessToken = data.token || data.accessToken;

    if (!newAccessToken) {
      console.error("Refresh route: No access token in response");
      return NextResponse.json(
        { error: "No access token in refresh response" },
        { status: 500 }
      );
    }

    // Create the response with the new access token
    const nextResponse = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
    });

    // Forward ALL Set-Cookie headers from backend to browser
    // This is CRUCIAL for refresh token rotation to work!
    // The backend sends a new refresh token cookie, and we must forward it
    const setCookieHeaders = response.headers.getSetCookie();
    console.log(`Refresh route: Forwarding ${setCookieHeaders.length} Set-Cookie headers`);

    for (const cookie of setCookieHeaders) {
      nextResponse.headers.append("Set-Cookie", cookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("Refresh route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
