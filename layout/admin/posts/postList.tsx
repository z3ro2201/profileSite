"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Pencil, Trash } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { PostStateType } from "@/lib/post";
import { TEAL, mono } from "@/lib/nav-shared";
import { serif } from "@/app/s4/_lib/theme";
import type { PostStateProp } from "@/types/Posts";

type PostRow = {
  id: number;
  title: string;
  state: PostStateProp;
  createdAt: string;
  category: { id: number; slug: string; name: string } | null;
  tags: { id: number; slug: string; name: string }[];
};

const stateBadgeClass = (state: PostStateProp) =>
  state === "PUBLISHED"
    ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
    : state === "DRAFT"
      ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
      : "bg-[var(--secondary)] text-muted-foreground";

const glassCard: React.CSSProperties = {
  background: "var(--card)",
  borderRadius: 16,
  border: "1px solid var(--border)",
};

export default function PostListLayout({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [searchQ, setSearchQ] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.name.toLowerCase().includes(q)));
  }, [posts, searchQ]);

  const submitDeletePost = async (id: number, title: string) => {
    if (!confirm(`"${title}" 글을 삭제하시겠습니까?`)) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/blog/posts/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "삭제 실패");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1" style={mono}>Content</p>
          <h2 className="text-2xl font-light text-foreground" style={serif}>글 관리</h2>
        </div>
        <Link
          href="/admin/mgmt/posts/write"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: TEAL }}
        >
          <Plus size={14} /> 새 글 작성
        </Link>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="제목 또는 태그 검색…"
          className="w-full rounded-xl border border-border pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-[var(--input-background)] focus:outline-none focus:border-[#23c6a9] transition-colors"
        />
      </div>

      <div style={glassCard} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {["카테고리", "제목", "태그", "작성일", "상태", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <Link href={`/admin/mgmt/posts/${p.id}`} className="text-left hover:text-[#23c6a9] transition-colors font-medium text-foreground line-clamp-1">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t.id} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: "rgba(35,198,169,0.1)", color: TEAL, ...mono }}>
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap" style={mono}>
                    {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] ${stateBadgeClass(p.state)}`} style={mono}>
                      {PostStateType.find((item) => item.code === p.state)?.name ?? p.state}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/mgmt/posts/${p.id}/modify`} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label="수정">
                        <Pencil size={13} />
                      </Link>
                      <button
                        onClick={() => submitDeletePost(p.id, p.title)}
                        disabled={deletingId === p.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                        aria-label="삭제"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    {searchQ ? "검색 결과가 없습니다." : "등록된 글이 없습니다."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
