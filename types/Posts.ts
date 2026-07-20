import { PostState } from "@prisma/client";

export type PostStateProp = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type PostEditorProp = {
  PostType: "new" | "update";
  PostId?: number | null;
  PostTitle?: string;
  PostState?: PostStateProp;
  PostContent?: string;
  PostTag?: string;
  PostCategoryId?: number | null;
  fileIds?: string[];
  PostFiles?: PostFileInfo[];
  PostLat?: number | null;
  PostLng?: number | null;
  PostPlaceName?: string | null;
  PostPlaceAddress?: string | null;
  PostMapOnly?: boolean;
  PostIcon?: string | null;
  PostColor?: string | null;
  PostNoAiSummary?: boolean;
};

export type PostUpsertProp = {
  title: string;
  contentMd: string;
  contentHtml?: string | null;

  state?: PostStateProp;
  categoryId?: number | null;
  tags?: string[];

  authorId: number;
  fileIds?: string[];
  lat?: number;
  lng?: number;
  placeName?: string | null;
  address?: string | null;
  mapOnly?: boolean;
  icon?: string | null;
  color?: string | null;
  noAiSummary?: boolean;
};

export interface PostFileInfo {
  fileId: string;
  role: string | null;
  sort: number;
  file: {
    id: string;
    originalName: string | null;
    objectKey: string;
    mimeType: string | null;
    sizeBytes: bigint | null;
    width: number | null;
    height: number | null;
  };
}

// ========================================
// Public (일반 사용자용)
// ========================================

// 목록 조회
export type PublicPostListItem = {
  id: number;
  title: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  icon?: string | null;
  color?: string | null;

  category: {
    slug: string;
    name: string;
    icon?: string | null;
    color?: string | null;
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

// 단건 조회
export type PublicPostDetail = {
  id: number;
  title: string;
  contentMd: string;
  contentHtml: string | null;
  aiSummary?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  lat: number | null;
  lng: number | null;

  placeName?: string | null;
  address?: string | null;
  mapOnly?: boolean;

  icon?: string | null;
  color?: string | null;

  category: {
    slug: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;

  tags: {
    slug: string;
    name: string;
  }[];

  author: {
    name: string | null;
  };

  thumbnail: {
    objectKey: string;
    mimeType: string | null;
    width: number | null;
    height: number | null;
  } | null;
};

export type PublicPostDetailResponse = {
  ok: true;
  post: PublicPostDetail;
};

// ========================================
// Admin (관리자용)
// ========================================

// 관리자 목록 조회 (모든 상태 포함)
export type AdminPostListItem = {
  id: number;
  title: string;
  state: PostStateProp;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  category: {
    id: number;
    slug: string;
    name: string;
  } | null;

  tags: {
    slug: string;
    name: string;
  }[];

  author: {
    id: number;
    name: string | null;
  };
};

export type AdminPostListResponse = {
  ok: true;
  posts: AdminPostListItem[];
  total: number;
  page?: number;
  limit?: number;
};

// 관리자 단건 조회 (수정용)
export type AdminPostDetail = {
  id: number;
  title: string;
  contentMd: string;
  contentHtml: string | null;
  state: PostStateProp;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  lat?: number;
  lng?: number;
  placeName?: string | null;
  address?: string | null;
  mapOnly?: boolean;
  icon?: string | null;
  color?: string | null;
  noAiSummary?: boolean;

  categoryId: number | null;
  category: {
    id: number;
    slug: string;
    name: string;
  } | null;

  tags: {
    slug: string;
    name: string;
  }[];
  tagsString: string; // 쉼표로 구분된 문자열 (PostEditor용)

  author: {
    id: number;
    name: string | null;
  };

  files?: PostFileInfo[];
};

export type AdminPostDetailResponse = {
  ok: true;
  post: AdminPostDetail;
};

// 생성/수정 성공 응답
export type PostMutationResponse = {
  ok: true;
  post: {
    id: number;
    title: string;
    state: PostStateProp;
    publishedAt: string | null;
    updatedAt: string;
  };
};

// 삭제 성공 응답
export type PostDeleteResponse = {
  ok: true;
  id: number;
};

// 에러 응답
export type PostErrorResponse = {
  ok: false;
  message: string;
};
