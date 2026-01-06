import { socialLinks, profiles } from "./s3_menu";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

export function getDict(locale: Locale) {
  return {
    social: socialLinks[locale] ?? socialLinks[DEFAULT_LOCALE],
    profile: profiles[locale] ?? profiles[DEFAULT_LOCALE],
  };
}
