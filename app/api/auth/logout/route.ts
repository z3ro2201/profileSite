import { NextResponse } from "next/server";
import { authCookieOptions } from "@/lib/auth/cookies";

export async function POST() {
  const { name, options } = authCookieOptions();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, "", { ...options, maxAge: 0 });
  return res;
}
