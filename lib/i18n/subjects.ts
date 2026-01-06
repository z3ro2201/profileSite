import type { Lang } from "./types";

export const BG_SUBJECT_I18N = {
  lostark: {
    ko: "로스트아크",
    ja: "ロストアーク",
    en: "Lost Ark",
  },
  mapelstory: {
    ko: "메이플스토리",
    ja: "メイプルストーリー",
    en: "MapleStory",
  },
  kartrider: {
    ko: "카트라이더",
    ja: "カートライダー",
    en: "KartRider",
  },
  onepiece: {
    ko: "원피스",
    ja: "ワンピース",
    en: "One Piece",
  },
  unchartedwartersonline: {
    ko: "대항해시대온라인",
    ja: "大航海時代 Online",
    en: "Uncharted Waters Online",
  },
} as const;

export type BgSubjectKey = keyof typeof BG_SUBJECT_I18N;
