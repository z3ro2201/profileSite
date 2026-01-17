// app/api/blog/comments/[commentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/server";

type Params = {
  params: Promise<{ commentId: string }>;
};

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

// DELETE - 댓글 삭제 (관리자 전용)
export async function DELETE(req: NextRequest, context: Params) {
  try {
    await requireAdmin();
    console.log("✅ Admin verified");

    const resolvedParams = await context.params;
    const commentId = resolvedParams.commentId;

    if (!commentId) {
      const url = new URL(req.url);
      const pathParts = url.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];

      const id = parseInt(lastPart, 10);

      if (isNaN(id) || id < 1) {
        return bad("Invalid comment id");
      }

      await prisma.comment.update({
        where: { id },
        data: { isDeleted: true },
      });

      return NextResponse.json({ ok: true });
    }

    const id = parseInt(commentId, 10);

    if (isNaN(id) || id < 1) {
      return bad("Invalid comment id");
    }

    await prisma.comment.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 403 });
    }

    console.error("❌ Delete comment error:", error);
    return NextResponse.json({ ok: false, message: error.message || "Failed to delete comment" }, { status: 500 });
  }
}
