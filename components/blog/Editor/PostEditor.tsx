"use client";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";

import { Editor } from "@toast-ui/react-editor";
import { useEffect, useRef, useState } from "react";
import { parseFrontmatter } from "@/lib/frontmatter";
import { resolveIcon, isValidIconName } from "@/lib/icon-registry";
import type { PostStateProp, PostEditorProp, PostFileInfo } from "@/types/Posts";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Radio } from "@/components/ui/Radio";
import { Button } from "@/components/ui/Button";

import { AdminCategoryListResponse, Categories } from "@/types/Category";
import { apiFetch } from "@/lib/apiFetch";
import { Checkbox } from "@/components/ui/Checkbox";

// resolveIcon()을 JSX 안에서 바로 <Icon .../>으로 안 쓰고 이 컴포넌트로 감싸서 렌더링.
// (인라인으로 쓰면 React Compiler가 "렌더 중 컴포넌트를 만든다"고 오인해서 경고를 냄)
function IconPreview({ name, size = 18, className }: { name?: string; size?: number; className?: string }) {
  const Icon = resolveIcon(name);
  // eslint-disable-next-line react-hooks/static-components -- 아이콘 이름 자유 입력을 지원하려면 동적 조회가 필수라 의도된 패턴
  return <Icon size={size} className={className} />;
}

const PostEditor = ({ PostType, PostId, PostTitle, PostState, PostContent, PostTag, PostCategoryId, PostFiles, PostLat, PostLng, PostPlaceName, PostPlaceAddress, PostMapOnly, PostIcon, PostColor, PostNoAiSummary }: PostEditorProp) => {
  const editorRef = useRef<Editor>(null);

  // 관리자 셸(layout/admin/mainLayout.tsx)의 다크모드 토글은 상위 wrapper div에 .dark 클래스를
  // 붙이는 방식이라, 여기서는 조상 중 .dark가 있는지 감지해서 Toast UI 에디터 테마를 맞춘다.
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const checkDark = () => setIsDarkTheme(!!editorWrapRef.current?.closest(".dark"));
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: true });
    return () => observer.disconnect();
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState<string>(PostTitle ?? "");
  const [categories, setCategories] = useState<Categories[]>([]);
  const [categoryId, setCategoryId] = useState<string>(PostCategoryId?.toString() ?? "");
  const [tagText, setTagText] = useState<string>(PostTag ?? "");
  const [postState, setPostState] = useState<PostStateProp>(PostState ?? "DRAFT");
  const [lat, setLat] = useState<number | null>(PostLat ?? null);
  const [lng, setLng] = useState<number | null>(PostLng ?? null);
  const [placeName, setPlaceName] = useState<string>(PostPlaceName ?? "");
  const [placeAddress, setPlaceAddress] = useState<string>(PostPlaceAddress ?? "");
  const [mapOnly, setMapOnly] = useState<boolean>(PostMapOnly ?? false);
  const [icon, setIcon] = useState<string>(PostIcon ?? "");
  const [color, setColor] = useState<string>(PostColor ?? "");
  const [noAiSummary, setNoAiSummary] = useState<boolean>(PostNoAiSummary ?? false);

  // 업로드된 파일 ID 추적 (기존 파일 포함)
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>(PostFiles?.map((f) => f.fileId) ?? []);

  // 업로드된 파일 정보 (UI 표시용)
  const [uploadedFiles, setUploadedFiles] = useState<PostFileInfo[]>(PostFiles ?? []);

  const [isUploading, setIsUploading] = useState(false);

  // frontmatter(---title: ...---) 붙여넣으면 제목/카테고리/태그 자동 채우고 본문에서 제거
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importWarnings, setImportWarnings] = useState<string[]>([]);

  const handleImport = () => {
    const { data, body } = parseFrontmatter(importText);
    const warnings: string[] = [];

    if (typeof data.title === "string" && data.title) setTitle(data.title);

    if (typeof data.category === "string" && data.category) {
      const matched = categories.find((c) => c.name === data.category || c.slug === data.category);
      if (matched) setCategoryId(matched.id.toString());
      else warnings.push(`카테고리 "${data.category}"를 찾을 수 없어 직접 선택해주세요.`);
    }

    if (Array.isArray(data.tags) && data.tags.length > 0) {
      setTagText(data.tags.join(", "));
    } else if (typeof data.tags === "string" && data.tags) {
      setTagText(data.tags);
    }

    // description/date/series/part는 지금 글 스키마에 대응하는 입력칸이 없어서 자동 반영 안 됨 — 필요하면 본문에 남겨둠
    const unmapped = Object.keys(data).filter((k) => !["title", "category", "tags"].includes(k));
    if (unmapped.length > 0) {
      warnings.push(`"${unmapped.join(", ")}" 항목은 대응하는 입력칸이 없어서 자동으로 안 채워졌어요.`);
    }

    editorRef.current?.getInstance().setMarkdown(body, false);
    setImportWarnings(warnings);
    if (warnings.length === 0) {
      setImportOpen(false);
      setImportText("");
    }
  };


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

    if (!mapOnly && !contentMd.trim()) {
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
      lat,
      lng,
      placeName: placeName,
      address: placeAddress,
      mapOnly,
      icon: icon.trim() || null,
      color: color.trim() || null,
      noAiSummary,
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

      alert("저장되었습니다");

      if (PostType === "new" && data?.post?.id) {
        window.location.href = `/admin/mgmt/posts/${data.post.id}`;
      }
      if (PostType === "update" && PostId) {
        window.location.href = `/admin/mgmt/posts/${PostId}`;
      }
    } catch (error: any) {
      console.error("저장 실패:", error);
      alert(error?.message ?? "저장 실패");
    }
  };

  // 파일 삽입
  const insertFileToEditor = (file: PostFileInfo) => {
    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;

    const mimeType = file.file.mimeType || "";
    const url = file.file.objectKey;
    const fileName = file.file.originalName || "file";

    if (mimeType.startsWith("image/")) {
      // 이미지 삽입 (마크다운)
      editorInstance.insertText(`![${fileName}](${url})\n`);
    } else if (mimeType.startsWith("video/")) {
      // 동영상 삽입 (HTML)
      const videoHtml = `
<video controls width="100%" style="max-width: 800px;">
  <source src="${url}" type="${mimeType}">
  Your browser does not support the video tag.
</video>

`;
      editorInstance.insertText(videoHtml);
    } else {
      // 기타 파일 (다운로드 링크)
      editorInstance.insertText(`[📎 ${fileName}](${url})\n`);
    }

    alert("본문에 삽입되었습니다.");
  };

  const isNumeric = (v: string) => /^-?\d*(\.\d*)?$/.test(v); // 음수 + 소수 허용

  return (
    <form onSubmit={onSubmit} className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">글 {PostType === "new" ? "작성" : "수정"}</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            frontmatter로 가져오기
          </button>
          {PostType === "update" && PostId && <span className="text-sm text-muted-foreground">ID: {PostId}</span>}
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-2xl rounded-xl border border-border p-5 space-y-3" style={{ background: "var(--card)" }}>
            <p className="text-sm font-semibold text-foreground">frontmatter 포함 글 붙여넣기</p>
            <p className="text-xs text-muted-foreground">
              {"---title: ...\ncategory: ...\ntags: [...]---"} 형식의 글 전체를 붙여넣으면, 제목/카테고리/태그를 자동으로 채우고 본문에서는 지워줘요.
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              placeholder={"---\ntitle: \"...\"\ncategory: Infra\ntags: [a, b]\n---\n\n본문..."}
              className="w-full rounded-lg border border-border p-3 text-xs font-mono bg-[var(--input-background)] text-foreground focus:outline-none focus:ring-2 focus:ring-[#23c6a9]"
            />
            {importWarnings.length > 0 && (
              <ul className="text-xs text-amber-600 list-disc pl-4 space-y-0.5">
                {importWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setImportOpen(false);
                  setImportText("");
                  setImportWarnings([]);
                }}
                className="text-sm px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!importText.trim()}
                className="text-sm px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "#23c6a9" }}
              >
                가져오기
              </button>
            </div>
          </div>
        </div>
      )}
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
      <div ref={editorWrapRef} className="border border-border rounded-lg overflow-hidden">
        <Editor
          ref={editorRef}
          initialValue={PostContent ?? ""}
          previewStyle="vertical"
          height="600px"
          initialEditType="markdown"
          theme={isDarkTheme ? "dark" : "light"}
          useCommandShortcut={true}
          hooks={{
            addImageBlobHook: handleImageUpload,
          }}
        />
      </div>
      {/* 🆕 파일 업로드 섹션 */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">첨부 파일</h3>
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
            {uploadedFiles.map((pf) => {
              const mimeType = pf.file.mimeType || "";
              const isImage = mimeType.startsWith("image/");
              const isVideo = mimeType.startsWith("video/");

              return (
                <div key={pf.fileId} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded border border-border">
                  <div className="flex items-center gap-3 flex-1">
                    {/* 썸네일 */}
                    {isImage && <img src={pf.file.objectKey} alt={pf.file.originalName ?? ""} className="w-16 h-16 object-cover rounded" />}
                    {isVideo && (
                      <div className="w-16 h-16 bg-[var(--muted)] rounded flex items-center justify-center">
                        <span className="text-2xl">🎥</span>
                      </div>
                    )}
                    {!isImage && !isVideo && (
                      <div className="w-16 h-16 bg-[var(--muted)] rounded flex items-center justify-center">
                        <span className="text-2xl">📎</span>
                      </div>
                    )}

                    {/* 파일 정보 */}
                    <div className="text-sm flex-1">
                      <p className="font-medium text-foreground">{pf.file.originalName}</p>
                      <p className="text-muted-foreground text-xs">
                        {pf.file.mimeType}
                        {pf.file.sizeBytes && ` • ${(Number(pf.file.sizeBytes) / 1024).toFixed(1)}KB`}
                      </p>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex gap-2">
                    {/* 🆕 본문 삽입 버튼 */}
                    <button type="button" onClick={() => insertFileToEditor(pf)} className="px-3 py-1 text-sm text-[#23c6a9] hover:opacity-80 hover:bg-[rgba(35,198,169,0.08)] rounded border border-[rgba(35,198,169,0.3)]">
                      {isImage && "🖼️ 이미지 삽입"}
                      {isVideo && "🎥 동영상 삽입"}
                      {!isImage && !isVideo && "📎 링크 삽입"}
                    </button>

                    {/* 삭제 버튼 */}
                    <button type="button" onClick={() => handleFileRemove(pf.fileId)} className="px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">첨부된 파일이 없습니다.</p>
        )}
      </div>
      {/* 태그 */}
      <Input type="text" className="w-full" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="태그 (쉼표로 구분, 예: react, nextjs, typescript)" label="태그" />

      {/* 아이콘/색상 (카테고리 기본값을 이 글만 덮어쓰고 싶을 때) */}
      <div className="pt-4 border-t border-border space-y-4">
        <p className="text-xs text-muted-foreground">비워두면 카테고리에 설정된 기본 아이콘/색상을 그대로 씁니다.</p>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            아이콘 <span className="text-muted-foreground font-normal">(lucide-react 이름, 예: Coffee)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="비워두면 카테고리 기본값"
              className="flex-1 px-4 py-3 border border-border rounded-lg bg-[var(--input-background)] text-foreground focus:ring-2 focus:ring-[#23c6a9] focus:border-transparent outline-none transition"
            />
            <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--secondary)" }}>
              <IconPreview name={icon} className="text-foreground" />
            </div>
          </div>
          {icon.trim() && !isValidIconName(icon) && <p className="text-xs text-amber-600 mt-1">이름을 못 찾아서 기본 아이콘으로 대체돼요.</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">카드 배경색</label>
          <div className="flex items-center gap-2">
            <input type="color" value={color || "#eeeeee"} onChange={(e) => setColor(e.target.value)} className="w-11 h-11 rounded-lg border border-border cursor-pointer" style={{ padding: 2 }} />
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="비워두면 카테고리 기본값"
              className="flex-1 px-4 py-3 border border-border rounded-lg bg-[var(--input-background)] text-foreground focus:ring-2 focus:ring-[#23c6a9] focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* 위치정보 */}
      <div className="flex flex-col pt-4 border-t border-border gap-4">
        <div className="w-full">
          <Checkbox checked={mapOnly} onChange={() => setMapOnly((prev) => !prev)} label="본문 작성없이 장소만 기록" />
        </div>
        <div className="pt-4 w-full border-t border-border">
          <Input
            type="text"
            value={placeName ?? ""}
            onChange={(e) => {
              setPlaceName(e.target.value);
            }}
            label="장소명(PlaceName)"
          />
        </div>
        <div className="flex pt-4 justify-between items-center gap-4 border-t border-border">
          <div className="w-full">
            <Input
              type="text"
              value={lat ?? ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (!isNumeric(v)) return; // ❌ 숫자 아니면 무시
                setLat(v === "" || v === "-" || v === "." ? null : Number(v));
              }}
              label="위도(Latitude)"
            />
          </div>
          <div className="w-full">
            <Input
              type="text"
              value={lng ?? ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (!isNumeric(v)) return;
                setLng(v === "" || v === "-" || v === "." ? null : Number(v));
              }}
              label="경도(Longtitude)"
            />
          </div>
        </div>
        <div className="w-full pt-4 border-t border-border">
          <Input
            type="text"
            value={placeAddress ?? ""}
            onChange={(e) => {
              setPlaceAddress(e.target.value);
            }}
            label="주소"
          />
        </div>
      </div>

      {/* 상태 + 저장 버튼 */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border">
        <Checkbox checked={noAiSummary} onChange={(e) => setNoAiSummary(e.target.checked)} label="AI 요약 사용 안 함 (체크하면 발행해도 요약을 만들지 않음)" />

        <div className="flex justify-between items-center">
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
      </div>
    </form>
  );
};

export default PostEditor;
