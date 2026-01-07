"use client";

import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n";

function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export function resolveLocaleClient(): Locale {
  // 1) 쿠키 우선
  const cookieLang = getCookie("lang");
  if (cookieLang && isLocale(cookieLang)) return cookieLang;

  // 2) 브라우저 언어
  const browserLang = navigator.language?.split(",")?.[0]?.split("-")?.[0];
  if (browserLang && isLocale(browserLang)) return browserLang as Locale;

  return DEFAULT_LOCALE;
}
