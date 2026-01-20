// app/api/admin/auth/otp/disable/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  if (!userId) return NextResponse.json({ error: "INVALID_USER_ID" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        totpEnabled: false,
        totpSecretEnc: null,
        totpConfirmedAt: null,
      },
    }),
    prisma.userRecoveryCode.deleteMany({ where: { userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
