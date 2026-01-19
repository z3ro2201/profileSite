import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";

export async function GET() {
  const token = (await cookies()).get(getAuthCookieName())?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });

  try {
    const payload = await verifyAuthToken(token);
    return NextResponse.json({
      authenticated: true,
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
