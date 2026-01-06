import type { TitleI18n, Lang } from "./types";
import type { BgSubjectKey } from "./subjects";
import { BG_SUBJECT_I18N } from "./subjects";

export function withSubjectI18n(title: TitleI18n, bgImage: BgSubjectKey, lang: Lang) {
  const subject = BG_SUBJECT_I18N[bgImage]?.[lang];
  return subject ? `${subject} - ${title[lang]}` : title[lang];
}
