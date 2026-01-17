import PostEditorWrapper from "@/components/blog/Editor/PostEditorWrapper.client";
import { apiFetch } from "@/lib/apiFetch";
import { parsePostId } from "@/lib/parsePostId";
import { AdminPostDetailResponse } from "@/types/Posts"; // ✅ 변경

type Props = {
  params: Promise<{ id?: string | string[] }>;
  searchParams?: Promise<{ id?: string }>;
};

const AdminPostModifyPage = async ({ params }: Props) => {
  const postId = parsePostId((await params).id);

  // ✅ AdminPostDetailResponse 사용
  const { post } = await apiFetch<AdminPostDetailResponse>(`/admin/blog/posts/${postId}`, {
    cache: "no-store", // ✅ 관리자 페이지는 항상 최신 데이터
  });

  return <PostEditorWrapper postId={postId} post={post} />;
};

export default AdminPostModifyPage;
