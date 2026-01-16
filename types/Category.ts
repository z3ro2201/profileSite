export type Categories = {
  id: number;
  name: string;
  slug: string;
};

export type CategoryListResponse = {
  ok: boolean;
  categories: Categories[];
};

export type AdminCategoryListResponse = {
  ok: boolean;
  list: Categories[];
};
