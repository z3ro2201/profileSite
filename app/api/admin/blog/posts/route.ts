import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PostUpsertProp } from "@/types/Posts";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

const toFiniteNumberOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const clampLat = (n: number) => Math.min(90, Math.max(-90, n));
const clampLng = (n: number) => Math.min(180, Math.max(-180, n));

export async function POST(req: Request) {
  let body: PostUpsertProp;

  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body");
  }

  const title = (body.title ?? "").trim();
  const contentMd = body.contentMd ?? "";
  const authorId = body.authorId;

  if (!title) return bad("title is required");
  if (!contentMd) return bad("contentMd is required");
  if (!authorId || typeof authorId !== "number") return bad("authorId is required");

  const state = body.state ?? "DRAFT";
  const publishedAt = state === "PUBLISHED" ? new Date() : null;

  const tagSlugs = Array.isArray(body.tags) ? body.tags.map((t) => t.trim()).filter(Boolean) : [];
  const categoryId = body.categoryId === undefined ? null : body.categoryId;

  const fileIds = Array.isArray(body.fileIds) ? body.fileIds.filter(Boolean) : [];

  // ✅ lat/lng 파싱 (숫자 아니면 null)
  const latRaw = toFiniteNumberOrNull((body as any).lat);
  const lngRaw = toFiniteNumberOrNull((body as any).lng);

  const lat = latRaw === null ? null : clampLat(latRaw);
  const lng = lngRaw === null ? null : clampLng(lngRaw);

  // (선택) 둘 중 하나만 있으면 둘 다 null 처리하고 싶다면:
  // const hasBoth = lat !== null && lng !== null;
  // const latFinal = hasBoth ? lat : null;
  // const lngFinal = hasBoth ? lng : null;

  const created = await prisma.post.create({
    data: {
      title,
      contentMd,
      contentHtml: body.contentHtml ?? null,
      state,
      publishedAt,
      authorId,
      categoryId,

      lat,
      lng,

      ...(tagSlugs.length
        ? {
            tags: {
              connect: tagSlugs.map((slug) => ({ slug })),
            },
          }
        : {}),

      ...(fileIds.length
        ? {
            files: {
              create: fileIds.map((fileId: string, index: number) => ({
                fileId,
                role: index === 0 ? "thumbnail" : "content",
                sort: index,
              })),
            },
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      state: true,
      createdAt: true,
      updatedAt: true,
      lat: true,
      lng: true,
    },
  });

  return NextResponse.json({ ok: true, post: created }, { status: 201 });
}
