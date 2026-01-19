import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const passkeyId = parseInt(id, 10);

    if (isNaN(passkeyId)) {
      return NextResponse.json({ error: "Invalid passkey ID" }, { status: 400 });
    }

    // 본인 소유인지 확인
    const passkey = await prisma.passkeyCredential.findFirst({
      where: {
        id: passkeyId,
        userId: userId,
      },
    });

    if (!passkey) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
    }

    // 삭제
    await prisma.passkeyCredential.delete({
      where: { id: passkeyId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete passkey:", error);
    return NextResponse.json({ error: "Failed to delete passkey" }, { status: 500 });
  }
}
