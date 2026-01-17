import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// 댓글 목록 조회
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = Number(id);

  if (!postId || isNaN(postId)) {
    return NextResponse.json({ ok: false, message: "Invalid post id" }, { status: 400 });
  }

  try {
    // 최상위 댓글만 조회 (parentId가 null)
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
        isDeleted: false,
        isApproved: true,
      },
      include: {
        replies: {
          where: {
            isDeleted: false,
            isApproved: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ ok: true, comments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Failed to fetch comments" }, { status: 500 });
  }
}

// 댓글 작성
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = Number(id);

  if (!postId || isNaN(postId)) {
    return NextResponse.json({ ok: false, message: "Invalid post id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { authorName, authorEmail, authorHomepage, content, isSecret, parentId } = body;

    // 유효성 검사
    if (!authorName?.trim()) {
      return NextResponse.json({ ok: false, message: "Name is required" }, { status: 400 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ ok: false, message: "Content is required" }, { status: 400 });
    }

    // IP 주소 가져오기
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        postId,
        parentId: parentId || null,
        authorName: authorName.trim(),
        authorEmail: authorEmail?.trim() || null,
        authorHomepage: authorHomepage?.trim() || null,
        content: content.trim(),
        isSecret: !!isSecret,
        authorIp: ip,
        isApproved: true, // 스팸 필터 없으면 자동 승인
      },
    });

    // 댓글 수 업데이트 (선택사항)
    await prisma.post.update({
      where: { id: postId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ ok: true, comment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Failed to create comment" }, { status: 500 });
  }
}
