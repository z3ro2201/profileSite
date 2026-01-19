"use client";

import { AdminPostDetail } from "@/types/Posts";
import dynamic from "next/dynamic";

type Props = {
  postId?: number;
  post?: AdminPostDetail;
};

const PostEditor = dynamic(() => import("@/components/blog/Editor/PostEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">에디터 로딩중...</p>
      </div>
    </div>
  ),
});

export default function PostEditorWrapper({ postId, post }: Props) {
  return (
    <PostEditor
      PostType={postId ? "update" : "new"}
      PostId={postId ?? null}
      PostTitle={post?.title}
      PostContent={post?.contentMd}
      PostState={post?.state}
      PostTag={post?.tagsString}
      PostCategoryId={post?.categoryId ?? undefined}
      PostFiles={post?.files} // 🆕 추가
    />
  );
}
