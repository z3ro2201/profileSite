import type { CSSProperties } from "react";

// s4 페이지들과 FloatingNav(s4 + blog)가 함께 쓰는 브랜드 색/폰트 토큰.
// s4 전용 값(BG, serif, sans, tile 등)은 app/s4/_lib/theme.ts에 그대로 둠.
export const TEAL = "#23c6a9";
export const mono = { fontFamily: "'JetBrains Mono', monospace" } as CSSProperties;

export const PLAYLIST: { title: string; artist: string; ytId: string }[] = [
  {
    ytId: "rxZxOX5LeHU",
    artist: "명탐정 코난 OST (Kuraki Mai)",
    title: "명탐정 코난 OST - 바람의 라라라 (벅차오르는 파워 락 발라드 어레인지 커버) | GrangChe.Ver",
  },
  {
    ytId: "nieI1ZssoA8",
    artist: "명탐정 코난 OST (Kuraki Mai)",
    title: "명탐정 코난 : 제로의 집행인 주제곡 [후쿠야마 마사하루 - 零 -ZERO-] ",
  },
  {
    ytId: "m4UuJWVt4Zc",
    artist: "명탐정 코난 OST (MISIA)",
    title: "명탐정 코난 하이웨이의 타천사 OST : MISIA - 라스트 댄스를 그대와 (ラストダンスあなたと)",
  },
  {
    ytId: "Q4mR65GIrmE",
    artist: "명탐정 코난 OST (MISIA)",
    title: "B’z - 世界はあなたの色になる(세계는 당신의 색이 된다)_명탐정코난: 순흑의 악몽ED",
  },
  {
    ytId: "CPOcUhe3tIk",
    artist: "명탐정 코난 OST (ZARD)",
    title: "명탐정 코난 : 수편선상의 음모 / ZARD - 夏を待つセイル (帆)のように (ZARD - 여름을 기다리는 돛처럼)",
  },
  {
    ytId: "L7Z-8qc07d0",
    artist: "명탐정 코난 OST (いきものがかり)",
    title: "명탐정 코난 : 11번째 스트라이커 / いきものがかり - ハルウタ (이키모노 가카리 - 봄노래)",
  },
  { ytId: "T_MYHHb1Ib0", artist: "로스트아크 OST", title: "모코코 Remix " },
  { ytId: "ffI42h6L_KI", artist: "로스트아크 OST", title: "모코콩 아일랜드 (Mokokong Island) " },
  { ytId: "9iw2NJyV6dg", artist: "로스트아크 OST", title: "모코코마을 (Mokoko Village)" },
  { ytId: "gnm1_MFcwm0", artist: "로스트아크 OST", title: "별빛 등대의 섬(jazz Ver.) (Star Light Island jazz Ver.)" },
  { ytId: "jZwv83Stl60", artist: "로스트아크 OST", title: "라제니스의 노래 (Song of Lazernes)" },
  { ytId: "ENB-BSYCg1c", artist: "로스트아크 OST", title: "Sweet Dreams, My Dear - 소향(SoHyang)" },
  { ytId: "H-Ngv9OVqP8", artist: "로스트아크 OST", title: "아리안오브 (Aryanorb)" },
  { ytId: "WZgiTJova1Q", artist: "로스트아크 OST", title: "위대한 기억의 오르골" },
  { ytId: "7F4QS5OWlG8", artist: "로스트아크 OST", title: "별모래 해변" },
  { ytId: "P0qtL25eD7Q", artist: "로스트아크 OST", title: "그대 기억 하나요?" },
  { ytId: "PwAD4uVeDgU", artist: "로스트아크 OST", title: "해상 낙원 페이토" },
  { ytId: "wsEq1itieOo", artist: "로스트아크 OST", title: "기에나의 바다" },
  { ytId: "btM_zzqtt90", artist: "로스트아크 OST", title: "리베하임" },
  { ytId: "YdMZeIdpnNw", artist: "로스트아크 OST", title: "로맨틱 웨폰" },
  { ytId: "8sxhDyBlpCk", artist: "로스트아크 OST", title: "Dreaming Your Melody" },
  { ytId: "axmFywZvrto", artist: "로스트아크 OST", title: "30년 전의 나에게 (To Me, My Childhood)" },
  { ytId: "_jg3wNlGO0Y", artist: "로스트아크 OST", title: "Dear Friends - 효린(HYOLYN) " },
  { ytId: "_AnFWUowPfM", artist: "로스트아크 OST", title: "반짝이는 바람 (Twinkling Winds)" },
  { ytId: "loevvMFPjms", artist: "로스트아크 OST", title: "메리 아르고스마스! (Merry Argosmas!)" },
  { ytId: "i3R_YwJQWBk", artist: "로스트아크 OST", title: "행운의 아크랜드 (Ark Wonderland)" },
  { ytId: "hs-tG_JvMgA", artist: "로스트아크 OST", title: "욕망의 무도회 (Ball of Desire)" },
  { ytId: "v2h0Qy1oCi0", artist: "로스트아크 OST", title: "여름밤의 축제 섬 (Summer Night Festival)" },
  { ytId: "fzfAaoNrbb8", artist: "로스트아크 OST", title: "피어나는 불꽃의 순간 (A Moment of Blooming Fires)" },
  { ytId: "m3aJ3nKyfFQ", artist: "로스트아크 OST", title: "새벽을 지키는 땅 (Land that Guards the Dawn)" },
  { ytId: "z6PKIr9AAVg", artist: "로스트아크 OST", title: "모두의 소원을 담아 (A Tearful For all good Wishes)" },
  { ytId: "RlQbmF8DiU0", artist: "로스트아크 OST", title: "다시, 겨울방학 (Again, Winter Vacation) - feat. 보라미유" },
  { ytId: "EG-ki5AtNno", artist: "로스트아크 OST", title: "겨울 캠핑 (Winter Camping)" },
  { ytId: "dTuVWfbnPKk", artist: "로스트아크 OST", title: "모여드는 작은 빛 (Little Light that Gathers)" },
  {
    ytId: "v8aX4sQjSpU",
    artist: "메이플스토리 OST",
    title: "The Raindrop Flower [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
  },
  {
    ytId: "ODOEt3_A6qM",
    artist: "메이플스토리 OST",
    title: "The Queen's Garden [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
  },
  {
    ytId: "kizi98UD5ak",
    artist: "메이플스토리 OST",
    title: "The Raindrop Flower (Jazz Ver.)｜메이플스토리 (MapleStory) OST : Jazz of Maple",
  },
  {
    ytId: "NKt5NMCyZvg",
    artist: "메이플스토리 OST",
    title: "The Tune of The Azure Light [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
  },
  {
    ytId: "WihYiw2S8hU",
    artist: "메이플스토리 OST",
    title: "Start The Adventure (Orchestral Ver.) [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
  },
  {
    ytId: "SWOEVxpuiqE",
    artist: "메이플스토리 OST",
    title: "MapleStory Symphony in Budapest - When The Morning Comes",
  },
  {
    ytId: "r2cx06CLBNA",
    artist: "카트라이더 OST",
    title: "카트라이더 대저택 풀 오케스트라 Kartrider Mansion Dance Battle OST",
  },
  {
    ytId: "FzH8gXzB4Xw",
    artist: "원피스 OST",
    title: '원피스 "우리의 꿈" 오케스트라 편곡 버전 (with Cubase)',
  },
  { ytId: "RRHw3rvTnxI", artist: "원피스 OST", title: "세상 저 끝까지 - 원피스 극장판" },
  { ytId: "wFkRpaldkh4", artist: "대항해시대온라인 OST", title: "Uncharted Waters Online OST - Login title" },
  { ytId: "vMtJnEQ59Sg", artist: "대항해시대온라인 OST", title: "Uncharted Waters Online OST - London" },
  {
    ytId: "ER0olOF_LKE",
    artist: "대항해시대온라인 OST",
    title: "Uncharted waters Online OST- Apennines by land (Venice)",
  },
  { ytId: "7ICS-FjUKgs", artist: "대항해시대온라인 OST", title: "Uncharted waters Online OST- 마르세이유" },
  {
    ytId: "yWZkOtriVVY",
    artist: "로스트아크 OST",
    title: "10_레온하트 (크리스마스버전) (Leonhart X-mas Ver.) / 로스트아크",
  },
];
