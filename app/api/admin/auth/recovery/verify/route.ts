// app/api/admin/auth/recovery/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashRecoveryCode, normalizeRecoveryCode } from "@/lib/recovery-codes";
import { signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";

type Body = {
  userId?: string | number;
  code?: string;
};

const toIntId = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const userId = toIntId(body.userId);
  if (!userId) return NextResponse.json({ error: "INVALID_USER_ID" }, { status: 400 });

  const code = normalizeRecoveryCode(body.code ?? "");
  if (!code) return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, totpEnabled: true },
  });

  if (!user?.totpEnabled) {
    return NextResponse.json({ error: "OTP_NOT_ENABLED" }, { status: 400 });
  }

  const h = hashRecoveryCode(code);

  const row = await prisma.userRecoveryCode.findFirst({
    where: { userId, codeHash: h, usedAt: null },
    select: { id: true },
  });

  if (!row) {
    return NextResponse.json({ error: "INVALID_RECOVERY_CODE" }, { status: 400 });
  }

  // ✅ 소진 처리
  await prisma.userRecoveryCode.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });

  // ✅ 로그인(JWT 쿠키)
  const jwt = await signAuthToken({
    sub: String(user.id),
    email: user.email,
    name: user.name,
  });

  const { name, options } = authCookieOptions();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, jwt, options);
  return res;
}
