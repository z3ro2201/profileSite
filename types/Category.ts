export type Category = {
  id: number;
  name: string;
  slug: string;
  depth: number;
  order: number;
  parentId?: number | null;
  parent?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  children?: Category[];
};

export type Categories = Category;

export type CategoryListResponse = {
  ok: boolean;
  categories: Categories[];
};

export type AdminCategoryListResponse = {
  ok: boolean;
  list: Categories[];
};
