import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { seal } from "@/lib/secure-cookie";

import { toBase64Url } from "@/lib/base64url";

export async function POST(req: Request) {
  const { userId } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.passkeyCredential.findMany({
    where: { userId },
    select: { credentialId: true },
  });

  const rpID = process.env.RP_ID!;
  const rpName = "profileSite";
  const origin = process.env.APP_ORIGIN!;

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(String(user.id)),
    userName: user.email,
    userDisplayName: user.name ?? user.email,
    attestationType: "none",
    excludeCredentials: existing.map((c) => ({
      id: toBase64Url(c.credentialId),
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  // challenge를 쿠키에 잠깐 저장(5분)
  const token = await seal({ challenge: options.challenge, userId, origin, rpID }, 300);
  (await cookies()).set("webauthn_reg", token, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  return NextResponse.json(options);
}
