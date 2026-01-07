import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";
import { prisma } from "@/lib/prisma";
import { unseal } from "@/lib/secure-cookie";
import { toBase64Url, fromBase64Url } from "@/lib/base64url";

import { signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  const body = (await req.json()) as AuthenticationResponseJSON;

  const cookieStore = await cookies();
  const token = cookieStore.get("webauthn_auth")?.value;
  if (!token) return NextResponse.json({ error: "잘못된 정보입니다." }, { status: 400 });

  const saved = await unseal<{ challenge: string; userId: number; origin: string; rpID: string }>(token);
  if (!saved) return NextResponse.json({ error: "잘못되거나 종료되었습니다." }, { status: 400 });

  // body.id 는 base64url 문자열(credential id)
  const credBytes = fromBase64Url(body.id);

  const credential = await prisma.passkeyCredential.findFirst({
    where: {
      userId: saved.userId,
      credentialId: Buffer.from(credBytes),
    },
  });

  if (!credential) return NextResponse.json({ error: "정보를 찾을 수 없습니다." }, { status: 404 });

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: saved.challenge,
    expectedOrigin: saved.origin,
    expectedRPID: saved.rpID,

    // ✅ 최신 버전: authenticator 대신 credential 사용
    credential: {
      id: toBase64Url(credential.credentialId),
      publicKey: credential.publicKey,
      counter: credential.counter,
    },
  });

  if (!verification.verified) return NextResponse.json({ error: "인증할 수 없습니다." }, { status: 400 });

  // counter 업데이트(리플레이 방지)
  await prisma.passkeyCredential.update({
    where: { id: credential.id },
    data: { counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() },
  });

  cookieStore.delete("webauthn_auth");

  // TODO: 여기서 세션 발급 (JWT/세션쿠키 등)
  // return NextResponse.json({ ok: true, userId: saved.userId });

  const user = await prisma.user.findUnique({
    where: { id: saved.userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });

  const jwt = await signAuthToken({ sub: String(user.id), email: user.email, name: user.name });
  const { name, options } = authCookieOptions();

  const res = NextResponse.json({ ok: true, userId: user.id });
  res.cookies.set(name, jwt, options);
  return res;
}
