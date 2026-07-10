import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StackGroup = { label: string; items: string[] };

type SaveBody = {
  slug: string;
  emoji: string;
  title: string;
  subtitle: string;
  category: string;
  color: string;
  period: string;
  contribution: string;
  url?: string | null;
  github?: string | null;
  body: string;
  stack: StackGroup[];
  year?: number | null;
  tags?: string[];
  order?: number;
  isPublic?: boolean;
  thumbnailId?: string | null;
  imageIds?: string[]; // 미리보기 갤러리 이미지들 (순서대로)
};

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

// 관리자용 - 비공개 포함 전체 목록
export async function GET() {
  const list = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { id: "desc" }],
    include: {
      thumbnail: { select: { objectKey: true } },
      images: { orderBy: { sort: "asc" }, include: { file: { select: { objectKey: true } } } },
    },
  });
  return NextResponse.json({ ok: true, list });
}

export async function POST(req: Request) {
  const body = (await req.json()) as SaveBody;

  if (!body.slug?.trim() || !body.title?.trim()) {
    return bad("slug와 title은 필수입니다.");
  }

  const exists = await prisma.project.findUnique({ where: { slug: body.slug } });
  if (exists) return bad("이미 사용 중인 slug입니다.", 409);

  const created = await prisma.project.create({
    data: {
      slug: body.slug.trim(),
      emoji: body.emoji ?? "",
      title: body.title.trim(),
      subtitle: body.subtitle ?? "",
      category: body.category ?? "Web",
      color: body.color ?? "#eeeeee",
      period: body.period ?? "",
      contribution: body.contribution ?? "",
      url: body.url || null,
      github: body.github || null,
      body: body.body ?? "",
      stack: body.stack ?? [],
      year: body.year ?? null,
      tags: body.tags ?? [],
      order: body.order ?? 0,
      isPublic: body.isPublic ?? true,
      thumbnailId: body.thumbnailId || null,
      images:
        body.imageIds && body.imageIds.length > 0
          ? { create: body.imageIds.map((fileId, sort) => ({ fileId, sort })) }
          : undefined,
    },
  });

  return NextResponse.json({ ok: true, project: created });
}
