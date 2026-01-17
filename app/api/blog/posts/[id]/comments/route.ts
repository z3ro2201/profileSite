// app/api/blog/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth/server";
import { hashPassword, validatePassword } from "@/lib/commentAuth";

type Params = { params: Promise<{ id: string }> };

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

// GET - 댓글 목록 조회
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = Number(id);

  if (!postId || isNaN(postId)) {
    return bad("Invalid post id");
  }

  try {
    const isAdminUser = await isAdmin();

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
        isDeleted: false,
        ...(isAdminUser ? {} : { isApproved: true }),
      },
      select: {
        id: true,
        authorName: true,
        authorEmail: true,
        authorHomepage: true,
        content: true,
        isSecret: true,
        createdAt: true,
        updatedAt: true,
        // ⚠️ 비밀번호는 절대 반환하지 않음
        replies: {
          where: {
            isDeleted: false,
            ...(isAdminUser ? {} : { isApproved: true }),
          },
          select: {
            id: true,
            authorName: true,
            authorEmail: true,
            authorHomepage: true,
            content: true,
            isSecret: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      comments,
      canViewSecret: isAdminUser,
    });
  } catch (error) {
    console.error(error);
    return bad("Failed to fetch comments", 500);
  }
}

// POST - 댓글 작성
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = Number(id);

  if (!postId || isNaN(postId)) {
    return bad("Invalid post id");
  }

  try {
    const body = await req.json();
    const { authorName, authorEmail, authorHomepage, authorPassword, content, isSecret, parentId } = body;

    if (!authorName?.trim()) {
      return bad("Name is required");
    }

    if (!authorPassword?.trim()) {
      return bad("Password is required");
    }

    const passwordValidation = validatePassword(authorPassword);
    if (!passwordValidation.valid) {
      return bad(passwordValidation.message || "Invalid password");
    }

    if (!content?.trim()) {
      return bad("Content is required");
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";

    const hashedPassword = hashPassword(authorPassword);

    const comment = await prisma.comment.create({
      data: {
        postId,
        parentId: parentId || null,
        authorName: authorName.trim(),
        authorEmail: authorEmail?.trim() || null,
        authorHomepage: authorHomepage?.trim() || null,
        authorPassword: hashedPassword,
        content: content.trim(),
        isSecret: !!isSecret,
        authorIp: ip,
        isApproved: true,
      },
      select: {
        id: true,
        authorName: true,
        content: true,
        createdAt: true,
      },
    });

    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    return NextResponse.json({ ok: true, comment });
  } catch (error) {
    console.error(error);
    return bad("Failed to create comment", 500);
  }
}
