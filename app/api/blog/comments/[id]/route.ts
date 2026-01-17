// app/api/blog/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/server";
import crypto from "node:crypto";

type Context = {
  params: Promise<{ id: string }>;
};

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function looksLikeBcryptHash(v: string) {
  return v.startsWith("$2a$") || v.startsWith("$2b$") || v.startsWith("$2y$");
}

function looksLikeSha256Hex(v: string) {
  return /^[a-f0-9]{64}$/i.test(v);
}

async function verifyPassword(inputPassword: string, stored: string): Promise<boolean> {
  // 1) bcrypt hash ($2b$...)
  if (looksLikeBcryptHash(stored)) {
    // bcryptjs가 설치돼 있으면 사용 (없으면 아래로 넘어감)
    try {
      const bcrypt = await import("bcryptjs");
      return await bcrypt.compare(inputPassword, stored);
    } catch {
      // bcryptjs 미설치/불가 -> false 처리 (또는 sha256/평문 쪽으로 이어지게)
      return false;
    }
  }

  // 2) sha256 hex (단순 sha256(password) 저장한 경우)
  if (looksLikeSha256Hex(stored)) {
    const hashed = crypto.createHash("sha256").update(inputPassword).digest("hex");
    return hashed.toLowerCase() === stored.toLowerCase();
  }

  // 3) plain text 저장(비추천이지만 호환)
  return inputPassword === stored;
}

function pickStoredPassword(comment: any): string | null {
  const candidates = ["deletePasswordHash", "deletePassword", "passwordHash", "password_hash", "password"];

  for (const key of candidates) {
    const v = comment?.[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

// DELETE - 댓글 삭제
// - 관리자: requireAdmin() 통과하면 즉시 soft delete
// - 일반 사용자: body.password 로 검증 후 soft delete
export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const commentId = Number(id);

    if (!Number.isFinite(commentId) || commentId < 1) {
      return bad("Invalid comment id");
    }

    // 1) 관리자면 바로 삭제
    try {
      await requireAdmin();

      await prisma.comment.update({
        where: { id: commentId },
        data: { isDeleted: true },
      });

      return NextResponse.json({ ok: true });
    } catch (e: any) {
      // 관리자가 아니면 일반 사용자 플로우로 진행
      if (e?.message !== "Unauthorized") {
        // admin 체크 과정에서 다른 에러면 그대로 반환
        console.error("❌ requireAdmin error:", e);
        return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
      }
    }

    // 2) 일반 사용자: password 필요
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      body = null;
    }

    const password = (body?.password ?? "").toString();
    if (!password) {
      return bad("Password required", 400);
    }

    // 댓글 조회 (필드명은 프로젝트마다 달라서 any로 동적 접근)
    const commentAny = (await prisma.comment.findUnique({
      where: { id: commentId },
    })) as any;

    if (!commentAny) {
      return bad("Comment not found", 404);
    }

    // 이미 삭제된 댓글이면 ok 처리(멱등)
    if (commentAny?.isDeleted === true) {
      return NextResponse.json({ ok: true });
    }

    const stored = pickStoredPassword(commentAny);
    if (!stored) {
      // DB에 비밀번호가 저장돼있지 않으면 일반 사용자 삭제 불가
      return NextResponse.json({ ok: false, message: "Password is not set for this comment" }, { status: 403 });
    }

    const ok = await verifyPassword(password, stored);
    if (!ok) {
      return NextResponse.json({ ok: false, message: "Invalid password" }, { status: 403 });
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("❌ Delete comment error:", error);
    return NextResponse.json({ ok: false, message: error?.message || "Failed to delete comment" }, { status: 500 });
  }
}
