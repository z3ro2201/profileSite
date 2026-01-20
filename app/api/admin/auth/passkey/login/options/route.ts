// app/api/admin/auth/passkey/login/options/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { seal } from "@/lib/secure-cookie";

type SavedAuth = {
  challenge: string;
  origin: string;
  rpID: string;
};

export async function POST() {
  try {
    const rpID = process.env.RP_ID;
    const origin = process.env.APP_ORIGIN;

    if (!rpID || !origin) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "required",
      timeout: 300000,
      // ✅ username-less 핵심: allowCredentials를 넣지 않음
    });

    const token = await seal({ challenge: options.challenge, origin, rpID }, 300);
    const cookieStore = await cookies();
    cookieStore.set("webauthn_auth", token, {
      httpOnly: true,
      secure: origin.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      maxAge: 300,
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Passkey login options error:", error);
    return NextResponse.json({ error: "Failed to generate authentication options" }, { status: 500 });
  }
}
