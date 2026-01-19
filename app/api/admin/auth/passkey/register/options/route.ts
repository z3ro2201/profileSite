// app/api/admin/auth/passkey/register/options/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { seal } from "@/lib/secure-cookie";
import { toBase64Url } from "@/lib/base64url";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId || typeof userId !== "number") {
      return NextResponse.json({ error: "userId is required and must be a number" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.passkeyCredential.findMany({
      where: { userId },
      select: { credentialId: true },
    });

    const rpID = process.env.RP_ID;
    const rpName = process.env.RP_NAME || "profileSite";
    const origin = process.env.APP_ORIGIN;

    if (!rpID || !origin) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(String(user.id)),
      userName: user.email,
      userDisplayName: user.name ?? user.email,
      attestationType: "none",
      excludeCredentials: existing.map((c) => ({
        id: toBase64Url(c.credentialId),
        type: "public-key",
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    const token = await seal({ challenge: options.challenge, userId, origin, rpID }, 300);

    const cookieStore = await cookies();
    cookieStore.set("webauthn_reg", token, {
      httpOnly: true,
      secure: origin.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      maxAge: 300,
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Passkey registration options error:", error);
    return NextResponse.json({ error: "Failed to generate registration options" }, { status: 500 });
  }
}
