"use client";

import { useRef, useState } from "react";

type PostStateProp = "" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

import PostEditor from "@/components/blog/Editor/PostEditor";
const PostWritePage = () => {
  return (
    <>
      <PostEditor PostType="new" PostId={null} />
    </>
  );
};
export default PostWritePage;
