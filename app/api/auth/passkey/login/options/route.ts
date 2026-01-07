import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { seal } from "@/lib/secure-cookie";

import { toBase64Url } from "@/lib/base64url";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "사용자를 찾을 수 없어요" }, { status: 404 });

  const creds = await prisma.passkeyCredential.findMany({
    where: { userId: user.id },
    select: { credentialId: true },
  });

  const rpID = process.env.RP_ID!;
  const origin = process.env.APP_ORIGIN!;

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: creds.map((c) => ({
      id: toBase64Url(c.credentialId),
    })),
    userVerification: "preferred",
  });

  const token = await seal({ challenge: options.challenge, userId: user.id, origin, rpID }, 300);
  (await cookies()).set("webauthn_auth", token, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  return NextResponse.json(options);
}
