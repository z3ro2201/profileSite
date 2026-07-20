// components/admin/CategoryManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { apiFetch } from "@/lib/apiFetch";
import { mono } from "@/lib/nav-shared";
import { resolveIcon, isValidIconName } from "@/lib/icon-registry";

type Category = {
  id: number;
  slug: string;
  name: string;
  parentId: number | null;
  depth: number;
  order: number;
  isPublic: boolean;
  description: string | null;
  icon: string | null;
  color: string | null;
  parent?: { id: number; name: string; slug: string } | null;
  _count?: { posts: number; children: number };
  children?: Category[];
};

type FormData = {
  slug: string;
  name: string;
  parentId: number | null;
  description: string;
  order: number;
  isPublic: boolean;
  icon: string;
  color: string;
};

const INITIAL_FORM: FormData = {
  slug: "",
  name: "",
  parentId: null,
  description: "",
  order: 0,
  isPublic: true,
  icon: "",
  color: "",
};

// resolveIcon()이 리턴한 컴포넌트를 JSX 안에서 바로 <Icon .../>으로 안 쓰고
// 이 컴포넌트로 감싸서 렌더링. (인라인으로 쓰면 "렌더 중 컴포넌트를 만든다"고
// React Compiler가 오인해서 정적 분석 경고가 남)
function IconPreview({ name, size = 18, className }: { name?: string; size?: number; className?: string }) {
  const Icon = resolveIcon(name);
  // eslint-disable-next-line react-hooks/static-components -- 아이콘 이름 자유 입력을 지원하려면 동적 조회가 필수라 의도된 패턴
  return <Icon size={size} className={className} />;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // 카테고리 목록 로드
  const loadCategories = async () => {
    setLoading(true);
    try {
      const [treeData, listData] = await Promise.all([apiFetch<{ ok: true; tree: Category[] }>("/admin/blog/categories?tree=1&includeCounts=1"), apiFetch<{ ok: true; list: Category[] }>("/admin/blog/categories?includeCounts=1")]);

      if (treeData.ok) setCategories(treeData.tree || []);
      if (listData.ok) setFlatCategories(listData.list || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      alert("카테고리 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회 목록 로드
    loadCategories();
  }, []);

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("카테고리 이름을 입력하세요");
      return;
    }

    if (!formData.slug.trim()) {
      alert("슬러그를 입력하세요");
      return;
    }

    setLoading(true);
    try {
      const path = editingId ? `/admin/blog/categories/${editingId}` : "/admin/blog/categories";

      await apiFetch<{ ok: true; category: Category }>(path, {
        method: editingId ? "PATCH" : "POST",
        body: formData,
      });

      alert(editingId ? "카테고리가 수정되었습니다" : "카테고리가 생성되었습니다");
      setFormData(INITIAL_FORM);
      setEditingId(null);
      loadCategories();
    } catch (err) {
      console.error("Save error:", err);
      alert(err instanceof Error ? err.message : String(err) || "저장 실패");
    } finally {
      setLoading(false);
    }
  };

  // 수정 시작
  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      slug: category.slug,
      name: category.name,
      parentId: category.parentId,
      description: category.description || "",
      order: category.order,
      isPublic: category.isPublic,
      icon: category.icon || "",
      color: category.color || "",
    });
  };

  // 삭제
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) return;

    setLoading(true);
    try {
      await apiFetch<{ ok: true }>(`/admin/blog/categories/${id}`, {
        method: "DELETE",
      });

      alert("카테고리가 삭제되었습니다");
      loadCategories();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : String(err) || "삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  // 취소
  const handleCancel = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
  };

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, categoryId: number) => {
    setDraggedId(categoryId);
    e.dataTransfer.effectAllowed = "move";
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, categoryId: number) => {
    e.preventDefault();
    setDragOverId(categoryId);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // 드롭
  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedCat = flatCategories.find((c) => c.id === draggedId);
    const targetCat = flatCategories.find((c) => c.id === targetId);

    if (!draggedCat || !targetCat) return;

    // 같은 부모 내에서만 순서 변경
    if (draggedCat.parentId !== targetCat.parentId) {
      alert("같은 레벨에서만 순서를 변경할 수 있습니다");
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // 같은 부모의 자식들만 필터링
    const siblings = flatCategories.filter((c) => c.parentId === draggedCat.parentId);

    // 새로운 순서 계산
    const items = siblings.map((cat, index) => {
      let newOrder = index;

      if (cat.id === draggedId) {
        newOrder = targetCat.order;
      } else if (cat.id === targetId) {
        newOrder = draggedCat.order;
      }

      return { id: cat.id, order: newOrder };
    });

    setLoading(true);
    try {
      await apiFetch("/admin/blog/categories/reorder", {
        method: "PUT",
        body: { items },
      });

      loadCategories();
    } catch (err) {
      console.error("Reorder error:", err);
      alert(err instanceof Error ? err.message : String(err) || "순서 변경 실패");
    } finally {
      setLoading(false);
      setDraggedId(null);
      setDragOverId(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 왼쪽: 카테고리 목록 */}
      <div className="flex-1 bg-[var(--card)] rounded-xl border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1" style={mono}>Categories</p>
            <h2 className="text-lg font-semibold text-foreground">카테고리 목록 ({categories.length}개)</h2>
          </div>
        </div>

        {loading && <div className="text-center py-8 text-muted-foreground">로딩 중...</div>}

        {!loading && categories.length === 0 && <div className="text-center py-8 text-muted-foreground">카테고리가 없습니다</div>}

        {!loading && categories.length > 0 && (
          <div className="space-y-1">
            {categories.map((cat) => (
              <CategoryTreeItem key={cat.id} category={cat} onEdit={handleEdit} onDelete={handleDelete} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDrop={handleDrop} isDragging={draggedId === cat.id} isDragOver={dragOverId === cat.id} />
            ))}
          </div>
        )}
      </div>

      {/* 오른쪽: 생성/수정 폼 */}
      <div className="w-full lg:w-[420px] flex-shrink-0 bg-[var(--card)] rounded-xl border border-border p-6">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1" style={mono}>{editingId ? "Edit" : "New"}</p>
        <h2 className="text-lg font-semibold text-foreground mb-4">{editingId ? "카테고리 수정" : "카테고리 생성"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Slug (URL)" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="ex) travel" required disabled={!!editingId} />
          <p className="text-xs text-muted-foreground -mt-2">지정 시: /{formData.slug}</p>

          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="ex) 여행" required />

          <Select
            label="부모 카테고리"
            options={[
              { value: "", label: "최상위 카테고리" },
              ...flatCategories
                .filter((c) => c.id !== editingId && c.depth < 1)
                .map((cat) => ({
                  value: String(cat.id),
                  label: `${"  ".repeat(cat.depth)}${cat.depth > 0 ? "└ " : ""}${cat.name}`,
                })),
            ]}
            value={formData.parentId ? String(formData.parentId) : ""}
            onChange={(value) =>
              setFormData({
                ...formData,
                parentId: value ? Number(value) : null,
              })
            }
          />

          <Input label="Order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} placeholder="ex) 10" />

          <Checkbox checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} label="Public" />

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              아이콘 <span className="text-muted-foreground font-normal">(lucide-react 아이콘 이름, 예: Coffee)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="비워두면 기본 아이콘"
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-[var(--input-background)] text-foreground focus:ring-2 focus:ring-[#23c6a9] focus:border-transparent outline-none transition"
              />
              <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--secondary)" }}>
                <IconPreview name={formData.icon} className="text-foreground" />
              </div>
            </div>
            {formData.icon.trim() && !isValidIconName(formData.icon) && (
              <p className="text-xs text-amber-600 mt-1">이름을 못 찾아서 기본 아이콘으로 대체돼요. 정확한 lucide 아이콘 이름인지 확인해주세요.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">카드 배경색</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.color || "#eeeeee"}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-11 h-11 rounded-lg border border-border cursor-pointer"
                style={{ padding: 2 }}
              />
              <input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="비워두면 기본 배경색"
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-[var(--input-background)] text-foreground focus:ring-2 focus:ring-[#23c6a9] focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="설명"
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          <Button type="submit" loading={loading} fullWidth>
            생성
          </Button>

          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancel} fullWidth>
              취소
            </Button>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>EN: Slug should be lowercase and hyphen-separated.</p>
            <p>JP: slugは小文字＋ハイフン区切りが推奨。</p>
          </div>
        </form>
      </div>
    </div>
  );
}

// 트리 뷰 아이템 (드래그 가능)
function CategoryTreeItem({
  category,
  level = 0,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
}: {
  category: Category;
  level?: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: number, name: string) => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragOver: (e: React.DragEvent, id: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, id: number) => void;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  return (
    <div>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, category.id)}
        onDragOver={(e) => onDragOver(e, category.id)}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop(e, category.id)}
        className={`
          flex items-center justify-between p-3 rounded-lg transition cursor-move
          ${isDragging ? "opacity-40" : ""}
          ${isDragOver ? "border-2" : "hover:bg-[var(--secondary)] border-2 border-transparent"}
        `}
        style={{ marginLeft: level * 24, ...(isDragOver ? { background: "rgba(35,198,169,0.08)", borderColor: "#23c6a9" } : {}) }}
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-muted-foreground cursor-grab">⋮⋮</span>
          <span className="text-muted-foreground">{level > 0 && "└ "}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium text-foreground">{category.name}</div>
              {!category.isPublic && <Badge variant="neutral">비공개</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">
              /{category.slug}
              {category._count && (
                <>
                  {" • "}글 {category._count.posts}개{category._count.children > 0 && <> • 하위 {category._count.children}개</>}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(category)}>
            수정
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(category.id, category.name)}>
            삭제
          </Button>
        </div>
      </div>

      {category.children?.map((child) => (
        <CategoryTreeItem key={child.id} category={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDrop={onDrop} isDragging={isDragging} isDragOver={isDragOver} />
      ))}
    </div>
  );
}
