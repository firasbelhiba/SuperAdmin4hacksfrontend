import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "@/services/config";

/**
 * This API route handles login and properly forwards Set-Cookie headers
 * from the backend to the browser.
 * 
 * The problem:
 * - NextAuth's authorize() function doesn't forward Set-Cookie headers
 * - Backend sends refresh token as an httpOnly cookie
 * - Without forwarding, the browser never receives the refresh token cookie
 * 
 * Solution:
 * - Client calls this route instead of NextAuth directly
 * - We call backend /auth/login
 * - We forward the Set-Cookie header (refresh token) to the browser
 * - We return the access token to the client
 * - Client then calls NextAuth signIn with the access token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Login route: Calling backend login endpoint...");

    // Call backend login endpoint
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Login route: Backend returned error:", response.status, data);
      return NextResponse.json(
        {
          error: data.message || "Invalid credentials",
          details: data.error || null,
        },
        { status: response.status }
      );
    }

    console.log("Login route: Backend login successful");

    // Create response with user and token data
    const nextResponse = NextResponse.json({
      success: true,
      token: data.token,
      user: data.user,
    });

    // Forward ALL Set-Cookie headers from backend to browser
    // This is CRUCIAL for the refresh token cookie!
    const setCookieHeaders = response.headers.getSetCookie();
    console.log(`Login route: Forwarding ${setCookieHeaders.length} Set-Cookie headers`);

    for (const cookie of setCookieHeaders) {
      nextResponse.headers.append("Set-Cookie", cookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
