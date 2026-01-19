import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";

export async function GET() {
  try {
    // 인증 확인
    const token = (await cookies()).get(getAuthCookieName())?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);

    // 🔄 sub 안전하게 처리
    if (!payload.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = parseInt(payload.sub, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 401 });
    }

    // Passkey 목록 조회
    const passkeys = await prisma.passkeyCredential.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ passkeys });
  } catch (error) {
    console.error("Failed to fetch passkeys:", error);
    return NextResponse.json({ error: "Failed to fetch passkeys" }, { status: 500 });
  }
}
