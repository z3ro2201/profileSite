"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type AdminUiContextValue = {
  title: string;
  breadcrumb: string[];

  setTitle: (title: string) => void;
  setBreadcrumb: (breadcrumb: string[]) => void;
  reset: () => void;
};

const AdminUiContext = createContext<AdminUiContextValue | null>(null);

export function useAdminUi() {
  const ctx = useContext(AdminUiContext);
  if (!ctx) {
    throw new Error("useAdminUi must be used within AdminUiProvider");
  }
  return ctx;
}

const DEFAULT_TITLE = "Admin";
const DEFAULT_BREADCRUMB = ["Admin"];

export default function AdminUiProvider({ children }: { children: ReactNode }) {
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
    [title, breadcrumb]
  );

  return <AdminUiContext.Provider value={value}>{children}</AdminUiContext.Provider>;
}
