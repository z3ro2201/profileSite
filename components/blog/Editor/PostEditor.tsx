"use client";
import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/react-editor";
import { useEffect, useRef, useState } from "react";
import type { PostStateProp, PostEditorProp } from "@/types/Posts";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Radio } from "@/components/ui/Radio";
import { Button } from "@/components/ui/Button";

import { AdminCategoryListResponse, Categories } from "@/types/Category";
import { apiFetch } from "@/lib/apiFetch";

const PostEditor = ({ PostType, PostId, PostTitle, PostState, PostContent, PostTag, PostCategoryId }: PostEditorProp) => {
  const editorRef = useRef<Editor>(null);

  const [title, setTitle] = useState<string>(PostTitle ?? "");
  const [categories, setCategories] = useState<Categories[]>([]);
  const [categoryId, setCategoryId] = useState<string>(
    PostCategoryId?.toString() ?? "" // ✅ number를 string으로 변환
  );
  const [tagText, setTagText] = useState<string>(PostTag ?? "");
  const [postState, setPostState] = useState<PostStateProp>(PostState ?? "DRAFT");

  useEffect(() => {
    (async () => {
      const response = await apiFetch<AdminCategoryListResponse>("/admin/blog/categories");
      if (response.ok && response.list) {
        setCategories(response.list);
      }
    })();
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (PostType === "update" && !PostId) return alert("PostId 없음");

    const contentMd = editorRef.current?.getInstance().getMarkdown() ?? "";

    if (!title.trim()) {
      alert("제목을 입력해주세요");
      return;
    }

    if (!contentMd.trim()) {
      alert("내용을 입력해주세요");
      return;
    }

    const tags = tagText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      contentMd,
      tags,
      state: postState,
      authorId: 1, // TODO: 로그인 붙이면 서버에서 가져오게 변경
      categoryId: categoryId ? Number(categoryId) : undefined,
      contentHtml: null,
    };

    try {
      const res =
        PostType === "new"
          ? await fetch("/api/admin/blog/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/blog/posts/${PostId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("저장 실패:", data);
        alert(data?.message ?? "저장 실패");
        return;
      }

      console.log("저장 성공:", data);
      alert("저장되었습니다");

      // 새 글 작성 후 수정 페이지로 이동
      if (PostType === "new" && data?.post?.id) {
        window.location.href = `/admin/blog/posts/${data.post.id}/edit`;
      }
    } catch (err) {
      console.error(err);
      alert("네트워크 오류");
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">글 {PostType === "new" ? "작성" : "수정"}</h1>
        {PostType === "update" && PostId && <span className="text-sm text-gray-500">ID: {PostId}</span>}
      </div>

      {/* 카테고리 + 제목 */}
      <div className="flex gap-3">
        <Select
          name="category"
          className="w-1/4"
          value={categoryId}
          onChange={(value) => setCategoryId(value)}
          placeholder="카테고리"
          options={categories.map((cat) => ({
            value: cat.id.toString(),
            label: cat.name,
          }))}
        />
        <Input type="text" className="flex-1" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력하세요" />
      </div>

      {/* 에디터 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Editor ref={editorRef} initialValue={PostContent ?? ""} previewStyle="vertical" height="600px" initialEditType="markdown" useCommandShortcut={true} />
      </div>

      {/* 태그 */}
      <Input type="text" className="w-full" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="태그 (쉼표로 구분, 예: react, nextjs, typescript)" label="태그" />

      {/* 상태 + 저장 버튼 */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex gap-4">
          {[
            { label: "임시저장", value: "DRAFT" },
            { label: "발행", value: "PUBLISHED" },
            { label: "보관", value: "ARCHIVED" },
          ].map((item) => (
            <Radio key={item.value} name="postState" value={item.value} label={item.label} checked={postState === item.value} onChange={(e) => setPostState(e.target.value as PostStateProp)} />
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            취소
          </Button>
          <Button type="submit" variant="primary">
            {PostType === "new" ? "작성" : "저장"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PostEditor;
