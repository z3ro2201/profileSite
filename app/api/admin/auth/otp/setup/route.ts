// app/api/admin/auth/otp/setup/route.ts
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/otp-crypto";

type Body = {
  userId?: string | number;
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
  if (!userId) {
    return NextResponse.json({ error: "INVALID_USER_ID" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, totpEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없어요." }, { status: 404 });
  }

  // 정책: 이미 enabled면 setup 막기 (원하면 409 대신 재설정 플로우로 분리)
  if (user.totpEnabled) {
    return NextResponse.json({ error: "ALREADY_ENABLED" }, { status: 409 });
  }

  const issuer = "profileSite";
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `${issuer} (${user.email})`,
    issuer,
  });

  if (!secret.otpauth_url) {
    return NextResponse.json({ error: "OTP_URL_FAIL" }, { status: 500 });
  }

  const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

  await prisma.user.update({
    where: { id: userId },
    data: {
      totpEnabled: false,
      totpSecretEnc: encrypt(secret.base32),
      totpConfirmedAt: null,
    },
  });

  // ✅ 보안상 base32는 내려주지 않는 걸 권장
  return NextResponse.json({ qrDataUrl });
}
