import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SaveBody = {
  id?: number;
  slug: string;
  name: string;
  description?: string | null;
  parentId?: number | null; // ✅ 추가
  order?: number;
  isPublic?: boolean;
  icon?: string | null;
  color?: string | null;
};

const slugify = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// ✅ 깊이 계산 함수
async function calculateDepth(parentId: number | null): Promise<number> {
  if (!parentId) return 0; // 최상위

  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { depth: true },
  });

  if (!parent) throw new Error("Parent category not found");

  return parent.depth + 1;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const includeCounts = searchParams.get("includeCounts") === "1";
  const tree = searchParams.get("tree") === "1"; // ✅ 트리 구조로 반환

  if (tree) {
    // ✅ 트리 구조로 반환 (최상위 + 자식, 2단계까지)
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // 최상위만
      orderBy: [{ order: "asc" }, { id: "asc" }],
      include: {
        children: {
          orderBy: [{ order: "asc" }, { id: "asc" }],
          include: includeCounts ? { _count: { select: { posts: true } } } : undefined,
        },
        _count: includeCounts ? { select: { posts: true } } : undefined,
      },
    });

    return NextResponse.json({ ok: true, tree: categories }, { status: 200 });
  }

  // ✅ 플랫 리스트로 반환
  const list = await prisma.category.findMany({
    orderBy: [{ depth: "asc" }, { order: "asc" }, { id: "asc" }],
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      _count: includeCounts ? { select: { posts: true, children: true } } : undefined,
    },
  });

  return NextResponse.json({ ok: true, list }, { status: 200 });
}

export async function POST(req: Request) {
  let body: SaveBody;
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const slug = slugify(body.slug ?? "");
  const name = (body.name ?? "").trim();

  if (!slug || slug.length < 2) {
    return NextResponse.json({ ok: false, message: "slug is required (min 2 chars)" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ ok: false, message: "name is required" }, { status: 400 });
  }

  // ✅ parentId 검증
  const parentId = body.parentId || null;

  try {
    // ✅ 깊이 계산
    const depth = await calculateDepth(parentId);

    // ✅ 최대 깊이 제한 (2단계 = depth 0~1)
    if (depth > 1) {
      return NextResponse.json({ ok: false, message: "Maximum 2 levels allowed" }, { status: 400 });
    }

    const data = {
      slug,
      name,
      description: body.description ?? null,
      parentId,
      depth,
      order: Number.isFinite(body.order as number) ? Number(body.order) : 0,
      isPublic: typeof body.isPublic === "boolean" ? body.isPublic : true,
      icon: body.icon?.trim() || null,
      color: body.color?.trim() || null,
    };

    const saved = body.id
      ? await prisma.category.update({
          where: { id: body.id },
          data,
        })
      : await prisma.category.create({ data });

    return NextResponse.json({ ok: true, category: saved }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Category save error:", e);

    if (e.message === "Parent category not found") {
      return NextResponse.json({ ok: false, message: "Parent category not found" }, { status: 404 });
    }

    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, message: "slug already exists" }, { status: 409 });
    }

    return NextResponse.json({ ok: false, message: "server error" }, { status: 500 });
  }
}
