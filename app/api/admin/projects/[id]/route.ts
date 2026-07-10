import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StackGroup = { label: string; items: string[] };

type SaveBody = {
  slug?: string;
  emoji?: string;
  title?: string;
  subtitle?: string;
  category?: string;
  color?: string;
  period?: string;
  contribution?: string;
  url?: string | null;
  github?: string | null;
  body?: string;
  stack?: StackGroup[];
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

type MaybePromise<T> = T | Promise<T>;

export async function GET(_req: Request, ctx: { params: MaybePromise<{ id: string }> }) {
  const { id } = await ctx.params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) return bad("Invalid project id");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      thumbnail: { select: { objectKey: true } },
      images: { orderBy: { sort: "asc" }, include: { file: { select: { objectKey: true } } } },
    },
  });
  if (!project) return bad("프로젝트를 찾을 수 없습니다.", 404);

  return NextResponse.json({ ok: true, project });
}

export async function PUT(req: Request, ctx: { params: MaybePromise<{ id: string }> }) {
  const { id } = await ctx.params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) return bad("Invalid project id");

  const body = (await req.json()) as SaveBody;

  if (body.slug) {
    const dup = await prisma.project.findFirst({ where: { slug: body.slug, NOT: { id: projectId } } });
    if (dup) return bad("이미 사용 중인 slug입니다.", 409);
  }

  const data: Record<string, unknown> = {};
  for (const key of [
    "slug", "emoji", "title", "subtitle", "category", "color", "period",
    "contribution", "url", "github", "body", "stack", "year", "tags", "order", "isPublic", "thumbnailId",
  ] as const) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  // 갤러리 이미지는 전체 교체 방식 (기존 연결 삭제 후 새로 생성) — 순서 변경도 이걸로 처리됨
  const updated = await prisma.$transaction(async (tx) => {
    const project = await tx.project.update({ where: { id: projectId }, data });

    if (body.imageIds !== undefined) {
      await tx.projectImage.deleteMany({ where: { projectId } });
      if (body.imageIds.length > 0) {
        await tx.projectImage.createMany({
          data: body.imageIds.map((fileId, sort) => ({ projectId, fileId, sort })),
        });
      }
    }

    return project;
  });

  return NextResponse.json({ ok: true, project: updated });
}

export async function DELETE(_req: Request, ctx: { params: MaybePromise<{ id: string }> }) {
  const { id } = await ctx.params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) return bad("Invalid project id");

  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ ok: true });
}
