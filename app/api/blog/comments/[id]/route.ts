// app/api/blog/comments/[commentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/server";

type Context = {
  params: { commentId: string };
};

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

// DELETE - 댓글 삭제 (관리자 전용) : soft delete
export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    await requireAdmin();

    const id = Number(params.commentId);
    if (!Number.isFinite(id) || id < 1) {
      return bad("Invalid comment id");
    }

    await prisma.comment.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 403 });
    }

    console.error("❌ Delete comment error:", error);
    return NextResponse.json({ ok: false, message: error?.message || "Failed to delete comment" }, { status: 500 });
  }
}
