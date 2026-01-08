"use client";
import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/react-editor";
import { useRef, useState } from "react";
import type { PostStateProp, PostEditorProp } from "@/types/Posts";

const PostEditor = ({ PostType, PostId, PostTitle, PostState, PostContent, PostTag }: PostEditorProp) => {
  const editorRef = useRef<Editor>(null);

  const [title, setTitle] = useState<string>(PostTitle ?? "");
  const [tagText, setTagText] = useState<string>(PostTag ?? "");
  const [postState, setPostState] = useState<PostStateProp>(PostState ?? "DRAFT");
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (PostType === "update" && !PostId) return alert("PostId 없음");

    const contentMd = editorRef.current?.getInstance().getMarkdown() ?? "";

    const tags = tagText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      contentMd,
      tags,
      state: postState, // "DRAFT" | "PUBLISHED" | "ARCHIVED"
      authorId: 1, // TODO: 로그인 붙이면 서버에서 가져오게 변경
      // categoryId: selectedCategoryId ?? null,
      // contentHtml: null,
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
      // 예: router.push(`/blog/${data.post.id}`)
    } catch (err) {
      console.error(err);
      alert("네트워크 오류");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-[1.5rem] font-bold">글 {PostType === "new" ? "작성" : "수정"}</h1>
      <input type="text" className="block my-2 p-2 w-full border border-gray-800/20 rounded-lg" value={title} onChange={(event) => setTitle(event.target.value)} />
      <Editor ref={editorRef} initialValue={PostContent ?? ""} previewStyle="vertical" height="600px" initialEditType="markdown" useCommandShortcut={true} />
      <input type="text" className="block my-2 p-2 w-full border border-gray-800/20 rounded-lg" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="태그 ,로 구분" />
      <div className="flex justify-between items-center">
        <div>
          <input type="radio" id="radioPostStateDraft" name="postState" value="DRAFT" onChange={(e) => setPostState("DRAFT")} checked={postState === "DRAFT"} />
          <label htmlFor="radioPostStateDraft">작성중</label>
          <input type="radio" id="radioPostStatePublished" name="postState" value="PUBLISHED" onChange={() => setPostState("PUBLISHED")} checked={postState === "PUBLISHED"} />
          <label htmlFor="radioPostStatePublished">공개</label>
          <input type="radio" id="radioPostStateArchived" name="postState" value="ARCHIVED" onChange={() => setPostState("ARCHIVED")} checked={postState === "ARCHIVED"} />
          <label htmlFor="radioPostStateArchived">보관</label>
        </div>
        <button type="submit">저장</button>
      </div>
    </form>
  );
};
export default PostEditor;
