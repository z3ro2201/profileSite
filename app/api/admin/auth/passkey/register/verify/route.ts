// app/api/admin/auth/passkey/register/verify/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { unseal } from "@/lib/secure-cookie";

type SavedReg = {
  challenge: string;
  userId: number;
  origin: string;
  rpID: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegistrationResponseJSON;

    const cookieStore = await cookies();
    const token = cookieStore.get("webauthn_reg")?.value;
    if (!token) return NextResponse.json({ error: "잘못된 정보" }, { status: 400 });

    const saved = await unseal<SavedReg>(token);
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

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    const transports = body.response?.transports;

    await prisma.passkeyCredential.create({
      data: {
        userId: saved.userId,
        credentialId: Buffer.from(credential.id),
        publicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        name: "Passkey",
        transports: transports?.length ? JSON.stringify(transports) : null,
        deviceType: credentialDeviceType ?? null,
        backedUp: typeof credentialBackedUp === "boolean" ? credentialBackedUp : null,
      },
    });

    cookieStore.delete("webauthn_reg");
    return NextResponse.json({ ok: true, deviceType: credentialDeviceType, backedUp: credentialBackedUp });
  } catch (error) {
    console.error("Passkey register verify error:", error);
    return NextResponse.json({ error: "등록 처리 중 오류" }, { status: 500 });
  }
}
