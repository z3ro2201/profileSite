import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";

const BCRYPT_COST = 12; // OWASP: bcrypt는 cost 10+ 권장 :contentReference[oaicite:2]{index=2}

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

function validatePasswords(body: any) {
  const currentPassword = String(body?.currentPassword ?? "");
  const newPassword = String(body?.newPassword ?? "");
  const newPasswordConfirm = String(body?.newPasswordConfirm ?? "");

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return { ok: false as const, code: "MISSING_FIELDS" as const };
  }
  if (newPassword !== newPasswordConfirm) {
    return { ok: false as const, code: "PASSWORD_MISMATCH" as const };
  }
  if (newPassword.length < 8 || newPassword.length > 72) {
    // bcrypt는 입력 길이에 사실상 제한(72 bytes 이슈) 고려 권장 :contentReference[oaicite:3]{index=3}
    return { ok: false as const, code: "WEAK_PASSWORD" as const };
  }
  if (newPassword === currentPassword) {
    return { ok: false as const, code: "PASSWORD_SAME_AS_OLD" as const };
  }

  return { ok: true as const, currentPassword, newPassword };
}

export async function PATCH(req: NextRequest) {
  const token = (await cookies()).get(getAuthCookieName())?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });

  try {
    const payload = await verifyAuthToken(token);
    const userId = Number(payload.sub);

    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const body = await req.json().catch(() => ({}));
    const v = validatePasswords(body);
    if (!v.ok) return json(400, { ok: false, code: v.code });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) return NextResponse.json({ authenticated: false }, { status: 200 });

    // 비번이 아예 없는 계정(패스키-only 등)일 수 있음
    if (!user.passwordHash) {
      return json(400, { ok: false, code: "NO_PASSWORD_SET" });
    }

    const ok = await bcrypt.compare(v.currentPassword, user.passwordHash);
    if (!ok) return json(400, { ok: false, code: "INVALID_CURRENT_PASSWORD" });

    const newHash = await bcrypt.hash(v.newPassword, BCRYPT_COST);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
      select: { id: true },
    });

    // ✅ (권장) 여기서 “세션/리프레시 토큰 무효화” 정책이 있으면 적용
    // 지금 구조에선 쿠키 JWT 재발급/로그아웃 처리 여부를 너 정책대로 추가하면 됨.

    return NextResponse.json({ ok: true, authenticated: true }, { status: 200 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
