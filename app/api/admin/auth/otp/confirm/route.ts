// app/api/admin/auth/otp/confirm/route.ts
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/otp-crypto";
import { generateRecoveryCodes, hashRecoveryCode } from "@/lib/recovery-codes";

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
  if (!userId) return NextResponse.json({ error: "INVALID_USER_ID" }, { status: 400 });

  const token = (body.token ?? "").trim();
  if (!isSixDigits(token)) return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, totpEnabled: true, totpSecretEnc: true },
  });

  if (!user?.totpSecretEnc) {
    return NextResponse.json({ error: "OTP_NOT_SETUP" }, { status: 400 });
  }

  // 이미 활성화: 복구코드는 재발급하지 않고 상태만 응답(원하면 재발급 정책으로 변경 가능)
  if (user.totpEnabled) {
    return NextResponse.json({ ok: true, alreadyEnabled: true });
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

  if (!ok) return NextResponse.json({ error: "OTP_INVALID" }, { status: 400 });

  // ✅ 복구코드 발급(10개)
  const recoveryCodes = generateRecoveryCodes(10);
  const hashed = recoveryCodes.map((c) => ({
    userId,
    codeHash: hashRecoveryCode(c),
  }));

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: true, totpConfirmedAt: new Date() },
    }),
    // 정책: 기존 코드 전부 폐기 후 새로 발급 (안전/단순)
    prisma.userRecoveryCode.deleteMany({ where: { userId } }),
    prisma.userRecoveryCode.createMany({ data: hashed }),
  ]);

  // ✅ 원문은 “이번 1회”만 내려줌
  return NextResponse.json({ ok: true, recoveryCodes });
}
