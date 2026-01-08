import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import { prisma } from "@/lib/prisma";
import { unseal } from "@/lib/secure-cookie";

export async function POST(req: Request) {
  const body = (await req.json()) as RegistrationResponseJSON;

  const cookieStore = await cookies();
  const token = cookieStore.get("webauthn_reg")?.value;
  if (!token) return NextResponse.json({ error: "잘못된 정보" }, { status: 400 });

  const saved = await unseal<{
    challenge: string;
    userId: number;
    origin: string;
    rpID: string;
  }>(token);

  if (!saved) return NextResponse.json({ error: "유효하지 않습니다." }, { status: 400 });

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: saved.challenge,
    expectedOrigin: saved.origin,
    expectedRPID: saved.rpID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "등록할 수 없습니다." }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;

  const credentialID = credential.id;
  const credentialPublicKey = credential.publicKey;
  const counter = credential.counter;

  const transports = body.response?.transports; // string[] | undefined

  await prisma.passkeyCredential.create({
    data: {
      userId: saved.userId,
      credentialId: Buffer.from(credentialID), // Uint8Array -> Bytes
      publicKey: Buffer.from(credentialPublicKey), // Uint8Array -> Bytes
      counter,
      name: transports?.length ? "Passkey" : null,
      transports: transports?.length ? JSON.stringify(transports) : null,
    },
  });

  cookieStore.delete("webauthn_reg");
  return NextResponse.json({ ok: true });
}
