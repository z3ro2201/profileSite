"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type BlogUiContextValue = {
  title: string;
  breadcrumb: string[];

  setTitle: (title: string) => void;
  setBreadcrumb: (breadcrumb: string[]) => void;
  reset: () => void;
};

const BlogUiContext = createContext<BlogUiContextValue | null>(null);

export function useBlogUi() {
  const ctx = useContext(BlogUiContext);
  if (!ctx) {
    throw new Error("useBlogUi must be used within BlogUiProvider");
  }
  return ctx;
}

const DEFAULT_TITLE = "Blog";
const DEFAULT_BREADCRUMB = ["Blog"];

export default function BlogProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string>(DEFAULT_TITLE);
  const [breadcrumb, setBreadcrumb] = useState<string[]>(DEFAULT_BREADCRUMB);

  const reset = () => {
    setTitle(DEFAULT_TITLE);
    setBreadcrumb(DEFAULT_BREADCRUMB);
  };

  const value = useMemo(
    () => ({
      title,
      breadcrumb,
      setTitle,
      setBreadcrumb,
      reset,
    }),
    [title, breadcrumb],
  );

  return <BlogUiContext.Provider value={value}>{children}</BlogUiContext.Provider>;
}
