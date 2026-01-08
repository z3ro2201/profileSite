import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/otp-crypto";
import { signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  const { userId, token } = await req.json();

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

  const secret = decrypt(user.totpSecretEnc);

  const ok = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!ok) return NextResponse.json({ error: "유효하지 않은 코드에요" }, { status: 400 });

  // ✅ JWT 쿠키 발급
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
