import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

function validateName(raw: unknown) {
  if (typeof raw !== "string") return { ok: false as const, code: "INVALID_NAME_TYPE" as const };

  const name = raw.trim();

  // name이 nullable이라 "빈 문자열이면 null로 저장" 같은 정책도 가능
  // 여기서는 최소 2자~20자만 허용
  if (name.length < 2 || name.length > 20) return { ok: false as const, code: "INVALID_NAME_LENGTH" as const };

  // 최소 필터 (원하면 제거/강화)
  if (/[<>]/.test(name)) return { ok: false as const, code: "INVALID_NAME_CHARS" as const };

  return { ok: true as const, name };
}

export async function GET() {
  const token = (await cookies()).get(getAuthCookieName())?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });

  try {
    const payload = await verifyAuthToken(token);

    const userId = Number(payload.sub);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!me) return NextResponse.json({ authenticated: false }, { status: 200 });

    return NextResponse.json({
      authenticated: true,
      userId: me.id,
      email: me.email,
      name: me.name,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = (await cookies()).get(getAuthCookieName())?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });

  try {
    const payload = await verifyAuthToken(token);

    // ✅ Prisma User.id 가 Int 이므로 숫자 변환
    const userId = Number(payload.sub);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const body = await req.json().catch(() => ({}));
    const v = validateName((body as any)?.name);
    if (!v.ok) {
      return NextResponse.json({ ok: false, code: v.code }, { status: 400 });
    }

    // (선택) 같은 이름이면 DB update 생략하고 그대로 반환
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!current) return NextResponse.json({ authenticated: false }, { status: 200 });

    if ((current.name ?? "") === v.name) {
      return NextResponse.json({
        ok: true,
        authenticated: true,
        userId: current.id,
        email: current.email,
        name: current.name,
        unchanged: true,
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: v.name },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({
      ok: true,
      authenticated: true,
      userId: updated.id,
      email: updated.email,
      name: updated.name,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
