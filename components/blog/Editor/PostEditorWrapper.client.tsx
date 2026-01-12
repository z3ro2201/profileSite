"use client";

import { PublicPostDetail } from "@/types/Posts";
import dynamic from "next/dynamic";

type Props = {
  postId?: number;
  post?: PublicPostDetail;
};

const PostEditor = dynamic(() => import("@/components/blog/Editor/PostEditor"), {
  ssr: false,
  loading: () => <div className="p-4">에디터 로딩중...</div>,
});

export default function PostEditorWrapper({ postId, post }: Props) {
  return <PostEditor PostType={postId ? "update" : "new"} PostId={postId ?? null} PostTitle={post?.title} PostContent={post?.contentMd} />;
}
