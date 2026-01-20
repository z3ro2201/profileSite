// app/api/admin/auth/passkey/login/verify/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { prisma } from "@/lib/prisma";
import { unseal } from "@/lib/secure-cookie";
import { signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";

type SavedAuth = {
  challenge: string;
  origin: string;
  rpID: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AuthenticationResponseJSON;

    const cookieStore = await cookies();
    const token = cookieStore.get("webauthn_auth")?.value;
    if (!token) return NextResponse.json({ error: "잘못된 정보입니다." }, { status: 400 });

    const saved = await unseal<SavedAuth>(token);
    if (!saved) return NextResponse.json({ error: "잘못되거나 종료되었습니다." }, { status: 400 });

    // ✅ credentialId 매칭 안정화: simplewebauthn helper 사용
    const credBuf = isoBase64URL.toBuffer(body.id);

    const credential = await prisma.passkeyCredential.findFirst({
      where: { credentialId: credBuf },
      select: { id: true, userId: true, credentialId: true, publicKey: true, counter: true },
    });

    if (!credential) {
      return NextResponse.json({ error: "정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: saved.challenge,
      expectedOrigin: saved.origin,
      expectedRPID: saved.rpID,
      credential: {
        id: isoBase64URL.fromBuffer(Buffer.from(credential.credentialId)),
        publicKey: credential.publicKey,
        counter: credential.counter,
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "인증할 수 없습니다." }, { status: 400 });
    }

    await prisma.passkeyCredential.update({
      where: { id: credential.id },
      data: { counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: { id: credential.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });

    const jwt = await signAuthToken({
      sub: String(user.id),
      email: user.email,
      name: user.name,
    });

    const { name: cookieName, options } = authCookieOptions();

    cookieStore.delete("webauthn_auth");

    const res = NextResponse.json({ ok: true, userId: user.id });
    res.cookies.set(cookieName, jwt, options);
    return res;
  } catch (error) {
    console.error("Passkey login verification error:", error);
    return NextResponse.json({ error: "인증 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
