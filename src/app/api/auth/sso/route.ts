//src/app/api/auth/sso/route.ts

import { handleSSOLogin } from "@/lib/auth";
import { createToken } from "@/lib/tokens";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Extract the JWT token from the query parameters.
    const { jwt: jwtToken } = await request.json();

    if (!jwtToken) {
      return NextResponse.json(
        { error: "Token JWT no proporcionado" },
        { status: 400 }
      );
    }

    // Handle SSO login/registration.
    const userPayload = await handleSSOLogin(jwtToken);

    // Create a new token for our app (internal token).
    const token = await createToken(userPayload);

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Redirect the user to the dashboard (or wherever is appropriate).
    const redirectURL = new URL("/v1", request.url); // Use the request URL to get the base origin
    return NextResponse.redirect(redirectURL.toString());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("SSO login error:", error);
    //  return an error, perhaps redirect to a login failure page.
    const errorRedirectURL = new URL("/login?sso_error=true", request.url);
    return NextResponse.redirect(errorRedirectURL.toString());
  }
}
