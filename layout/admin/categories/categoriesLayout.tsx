"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

type Category = {
  id: number;
  slug: string;
  name: string;
  order: number;
  isPublic: boolean;
  description?: string | null;
  _count?: {
    posts: number;
  };
};

type CreateCategoryPayload = {
  slug: string;
  name: string;
  order?: number;
  isPublic?: boolean;
  description?: string | null;
};

const slugify = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const CategoriesManageLayout = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 생성 폼 상태
  const [form, setForm] = useState<CreateCategoryPayload>({
    slug: "",
    name: "",
    order: undefined,
    isPublic: true,
    description: null,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // 목록 로드
  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);

      const res = await apiFetch<{ ok: boolean; list: Category[] }>("/admin/blog/categories?includeCounts=1");

      setCategories(res.list);
    } catch (e: any) {
      setError(e.message ?? "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const canCreate = useMemo(() => {
    const slug = slugify(form.slug);
    const name = (form.name ?? "").trim();
    return slug.length >= 2 && name.length >= 1 && !creating;
  }, [form.slug, form.name, creating]);

  async function createCategory() {
    try {
      setCreating(true);
      setCreateError(null);

      const payload: CreateCategoryPayload = {
        slug: slugify(form.slug),
        name: form.name.trim(),
        order: form.order === undefined || form.order === null || form.order === ("" as any) ? undefined : Math.trunc(Number(form.order)),
        isPublic: typeof form.isPublic === "boolean" ? form.isPublic : true,
        description: form.description ?? null,
      };

      if (!payload.slug) throw new Error("slug는 필수야");
      if (!payload.name) throw new Error("name은 필수야");

      // ✅ 생성 API (경로 확인 필요: 네가 admin prefix 쓰고 있어서 맞춰둠)
      await apiFetch<{ ok: boolean; category: Category }>("/admin/blog/categories/create", {
        method: "POST",
        body: payload,
      });

      // 생성 후 폼 초기화
      setForm({
        slug: "",
        name: "",
        order: undefined,
        isPublic: true,
        description: null,
      });

      // 목록 재로드
      await loadCategories();
    } catch (e: any) {
      setCreateError(e.message ?? "Failed to create category");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="p-4 text-sm text-gray-500">불러오는 중...</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">카테고리 관리</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 리스트 */}
        <div className="border rounded overflow-hidden">
          <div className="px-4 py-2 border-b text-sm text-gray-600 flex justify-between">
            <span>목록</span>
            <span className="text-xs text-gray-400">{categories.length}개</span>
          </div>

          <ul className="divide-y">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-gray-400 w-8 shrink-0">{c.order}</span>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-gray-500 truncate">/{c.slug}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm shrink-0">
                  {c._count && <span className="text-gray-500">글 {c._count.posts}개</span>}
                  {!c.isPublic && <span className="text-xs text-red-500">비공개</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 생성 폼 */}
        <div className="border rounded p-4 space-y-3">
          <div className="font-medium">카테고리 생성</div>

          <div className="space-y-2">
            <label className="block text-sm">
              <div className="text-gray-600 mb-1">Slug (URL)</div>
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="ex) travel" />
              <div className="text-xs text-gray-400 mt-1">
                저장 시: <span className="font-mono">/{slugify(form.slug || "")}</span>
              </div>
            </label>

            <label className="block text-sm">
              <div className="text-gray-600 mb-1">Name</div>
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="ex) 여행" />
            </label>

            <label className="block text-sm">
              <div className="text-gray-600 mb-1">Order</div>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.order ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    order: e.target.value === "" ? undefined : Number(e.target.value),
                  }))
                }
                placeholder="ex) 10"
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isPublic} onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))} />
              <span>Public</span>
            </label>

            <label className="block text-sm">
              <div className="text-gray-600 mb-1">Description</div>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm min-h-[84px]"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    description: e.target.value === "" ? null : e.target.value,
                  }))
                }
                placeholder="선택"
              />
            </label>
          </div>

          {createError && <div className="text-sm text-red-500">{createError}</div>}

          <button className="w-full rounded px-3 py-2 text-sm bg-black text-white disabled:opacity-40" disabled={!canCreate} onClick={createCategory}>
            {creating ? "생성 중..." : "생성"}
          </button>

          <div className="text-xs text-gray-400">
            EN: Slug should be lowercase and hyphen-separated. <br />
            JP: slugは小文字＋ハイフン区切りが無難。
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManageLayout;
