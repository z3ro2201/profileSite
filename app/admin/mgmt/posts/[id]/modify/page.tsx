import PostEditorWrapper from "@/components/blog/Editor/PostEditorWrapper.client";
import { apiFetch } from "@/lib/apiFetch";
import { markdownToHtmlWithToc } from "@/lib/markdown";
import { parsePostId } from "@/lib/parsePostId";
import { PublicPostDetailResponse } from "@/types/Posts";

type Props = {
  params: Promise<{ id?: string | string[] }>;
  searchParams?: Promise<{ id?: string }>;
};
const AdminPostModifyPage = async ({ params }: Props) => {
  const postId = parsePostId((await params).id);
  const { post } = await apiFetch<PublicPostDetailResponse>(`/blog/posts/${postId}`, {
    cache: "force-cache",
  });

  const { html, toc } = await markdownToHtmlWithToc(post.contentMd);
  const finalHtml = post.contentHtml ?? html;
  return <PostEditorWrapper postId={postId} post={post} />;
};
export default AdminPostModifyPage;
