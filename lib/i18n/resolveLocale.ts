import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n";

export async function resolveLocale(): Promise<Locale> {
  // 1) 쿠키 우선
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  if (isLocale(cookieLang)) return cookieLang;

  // 2) 브라우저 언어
  const headerStore = await headers();
  const acceptLang = headerStore.get("accept-language");
  const browserLang = acceptLang?.split(",")?.[0]?.split("-")?.[0];
  if (isLocale(browserLang)) return browserLang;

  return DEFAULT_LOCALE;
}
