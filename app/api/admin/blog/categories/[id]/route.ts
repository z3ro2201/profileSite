// app/api/admin/blog/categories/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PatchBody = {
  name?: string;
  description?: string | null;
  parentId?: number | null;
  order?: number;
  isPublic?: boolean;
};

// ========================================
// 헬퍼 함수들
// ========================================

/**
 * 깊이 계산
 * parentId가 null이면 0 (최상위)
 * parentId가 있으면 부모의 depth + 1
 */
async function calculateDepth(parentId: number | null): Promise<number> {
  if (!parentId) return 0;

  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { depth: true },
  });

  if (!parent) throw new Error("Parent category not found");

  return parent.depth + 1;
}

/**
 * 모든 자손 ID 가져오기 (재귀)
 * 순환 참조 방지를 위해 사용
 */
async function getDescendantIds(categoryId: number): Promise<number[]> {
  const descendants: number[] = [];

  async function traverse(id: number) {
    const children = await prisma.category.findMany({
      where: { parentId: id },
      select: { id: true },
    });

    for (const child of children) {
      descendants.push(child.id);
      await traverse(child.id); // 재귀
    }
  }

  await traverse(categoryId);
  return descendants;
}

// ========================================
// PATCH - 카테고리 수정
// ========================================
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const id = Number(params.id);

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

  // ----------------------------------------
  // 이름 변경
  // ----------------------------------------
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ ok: false, message: "name is required" }, { status: 400 });
    }
    data.name = name;
  }

  // ----------------------------------------
  // 설명 변경
  // ----------------------------------------
  if ("description" in body) {
    data.description = body.description ?? null;
  }

  // ----------------------------------------
  // 부모 변경 (카테고리 이동)
  // ----------------------------------------
  if ("parentId" in body) {
    const newParentId = body.parentId ?? null;

    // 1. 자기 자신을 부모로 설정 방지
    if (newParentId === id) {
      return NextResponse.json({ ok: false, message: "Cannot set self as parent" }, { status: 400 });
    }

    // 2. 자손을 부모로 설정 방지 (순환 참조)
    if (newParentId) {
      try {
        const descendants = await getDescendantIds(id);
        if (descendants.includes(newParentId)) {
          return NextResponse.json({ ok: false, message: "Cannot set descendant as parent (circular reference)" }, { status: 400 });
        }
      } catch (e) {
        console.error("Error checking descendants:", e);
      }
    }

    // 3. 새로운 깊이 계산
    try {
      const newDepth = await calculateDepth(newParentId);

      // 4. 최대 깊이 체크 (3단계 = depth 2)
      // 4. 최대 깊이 체크 (2단계 = depth 0~1)
      if (newDepth > 1) {
        return NextResponse.json({ ok: false, message: "Maximum 2 levels allowed" }, { status: 400 });
      }

      data.parentId = newParentId;
      data.depth = newDepth;
    } catch (e: any) {
      if (e.message === "Parent category not found") {
        return NextResponse.json({ ok: false, message: "Parent category not found" }, { status: 404 });
      }
      console.error("Error calculating depth:", e);
      return NextResponse.json({ ok: false, message: "server error" }, { status: 500 });
    }
  }

  // ----------------------------------------
  // 순서 변경
  // ----------------------------------------
  if (typeof body.order === "number" && Number.isFinite(body.order)) {
    data.order = Math.trunc(body.order);
  }

  // ----------------------------------------
  // 공개 여부 변경
  // ----------------------------------------
  if (typeof body.isPublic === "boolean") {
    data.isPublic = body.isPublic;
  }

  // ----------------------------------------
  // 업데이트 실행
  // ----------------------------------------
  try {
    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, category: updated }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Category update error:", e);

    // Unique 제약 위반 (slug 중복)
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, message: "slug already exists" }, { status: 409 });
    }

    // 레코드 없음
    if (e?.code === "P2025") {
      return NextResponse.json({ ok: false, message: "category not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: false, message: "server error" }, { status: 500 });
  }
}

// ========================================
// DELETE - 카테고리 삭제
// ========================================
export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const id = Number(params.id);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: "invalid id" }, { status: 400 });
  }

  try {
    // ----------------------------------------
    // 1. 자식 카테고리 확인
    // ----------------------------------------
    const childrenCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `Cannot delete: ${childrenCount} subcategory(ies) exist`,
        },
        { status: 409 },
      );
    }

    // ----------------------------------------
    // 2. 연결된 Post 확인
    // ----------------------------------------
    const postCount = await prisma.post.count({
      where: { categoryId: id },
    });

    if (postCount > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `Cannot delete: ${postCount} post(s) are using this category`,
        },
        { status: 409 },
      );
    }

    // ----------------------------------------
    // 3. 삭제 실행
    // ----------------------------------------
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Category delete error:", e);

    // 레코드 없음
    if (e?.code === "P2025") {
      return NextResponse.json({ ok: false, message: "category not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: false, message: "server error" }, { status: 500 });
  }
}
