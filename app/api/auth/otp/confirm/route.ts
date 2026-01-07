import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/otp-crypto";

export async function POST(req: Request) {
  const { userId, token } = await req.json(); // token: 6자리

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.totpSecretEnc) return NextResponse.json({ error: "OTP not setup" }, { status: 400 });

  const secret = decrypt(user.totpSecretEnc);

  const ok = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!ok) return NextResponse.json({ error: "잘못된 코드" }, { status: 400 });

  await prisma.user.update({
    where: { id: userId },
    data: { totpEnabled: true, totpConfirmedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
