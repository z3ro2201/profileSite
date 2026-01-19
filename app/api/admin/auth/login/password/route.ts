import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json({ error: "이메일 혹은 비밀번호가 입력되지 않았습니다." }, { status: 400 });
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }, // 🆕 이메일 정규화
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        totpEnabled: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "유효하지 않은 정보입니다." }, { status: 401 });
    }

    // 비밀번호 검증
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "비밀번호를 확인해주세요." }, { status: 401 });
    }

    // OTP 활성화 시 2단계 인증 요구
    if (user.totpEnabled) {
      return NextResponse.json({
        ok: false,
        requiresOtp: true,
        userId: user.id,
      });
    }

    // JWT 쿠키 발급
    const jwt = await signAuthToken({
      sub: String(user.id),
      email: user.email,
      name: user.name,
    });

    const { name, options } = authCookieOptions();

    const res = NextResponse.json({ ok: true });
    res.cookies.set(name, jwt, options);

    return res;
  } catch (error) {
    console.error("Login error:", error); // 🆕 에러 로깅
    return NextResponse.json({ error: "서버 오류입니다." }, { status: 500 });
  }
}
