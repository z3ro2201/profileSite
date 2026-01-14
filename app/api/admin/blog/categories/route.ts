import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SaveBody = {
  id?: number; // 있으면 update, 없으면 create
  slug: string;
  name: string;
  description?: string | null;
  order?: number;
  isPublic?: boolean;
};

const slugify = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const includeCounts = searchParams.get("includeCounts") === "1";

  const list = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
    include: includeCounts ? { _count: { select: { posts: true } } } : undefined,
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
    return NextResponse.json({ ok: false, message: "slug is required" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ ok: false, message: "name is required" }, { status: 400 });
  }

  const data = {
    slug,
    name,
    description: body.description ?? null,
    order: Number.isFinite(body.order as number) ? Number(body.order) : 0,
    isPublic: typeof body.isPublic === "boolean" ? body.isPublic : true,
  };

  try {
    const saved = body.id
      ? await prisma.category.update({
          where: { id: body.id },
          data,
        })
      : await prisma.category.create({ data });

    return NextResponse.json({ ok: true, category: saved }, { status: 200 });
  } catch (e: any) {
    // unique(slug) 충돌
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, message: "slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: "server error" }, { status: 500 });
  }
}
