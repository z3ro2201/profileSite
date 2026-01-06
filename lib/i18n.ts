export const LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";

export function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}
