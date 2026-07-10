"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { apiFetch } from "@/lib/apiFetch";
import { TEAL, mono } from "@/lib/nav-shared";

type Project = {
  id: number;
  slug: string;
  emoji: string;
  title: string;
  subtitle: string;
  category: string;
  color: string;
  period: string;
  contribution: string;
  url: string | null;
  github: string | null;
  body: string;
  stack: { label: string; items: string[] }[];
  year: number | null;
  tags: string[] | null;
  order: number;
  isPublic: boolean;
  thumbnailId: string | null;
  thumbnail?: { objectKey: string } | null;
};

type FormData = {
  slug: string;
  emoji: string;
  title: string;
  subtitle: string;
  category: string;
  color: string;
  period: string;
  contribution: string;
  url: string;
  github: string;
  body: string;
  stackText: string; // JSON 텍스트로 편집 ([{"label":"Frontend","items":["React"]}])
  year: string;
  tagsText: string; // 쉼표 구분
  order: number;
  isPublic: boolean;
  thumbnailId: string;
  thumbnailPreview: string; // objectKey (미리보기용)
};

const CATEGORY_OPTIONS = ["웹", "앱", "도구", "게임"];
const CATEGORY_ICON: Record<string, string> = { 웹: "🌐", 앱: "📱", 도구: "🔧", 게임: "🎮" };
type CategoryFilter = "전체" | (typeof CATEGORY_OPTIONS)[number];

const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message ? err.message : fallback;

const INITIAL_FORM: FormData = {
  slug: "",
  emoji: "",
  title: "",
  subtitle: "",
  category: "웹",
  color: "#eeeeee",
  period: "",
  contribution: "개인",
  url: "",
  github: "",
  body: "",
  stackText: "[]",
  year: "",
  tagsText: "",
  order: 0,
  isPublic: true,
  thumbnailId: "",
  thumbnailPreview: "",
};

const inputCls =
  "w-full rounded-xl border px-3 py-2 text-sm bg-[var(--input-background)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#23c6a9]/40 transition-all";
const inputStyle: React.CSSProperties = { borderColor: "var(--border)" };

export default function ProjectsManager() {
  type FormMode = "list" | "create" | "edit";

  const [mode, setMode] = useState<FormMode>("list");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [stackError, setStackError] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterCategory, setFilterCategory] = useState<CategoryFilter>("전체");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ ok: true; list: Project[] }>("/admin/projects");
      if (data.ok) setProjects(data.list || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
      alert("프로젝트 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회만 목록 로드
    loadProjects();
  }, []);

  const filtered = projects.filter((p) => {
    const matchCategory = filterCategory === "전체" || p.category === filterCategory;
    const matchQ = !searchQ.trim() || p.title.includes(searchQ) || p.slug.includes(searchQ);
    return matchCategory && matchQ;
  });

  const handleThumbnailUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      // 기존 블로그 이미지 업로드 라우트를 그대로 재사용 (로직 자체는 범용적임)
      const res = await apiFetch<{ url: string; fileId: string }>("/admin/blog/posts/upload", {
        method: "POST",
        body: fd,
      });
      setFormData((f) => ({ ...f, thumbnailId: res.fileId, thumbnailPreview: res.url }));
    } catch (err) {
      console.error("Thumbnail upload error:", err);
      alert(getErrorMessage(err, "이미지 업로드 실패"));
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setStackError(null);
    setFormData(INITIAL_FORM);
    setMode("create");
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setStackError(null);
    setFormData({
      slug: p.slug,
      emoji: p.emoji,
      title: p.title,
      subtitle: p.subtitle,
      category: p.category,
      color: p.color,
      period: p.period,
      contribution: p.contribution,
      url: p.url ?? "",
      github: p.github ?? "",
      body: p.body,
      stackText: JSON.stringify(p.stack ?? [], null, 2),
      year: p.year != null ? String(p.year) : "",
      tagsText: (p.tags ?? []).join(", "),
      order: p.order,
      isPublic: p.isPublic,
      thumbnailId: p.thumbnailId ?? "",
      thumbnailPreview: p.thumbnail?.objectKey ?? "",
    });
    setMode("edit");
  };

  const cancelForm = () => {
    setMode("list");
    setEditingId(null);
    setStackError(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug.trim() || !formData.title.trim()) {
      alert("slug와 title은 필수입니다.");
      return;
    }

    let stack: { label: string; items: string[] }[];
    try {
      stack = JSON.parse(formData.stackText || "[]");
      setStackError(null);
    } catch {
      setStackError('JSON 형식이 잘못됐어요. 예: [{"label":"Frontend","items":["React"]}]');
      return;
    }

    const payload = {
      slug: formData.slug.trim(),
      emoji: formData.emoji,
      title: formData.title.trim(),
      subtitle: formData.subtitle,
      category: formData.category,
      color: formData.color,
      period: formData.period,
      contribution: formData.contribution,
      url: formData.url || null,
      github: formData.github || null,
      body: formData.body,
      stack,
      year: formData.year ? Number(formData.year) : null,
      tags: formData.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      order: formData.order,
      isPublic: formData.isPublic,
      thumbnailId: formData.thumbnailId || null,
    };

    setLoading(true);
    try {
      const path = editingId ? `/admin/projects/${editingId}` : "/admin/projects";
      await apiFetch<{ ok: true }>(path, {
        method: editingId ? "PUT" : "POST",
        body: payload,
      });

      cancelForm();
      loadProjects();
    } catch (err) {
      console.error("Save error:", err);
      alert(getErrorMessage(err, "저장 실패"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await apiFetch<{ ok: true }>(`/admin/projects/${id}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      loadProjects();
    } catch (err) {
      console.error("Delete error:", err);
      alert(getErrorMessage(err, "삭제 실패"));
    } finally {
      setLoading(false);
    }
  };

  const f = (field: keyof FormData, val: string | number | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  /* ── form view ── */
  if (mode === "create" || mode === "edit") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={cancelForm}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            style={mono}
          >
            <ChevronLeft size={13} /> 목록으로
          </button>
          <h2 className="text-lg font-medium text-foreground">
            {mode === "create" ? "새 프로젝트 등록" : "프로젝트 수정"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-6 space-y-4"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => f("slug", e.target.value)}
              placeholder="ex) p2026a"
              required
              disabled={mode === "edit"}
            />
            <Input label="Emoji" value={formData.emoji} onChange={(e) => f("emoji", e.target.value)} placeholder="📻" />
          </div>

          <Input
            label="프로젝트명"
            value={formData.title}
            onChange={(e) => f("title", e.target.value)}
            placeholder="프로젝트명을 입력하세요"
            required
          />
          <Input
            label="한 줄 설명"
            value={formData.subtitle}
            onChange={(e) => f("subtitle", e.target.value)}
            placeholder="간략한 설명"
          />

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">상세 설명</label>
            <textarea
              value={formData.body}
              onChange={(e) => f("body", e.target.value)}
              rows={4}
              placeholder="프로젝트에 대한 상세 설명을 입력하세요"
              className={inputCls}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block" style={mono}>
                유형
              </label>
              <Select
                label=""
                options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: `${CATEGORY_ICON[c]} ${c}` }))}
                value={formData.category}
                onChange={(value) => f("category", value)}
              />
            </div>
            <Input
              label="기간"
              value={formData.period}
              onChange={(e) => f("period", e.target.value)}
              placeholder="25.03. / 2023"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block" style={mono}>
                기여
              </label>
              <select
                className={inputCls}
                style={inputStyle}
                value={formData.contribution}
                onChange={(e) => f("contribution", e.target.value)}
              >
                <option value="개인">개인</option>
                <option value="팀">팀</option>
              </select>
            </div>
            <Input label="Year" type="number" value={formData.year} onChange={(e) => f("year", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="URL"
              value={formData.url}
              onChange={(e) => f("url", e.target.value)}
              placeholder="https://…"
            />
            <Input
              label="GitHub"
              value={formData.github}
              onChange={(e) => f("github", e.target.value)}
              placeholder="https://github.com/…"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block" style={mono}>
              카드 색상
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-9 h-9 rounded-lg border cursor-pointer"
                style={{ borderColor: "var(--border)", padding: 2 }}
                value={formData.color}
                onChange={(e) => f("color", e.target.value)}
              />
              <input
                className={inputCls}
                style={inputStyle}
                value={formData.color}
                onChange={(e) => f("color", e.target.value)}
                placeholder="#f0f0ec"
              />
            </div>
          </div>

          <Input
            label="Tags (쉼표 구분)"
            value={formData.tagsText}
            onChange={(e) => f("tagsText", e.target.value)}
            placeholder="Web, PHP"
          />
          <Input
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => f("order", Number(e.target.value))}
          />

          {/* 썸네일 */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">썸네일</label>
            {formData.thumbnailPreview && (
              // eslint-disable-next-line @next/next/no-img-element -- 업로드 미리보기, 최적화 불필요
              <img
                src={formData.thumbnailPreview}
                alt="thumbnail preview"
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleThumbnailUpload(file);
              }}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--secondary)] file:text-sm file:font-medium hover:file:bg-[var(--muted)]"
            />
            {uploading && <p className="text-xs text-muted-foreground mt-1">업로드 중...</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Stack (JSON){" "}
              <span className="text-muted-foreground font-normal">
                예: [{"{"}label, items[]{"}"}]
              </span>
            </label>
            <textarea
              value={formData.stackText}
              onChange={(e) => f("stackText", e.target.value)}
              rows={6}
              className={`${inputCls} font-mono text-xs`}
              style={inputStyle}
            />
            {stackError && <p className="text-xs text-red-600 mt-1">{stackError}</p>}
          </div>

          <Checkbox checked={formData.isPublic} onChange={(e) => f("isPublic", e.target.checked)} label="Public" />

          <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={cancelForm}
              className="text-sm px-4 py-2 rounded-xl border transition-colors hover:bg-[var(--secondary)]"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              취소
            </button>
            <Button type="submit" loading={loading} disabled={!formData.title.trim()}>
              {mode === "create" ? "등록" : "저장"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  /* ── list view ── */
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-medium text-foreground">프로젝트 관리</h2>
          <p className="text-xs text-muted-foreground mt-0.5" style={mono}>
            등록된 프로젝트를 추가, 수정, 삭제합니다.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: TEAL }}
        >
          <Plus size={14} /> 새 프로젝트
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border pl-8 pr-3 py-2 text-sm bg-[var(--input-background)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#23c6a9]/40 transition-all"
            style={{ borderColor: "var(--border)" }}
            placeholder="프로젝트 검색…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(["전체", ...CATEGORY_OPTIONS] as CategoryFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className="text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={
                filterCategory === c
                  ? { background: TEAL, color: "#fff", borderColor: TEAL, ...mono }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)", ...mono }
              }
            >
              {c !== "전체" && <span className="mr-0.5">{CATEGORY_ICON[c]}</span>}
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium" style={mono}>
                  프로젝트
                </th>
                <th
                  className="px-4 py-3 text-left text-xs text-muted-foreground font-medium hidden sm:table-cell"
                  style={mono}
                >
                  유형
                </th>
                <th
                  className="px-4 py-3 text-left text-xs text-muted-foreground font-medium hidden md:table-cell"
                  style={mono}
                >
                  기간
                </th>
                <th
                  className="px-4 py-3 text-left text-xs text-muted-foreground font-medium hidden md:table-cell"
                  style={mono}
                >
                  공개
                </th>
                <th
                  className="px-4 py-3 text-left text-xs text-muted-foreground font-medium hidden lg:table-cell"
                  style={mono}
                >
                  링크
                </th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium" style={mono}>
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {p.thumbnail?.objectKey ? (
                        // eslint-disable-next-line @next/next/no-img-element -- 관리자 미리보기 썸네일, 최적화 불필요
                        <img
                          src={p.thumbnail.objectKey}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: p.color }}
                        >
                          {p.emoji || "—"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm leading-tight truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-1">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ ...mono, background: "rgba(35,198,169,0.13)", color: TEAL }}
                    >
                      {CATEGORY_ICON[p.category] ?? "📁"} {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground" style={mono}>
                    {p.period}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground" style={mono}>
                    {p.isPublic ? "공개" : "비공개"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-[#23c6a9] transition-colors"
                          style={mono}
                        >
                          URL
                        </a>
                      )}
                      {p.github && (
                        <a
                          href={p.github}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-[#23c6a9] transition-colors"
                          style={mono}
                        >
                          GitHub
                        </a>
                      )}
                      {!p.url && !p.github && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirmId === p.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">삭제할까요?</span>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-xs px-2 py-1 rounded-lg text-white transition-colors"
                          style={{ background: "#ef4444" }}
                        >
                          삭제
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs px-2 py-1 rounded-lg border transition-colors hover:bg-[var(--secondary)]"
                          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-[var(--secondary)] transition-colors text-muted-foreground hover:text-foreground"
                          title="수정"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-muted-foreground hover:text-red-500"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {searchQ || filterCategory !== "전체"
                      ? "조건에 맞는 프로젝트가 없습니다."
                      : "등록된 프로젝트가 없습니다."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-right" style={mono}>
        {filtered.length}개 표시 / 전체 {projects.length}개
      </p>
    </div>
  );
}
