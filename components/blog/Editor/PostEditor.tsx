"use client";
import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/react-editor";
import { useEffect, useRef, useState } from "react";
import type { PostStateProp, PostEditorProp } from "@/types/Posts";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Radio } from "@/components/ui/Radio";

import { AdminCategoryListResponse, Categories } from "@/types/Category";
import { apiFetch } from "@/lib/apiFetch";

const PostEditor = ({ PostType, PostId, PostTitle, PostState, PostContent, PostTag, PostCategoryId }: PostEditorProp) => {
  const editorRef = useRef<Editor>(null);

  const [title, setTitle] = useState<string>(PostTitle ?? "");
  const [categories, setCategories] = useState<Categories[]>([]);
  const [categoryId, setCategoryId] = useState<string>(PostCategoryId?.toString() ?? "");
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
      categoryId: categoryId ? Number(categoryId) : undefined, // undefined면 백엔드에서 null 처리
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
      // TODO: router.push(`/admin/blog/posts/${data.post.id}`) 등으로 이동
    } catch (err) {
      console.error(err);
      alert("네트워크 오류");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-[1.5rem] font-bold">글 {PostType === "new" ? "작성" : "수정"}</h1>

      <div className="w-full flex gap-2 flex-row">
        <Select
          name="category"
          className="w-3/12"
          value={categoryId}
          onChange={(value) => setCategoryId(value)}
          placeholder="카테고리 선택"
          options={categories.map((cat) => ({
            value: cat.id.toString(),
            label: cat.name,
          }))}
        />
        <div className="w-9/12">
          <Input type="text" className="w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력하세요" />
        </div>
      </div>

      <Editor ref={editorRef} initialValue={PostContent ?? ""} previewStyle="vertical" height="600px" initialEditType="markdown" useCommandShortcut={true} />

      <div className="flex flex-col">
        <p className="font-semibold mb-2">파일</p>
        <ul className="p-4 w-full h-[100px] border border-gray-800/20 rounded-lg bg-gray-50"></ul>
      </div>

      <Input type="text" className="w-full" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="태그 (쉼표로 구분)" />

      <div className="flex flex-col">
        <p className="font-semibold mb-2">위치</p>
        <div className="flex gap-2">
          <Input type="text" className="w-full" placeholder="위도" />
          <Input type="text" className="w-full" placeholder="경도" />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-4">
          {[
            { label: "임시저장", value: "DRAFT" },
            { label: "발행됨", value: "PUBLISHED" },
            { label: "보관됨", value: "ARCHIVED" },
          ].map((item) => (
            <Radio key={item.value} name="postState" value={item.value} label={item.label} checked={postState === item.value} onChange={(e) => setPostState(e.target.value as PostStateProp)} />
          ))}
        </div>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          저장
        </button>
      </div>
    </form>
  );
};

export default PostEditor;
