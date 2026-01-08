export type RecentTagItem = {
  id: number;
  slug: string;
  name: string;
  usedCount: number;
  lastUsedAt: string | null; // ISO
};

export type RecentTagsResponse = {
  ok: true;
  tags: RecentTagItem[];
};
