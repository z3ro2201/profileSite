import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PatchBody = {
  // slug는 SEO 때문에 보통 막는 게 정석.
  // 필요하면 열어두되, 기본은 "수정 불가"로.
  // slug?: string;
  name?: string;
  description?: string | null;
  order?: number;
  isPublic?: boolean;
};

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: "invalid id" }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const data: any = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ ok: false, message: "name is required" }, { status: 400 });
    data.name = name;
  }

  if ("description" in body) {
    data.description = body.description ?? null;
  }

  if (typeof body.order === "number" && Number.isFinite(body.order)) {
    data.order = Math.trunc(body.order);
  }

  if (typeof body.isPublic === "boolean") {
    data.isPublic = body.isPublic;
  }

  // slug 수정 허용하려면 여기 추가 + unique 충돌 처리 필요
  // if (typeof body.slug === "string") data.slug = slugify(body.slug);

  try {
    const updated = await prisma.category.update({
      where: { id },
      data,
    });
    return NextResponse.json({ ok: true, category: updated }, { status: 200 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, message: "slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: "server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: "invalid id" }, { status: 400 });
  }

  // 연결된 글 있으면 삭제 막기 (원하면 soft delete로 바꿔도 됨)
  const count = await prisma.post.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json({ ok: false, message: `cannot delete: ${count} posts exist` }, { status: 409 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
