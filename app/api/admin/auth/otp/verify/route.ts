// app/api/admin/auth/otp/verify/route.ts
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/otp-crypto";
import { signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";

type Body = {
  userId?: string | number;
  token?: string;
};

const toIntId = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
};

const isSixDigits = (v: string) => /^[0-9]{6}$/.test(v);

export async function POST(req: Request) {
  let body: Body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const userId = toIntId(body.userId);
  if (!userId) {
    return NextResponse.json({ error: "INVALID_USER_ID" }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  if (!isSixDigits(token)) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      totpEnabled: true,
      totpSecretEnc: true,
    },
  });

  if (!user?.totpEnabled || !user.totpSecretEnc) {
    return NextResponse.json({ error: "OTP를 활성화 해주세요." }, { status: 400 });
  }

  let secret: string;
  try {
    secret = decrypt(user.totpSecretEnc);
  } catch {
    return NextResponse.json({ error: "SECRET_DECRYPT_FAIL" }, { status: 500 });
  }

  const ok = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!ok) {
    return NextResponse.json({ error: "유효하지 않은 코드에요" }, { status: 400 });
  }

  // ✅ JWT 쿠키 발급
  const jwt = await signAuthToken({
    sub: String(user.id), // Int라도 JWT sub는 string이 안전
    email: user.email,
    name: user.name,
  });

  const { name, options } = authCookieOptions();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, jwt, options);
  return res;
}
