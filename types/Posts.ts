import { PostState } from "@prisma/client";

export type PostStateProp = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type PostEditorProp = {
  PostType: "new" | "update";
  PostId: number | null;
  PostTitle?: string;
  PostState?: PostStateProp;
  PostContent?: string;
  PostTag?: string;
};

export type PostUpsertProp = {
  title: string;
  contentMd: string;
  contentHtml?: string | null;

  state?: PostStateProp;
  categoryId?: number | null;
  tags?: string[];

  authorId: number;
};

// 목록 prop
export type PublicPostListItem = {
  id: number;
  title: string;
  publishedAt: string | null; // ISO string
  createdAt: string;
  updatedAt: string;

  category: {
    slug: string;
    name: string;
  } | null;

  tags: {
    slug: string;
    name: string;
  }[];

  author: {
    name: string | null;
  };
  contentHtml?: string | null;
};

export type PublicPostListResponse = {
  ok: true;
  posts: PublicPostListItem[];
  nextCursor: number | null;
};

// 단건 조회 prop
export type PublicPostDetail = {
  id: number;
  title: string;

  contentMd: string;
  contentHtml: string | null;

  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  category: {
    slug: string;
    name: string;
  } | null;

  tags: {
    slug: string;
    name: string;
  }[];

  author: {
    name: string | null;
  };
};

export type PublicPostDetailResponse = {
  ok: true;
  post: PublicPostDetail;
};
