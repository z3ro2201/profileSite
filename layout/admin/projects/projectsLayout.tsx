"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { apiFetch } from "@/lib/apiFetch";

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

const CATEGORY_OPTIONS = ["Web", "App", "PHP", "Node.js"];

const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message ? err.message : fallback;

const INITIAL_FORM: FormData = {
  slug: "",
  emoji: "",
  title: "",
  subtitle: "",
  category: "Web",
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

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [stackError, setStackError] = useState<string | null>(null);

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

      alert(editingId ? "프로젝트가 수정되었습니다" : "프로젝트가 생성되었습니다");
      setFormData(INITIAL_FORM);
      setEditingId(null);
      loadProjects();
    } catch (err) {
      console.error("Save error:", err);
      alert(getErrorMessage(err, "저장 실패"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Project) => {
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
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 프로젝트를 삭제하시겠습니까?`)) return;

    setLoading(true);
    try {
      await apiFetch<{ ok: true }>(`/admin/projects/${id}`, { method: "DELETE" });
      alert("프로젝트가 삭제되었습니다");
      loadProjects();
    } catch (err) {
      console.error("Delete error:", err);
      alert(getErrorMessage(err, "삭제 실패"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setStackError(null);
    setFormData(INITIAL_FORM);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 p-6">
      {/* ── list ── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 목록 ({projects.length})</h2>
        <div className="space-y-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-lg border-2 border-transparent hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {p.thumbnail?.objectKey ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 관리자 미리보기 썸네일, 최적화 불필요
                  <img src={p.thumbnail.objectKey} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                ) : (
                  <span className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                    {p.emoji || "—"}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">{p.title}</span>
                    {!p.isPublic && <Badge variant="neutral">비공개</Badge>}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    /{p.slug} • {p.category} • {p.period}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                  수정
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(p.id, p.title)}>
                  삭제
                </Button>
              </div>
            </div>
          ))}
          {!loading && projects.length === 0 && <p className="text-sm text-gray-500">등록된 프로젝트가 없습니다.</p>}
        </div>
      </div>

      {/* ── form ── */}
      <div className="border-l lg:pl-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? "프로젝트 수정" : "새 프로젝트"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="ex) p2026a" required />
          <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <Input label="Subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
          <Input label="Emoji" value={formData.emoji} onChange={(e) => setFormData({ ...formData, emoji: e.target.value })} placeholder="📻" />

          <Select
            label="Category"
            options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
          />

          <Input label="Color (hex)" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="#f0f8ff" />
          <Input label="Period" value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} placeholder="2025.07." />
          <Input label="Contribution" value={formData.contribution} onChange={(e) => setFormData({ ...formData, contribution: e.target.value })} placeholder="개인 / 팀" />
          <Input label="Year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
          <Input label="URL" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
          <Input label="GitHub" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} />
          <Input label="Tags (쉼표 구분)" value={formData.tagsText} onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })} placeholder="Web, PHP" />
          <Input label="Order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} />

          {/* 썸네일 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">썸네일</label>
            {formData.thumbnailPreview && (
              // eslint-disable-next-line @next/next/no-img-element -- 업로드 미리보기, 최적화 불필요
              <img src={formData.thumbnailPreview} alt="thumbnail preview" className="w-full h-32 object-cover rounded-lg mb-2" />
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleThumbnailUpload(file);
              }}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-sm file:font-medium hover:file:bg-gray-200"
            />
            {uploading && <p className="text-xs text-gray-500 mt-1">업로드 중...</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Body (설명)</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stack (JSON) <span className="text-gray-400 font-normal">예: [{"{"}label, items[]{"}"}]</span>
            </label>
            <textarea
              value={formData.stackText}
              onChange={(e) => setFormData({ ...formData, stackText: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            {stackError && <p className="text-xs text-red-600 mt-1">{stackError}</p>}
          </div>

          <Checkbox checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} label="Public" />

          <Button type="submit" loading={loading} fullWidth>
            {editingId ? "수정 저장" : "생성"}
          </Button>

          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancel} fullWidth>
              취소
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
