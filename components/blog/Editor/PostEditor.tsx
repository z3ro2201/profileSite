"use client";
import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/react-editor";
import { useEffect, useRef, useState } from "react";
import type { PostStateProp, PostEditorProp, PostFileInfo } from "@/types/Posts";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Radio } from "@/components/ui/Radio";
import { Button } from "@/components/ui/Button";

import { AdminCategoryListResponse, Categories } from "@/types/Category";
import { apiFetch } from "@/lib/apiFetch";

const PostEditor = ({ PostType, PostId, PostTitle, PostState, PostContent, PostTag, PostCategoryId, PostFiles }: PostEditorProp) => {
  const editorRef = useRef<Editor>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState<string>(PostTitle ?? "");
  const [categories, setCategories] = useState<Categories[]>([]);
  const [categoryId, setCategoryId] = useState<string>(PostCategoryId?.toString() ?? "");
  const [tagText, setTagText] = useState<string>(PostTag ?? "");
  const [postState, setPostState] = useState<PostStateProp>(PostState ?? "DRAFT");

  // 업로드된 파일 ID 추적 (기존 파일 포함)
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>(PostFiles?.map((f) => f.fileId) ?? []);

  // 업로드된 파일 정보 (UI 표시용)
  const [uploadedFiles, setUploadedFiles] = useState<PostFileInfo[]>(PostFiles ?? []);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await apiFetch<AdminCategoryListResponse>("/admin/blog/categories");
      if (response.ok && response.list) {
        setCategories(response.list);
      }
    })();
  }, []);

  // 이미지 업로드 핸들러 (Toast UI Editor용)
  const handleImageUpload = async (blob: Blob | File, callback: (url: string, altText: string) => void) => {
    const formData = new FormData();
    formData.append("image", blob);

    try {
      const data = await apiFetch<{ url: string; fileId: string; file?: any }>("/admin/blog/posts/upload", {
        method: "POST",
        body: formData,
      });

      // 업로드된 파일 ID 저장
      setUploadedFileIds((prev) => [...prev, data.fileId]);

      // Toast UI Editor에 이미지 URL 전달
      callback(data.url, "");
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  // 파일 업로드 핸들러 (별도 업로드 버튼용)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("image", file);

        const data = await apiFetch<{ url: string; fileId: string; file?: any }>("/admin/blog/posts/upload", {
          method: "POST",
          body: formData,
        });

        // 파일 ID 추가
        setUploadedFileIds((prev) => [...prev, data.fileId]);

        // 파일 정보 추가 (UI 표시용)
        const newFileInfo: PostFileInfo = {
          fileId: data.fileId,
          role: "content",
          sort: uploadedFiles.length,
          file: {
            id: data.fileId,
            originalName: file.name,
            objectKey: data.url,
            mimeType: file.type,
            sizeBytes: BigInt(file.size),
            width: null,
            height: null,
          },
        };
        setUploadedFiles((prev) => [...prev, newFileInfo]);
      }

      alert(`${files.length}개 파일이 업로드되었습니다.`);

      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("File upload failed:", error);
      alert("파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 삭제
  const handleFileRemove = (fileId: string) => {
    setUploadedFileIds((prev) => prev.filter((id) => id !== fileId));
    setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
  };

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
      authorId: 1,
      categoryId: categoryId ? Number(categoryId) : undefined,
      contentHtml: null,
      fileIds: uploadedFileIds,
    };

    try {
      const data =
        PostType === "new"
          ? await apiFetch("/admin/blog/posts", {
              method: "POST",
              body: payload,
            })
          : await apiFetch(`/admin/blog/posts/${PostId}`, {
              method: "PUT",
              body: payload,
            });

      console.log("저장 성공:", data);
      alert("저장되었습니다");

      if (PostType === "new" && data?.post?.id) {
        window.location.href = `/admin/blog/posts/${data.post.id}`;
      }
    } catch (error: any) {
      console.error("저장 실패:", error);
      alert(error?.message ?? "저장 실패");
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
        <Editor
          ref={editorRef}
          initialValue={PostContent ?? ""}
          previewStyle="vertical"
          height="600px"
          initialEditType="markdown"
          useCommandShortcut={true}
          hooks={{
            addImageBlobHook: handleImageUpload,
          }}
        />
      </div>

      {/* 🆕 파일 업로드 섹션 */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">첨부 파일</h3>
          <div>
            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,application/pdf,.doc,.docx,.zip" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? "업로드 중..." : "파일 추가"}
              </Button>
            </label>
          </div>
        </div>

        {/* 업로드된 파일 목록 */}
        {uploadedFiles.length > 0 ? (
          <div className="space-y-2">
            {uploadedFiles.map((pf) => (
              <div key={pf.fileId} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-3">
                  {pf.file.mimeType?.startsWith("image/") && <img src={pf.file.objectKey} alt={pf.file.originalName ?? ""} className="w-12 h-12 object-cover rounded" />}
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">{pf.file.originalName}</p>
                    <p className="text-gray-500 text-xs">
                      {pf.file.mimeType} • {pf.file.sizeBytes ? `${Number(pf.file.sizeBytes) / 1024}KB` : ""}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => handleFileRemove(pf.fileId)} className="text-red-500 hover:text-red-700 text-sm px-2 py-1">
                  삭제
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">첨부된 파일이 없습니다.</p>
        )}
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
