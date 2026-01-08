import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/otp-crypto";

export async function POST(req: Request) {
  const { userId } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "사용자를 찾을 수 없어요." }, { status: 404 });

  const secret = speakeasy.generateSecret({
    name: `profileSite (${user.email})`,
  });

  const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

  await prisma.user.update({
    where: { id: userId },
    data: {
      totpEnabled: false,
      totpSecretEnc: encrypt(secret.base32),
      totpConfirmedAt: null,
    },
  });

  return NextResponse.json({
    qrDataUrl,
    base32: secret.base32, // 필요 없으면 프론트에 안 내려도 됨
  });
}
