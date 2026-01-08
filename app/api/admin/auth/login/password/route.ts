import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "이메일 혹은 비밀번호가 입력되지 않았습니다." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true, totpEnabled: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "유효하지 않은 정보입니다." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "비밀번호를 확인해주세요." }, { status: 401 });

    // OTP 켜져 있으면 2단계로
    if (user.totpEnabled) {
      return NextResponse.json({ ok: false, requiresOtp: true, userId: user.id });
    }

    // ✅ OTP 필요 없으면 여기서 JWT 쿠키 발급
    const jwt = await signAuthToken({ sub: String(user.id), email: user.email, name: user.name });
    const { name, options } = authCookieOptions();

    const res = NextResponse.json({ ok: true });
    res.cookies.set(name, jwt, options);
    return res;
  } catch {
    return NextResponse.json({ error: "서버 오류입니다." }, { status: 500 });
  }
}
