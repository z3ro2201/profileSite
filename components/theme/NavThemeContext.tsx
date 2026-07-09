"use client";

import { createContext, useContext, useEffect, useState } from "react";

type NavThemeContextValue = {
  isDark: boolean;
  toggle: () => void;
};

const NavThemeContext = createContext<NavThemeContextValue | null>(null);

const STORAGE_KEY = "s4-theme";

export function NavThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // localStorage는 브라우저에만 있어서 마운트 후에만 읽음 (SSR에서 읽으면 에러)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회성 하이드레이션
    setIsDark((localStorage.getItem(STORAGE_KEY) ?? "light") === "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <NavThemeContext.Provider value={{ isDark, toggle: () => setIsDark((v) => !v) }}>
      {children}
    </NavThemeContext.Provider>
  );
}

export function useNavTheme() {
  const ctx = useContext(NavThemeContext);
  if (!ctx) {
    throw new Error("useNavTheme은 NavThemeProvider 하위에서만 쓸 수 있습니다.");
  }
  return ctx;
}
