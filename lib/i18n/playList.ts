export type TitleI18n = { ko: string; ja: string; en: string };

export type PlayItem = {
  link: string;
  bgImage: "lostark" | "maplestory" | "kartrider" | "onepiece" | "unchartedwartersonline";
  title: TitleI18n;
};

export const playList: PlayItem[] = [
  { link: "T_MYHHb1Ib0", bgImage: "lostark", title: { ko: "모코코 Remix ", ja: "모코코 Remix ", en: "모코코 Remix " } },
  { link: "ffI42h6L_KI", bgImage: "lostark", title: { ko: "모코콩 아일랜드 (Mokokong Island) ", ja: "모코콩 아일랜드 (Mokokong Island) ", en: "Mokokong Island" } },
  { link: "9iw2NJyV6dg", bgImage: "lostark", title: { ko: "모코코마을 (Mokoko Village)", ja: "모코코마을 (Mokoko Village)", en: "Mokoko Village" } },
  { link: "gnm1_MFcwm0", bgImage: "lostark", title: { ko: "별빛 등대의 섬(jazz Ver.) (Star Light Island jazz Ver.)", ja: "별빛 등대의 섬(jazz Ver.) (Star Light Island jazz Ver.)", en: "Star Light Island jazz Ver." } },
  { link: "jZwv83Stl60", bgImage: "lostark", title: { ko: "라제니스의 노래 (Song of Lazernes) ", ja: "라제니스의 노래 (Song of Lazernes) ", en: "Song of Lazernes" } },
  { link: "ENB-BSYCg1c", bgImage: "lostark", title: { ko: "Sweet Dreams, My Dear - 소향(SoHyang)", ja: "Sweet Dreams, My Dear - 소향(SoHyang)", en: "Sweet Dreams, My Dear - SoHyang" } },
  { link: "H-Ngv9OVqP8", bgImage: "lostark", title: { ko: "아리안오브 (Aryanorb)", ja: "아리안오브 (Aryanorb)", en: "Aryanorb" } },
  { link: "WZgiTJova1Q", bgImage: "lostark", title: { ko: "위대한 기억의 오르골", ja: "위대한 기억의 오르골", en: "위대한 기억의 오르골" } },
  { link: "7F4QS5OWlG8", bgImage: "lostark", title: { ko: "별모래 해변", ja: "별모래 해변", en: "별모래 해변" } },
  { link: "P0qtL25eD7Q", bgImage: "lostark", title: { ko: "그대 기억 하나요?", ja: "그대 기억 하나요?", en: "그대 기억 하나요?" } },
  { link: "PwAD4uVeDgU", bgImage: "lostark", title: { ko: "해상 낙원 페이토", ja: "해상 낙원 페이토", en: "해상 낙원 페이토" } },
  { link: "wsEq1itieOo", bgImage: "lostark", title: { ko: "기에나의 바다", ja: "기에나의 바다", en: "기에나의 바다" } },
  { link: "btM_zzqtt90", bgImage: "lostark", title: { ko: "리베하임", ja: "리베하임", en: "리베하임" } },
  { link: "YdMZeIdpnNw", bgImage: "lostark", title: { ko: "로맨틱 웨폰", ja: "로맨틱 웨폰", en: "로맨틱 웨폰" } },
  { link: "8sxhDyBlpCk", bgImage: "lostark", title: { ko: "Dreaming Your Melody", ja: "Dreaming Your Melody", en: "Dreaming Your Melody" } },
  { link: "axmFywZvrto", bgImage: "lostark", title: { ko: "30년 전의 나에게 (To Me, My Childhood)", ja: "30년 전의 나에게 (To Me, My Childhood)", en: "To Me, My Childhood" } },
  { link: "_jg3wNlGO0Y", bgImage: "lostark", title: { ko: "Dear Friends - 효린(HYOLYN) ", ja: "Dear Friends - 효린(HYOLYN) ", en: "Dear Friends - HYOLYN" } },
  { link: "_AnFWUowPfM", bgImage: "lostark", title: { ko: "반짝이는 바람 (Twinkling Winds)", ja: "반짝이는 바람 (Twinkling Winds)", en: "Twinkling Winds" } },
  { link: "loevvMFPjms", bgImage: "lostark", title: { ko: "메리 아르고스마스! (Merry Argosmas!) ", ja: "메리 아르고스마스! (Merry Argosmas!) ", en: "Merry Argosmas!" } },
  { link: "i3R_YwJQWBk", bgImage: "lostark", title: { ko: "행운의 아크랜드 (Ark Wonderland)", ja: "행운의 아크랜드 (Ark Wonderland)", en: "Ark Wonderland" } },
  { link: "hs-tG_JvMgA", bgImage: "lostark", title: { ko: "욕망의 무도회 (Ball of Desire) ", ja: "욕망의 무도회 (Ball of Desire) ", en: "Ball of Desire" } },
  { link: "v2h0Qy1oCi0", bgImage: "lostark", title: { ko: "여름밤의 축제 섬 (Summer Night Festival) ", ja: "여름밤의 축제 섬 (Summer Night Festival) ", en: "Summer Night Festival" } },
  { link: "fzfAaoNrbb8", bgImage: "lostark", title: { ko: "피어나는 불꽃의 순간 (A Moment of Blooming Fires)", ja: "피어나는 불꽃의 순간 (A Moment of Blooming Fires)", en: "A Moment of Blooming Fires" } },
  { link: "m3aJ3nKyfFQ", bgImage: "lostark", title: { ko: "새벽을 지키는 땅 (Land that Guards the Dawn)", ja: "새벽을 지키는 땅 (Land that Guards the Dawn)", en: "Land that Guards the Dawn" } },
  { link: "z6PKIr9AAVg", bgImage: "lostark", title: { ko: "모두의 소원을 담아 (A Tearful For all good Wishes)", ja: "모두의 소원을 담아 (A Tearful For all good Wishes)", en: "A Tearful For all good Wishes" } },
  { link: "RlQbmF8DiU0", bgImage: "lostark", title: { ko: "다시, 겨울방학 (Again, Winter Vacation) - feat. 보라미유", ja: "다시, 겨울방학 (Again, Winter Vacation) - feat. 보라미유", en: "Again, Winter Vacation - feat. 보라미유" } },
  { link: "EG-ki5AtNno", bgImage: "lostark", title: { ko: "겨울 캠핑 (Winter Camping)", ja: "겨울 캠핑 (Winter Camping)", en: "Winter Camping" } },
  { link: "dTuVWfbnPKk", bgImage: "lostark", title: { ko: "모여드는 작은 빛 (Little Light that Gathers)", ja: "모여드는 작은 빛 (Little Light that Gathers)", en: "Little Light that Gathers" } },

  {
    link: "v8aX4sQjSpU",
    bgImage: "maplestory",
    title: {
      ko: "The Raindrop Flower [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
      ja: "The Raindrop Flower [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
      en: "The Raindrop Flower [MapleStory Symphony in Budapest] / MapleStory Orchestra Album",
    },
  },
  {
    link: "ODOEt3_A6qM",
    bgImage: "maplestory",
    title: {
      ko: "The Queen's Garden [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
      ja: "The Queen's Garden [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
      en: "The Queen's Garden [MapleStory Symphony in Budapest] / MapleStory Orchestra Album",
    },
  },
  {
    link: "kizi98UD5ak",
    bgImage: "maplestory",
    title: {
      ko: "The Raindrop Flower (Jazz Ver.)｜메이플스토리 (MapleStory) OST : Jazz of Maple",
      ja: "The Raindrop Flower (Jazz Ver.)｜메이플스토리 (MapleStory) OST : Jazz of Maple",
      en: "The Raindrop Flower (Jazz Ver.) | MapleStory OST: Jazz of Maple",
    },
  },
  {
    link: "NKt5NMCyZvg",
    bgImage: "maplestory",
    title: {
      ko: "The Tune of The Azure Light [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
      ja: "The Tune of The Azure Light [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
      en: "The Tune of The Azure Light [MapleStory Symphony in Budapest] / MapleStory Orchestra Album",
    },
  },
  {
    link: "WihYiw2S8hU",
    bgImage: "maplestory",
    title: {
      ko: "Start The Adventure (Orchestral Ver.) [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
      ja: "Start The Adventure (Orchestral Ver.) [MapleStory Symphony in Budapest] / 메이플스토리 오케스트라 앨범",
      en: "Start The Adventure (Orchestral Ver.) [MapleStory Symphony in Budapest] / MapleStory Orchestra Album",
    },
  },
  {
    link: "SWOEVxpuiqE",
    bgImage: "maplestory",
    title: { ko: "MapleStory Symphony in Budapest - When The Morning Comes", ja: "MapleStory Symphony in Budapest - When The Morning Comes", en: "MapleStory Symphony in Budapest - When The Morning Comes" },
  },

  {
    link: "r2cx06CLBNA",
    bgImage: "kartrider",
    title: { ko: "카트라이더 대저택 풀 오케스트라 Kartrider Mansion Dance Battle OST", ja: "카트라이더 대저택 풀 오케스트라 Kartrider Mansion Dance Battle OST", en: "Kartrider Mansion Full Orchestra (Dance Battle OST)" },
  },

  {
    link: "FzH8gXzB4Xw",
    bgImage: "onepiece",
    title: { ko: '원피스 "우리의 꿈" 오케스트라 편곡 버전 (with Cubase)', ja: '원피스 "우리의 꿈" 오케스트라 편곡 버전 (with Cubase)', en: 'One Piece "Our Dream" (Orchestral Arrangement) (with Cubase)' },
  },
  { link: "RRHw3rvTnxI", bgImage: "onepiece", title: { ko: "세상 저 끝까지 - 원피스 극장판", ja: "세상 저 끝까지 - 원피스 극장판", en: "To the Ends of the World - One Piece Movie" } },

  { link: "wFkRpaldkh4", bgImage: "unchartedwartersonline", title: { ko: "Uncharted Waters Online OST - Login title", ja: "Uncharted Waters Online OST - Login title", en: "Uncharted Waters Online OST - Login title" } },
  { link: "vMtJnEQ59Sg", bgImage: "unchartedwartersonline", title: { ko: "Uncharted Waters Online OST - London", ja: "Uncharted Waters Online OST - London", en: "Uncharted Waters Online OST - London" } },
  {
    link: "ER0olOF_LKE",
    bgImage: "unchartedwartersonline",
    title: { ko: "Uncharted waters Online OST- Apennines by land (Venice)", ja: "Uncharted waters Online OST- Apennines by land (Venice)", en: "Uncharted waters Online OST- Apennines by land (Venice)" },
  },
  { link: "7ICS-FjUKgs", bgImage: "unchartedwartersonline", title: { ko: "Uncharted waters Online OST- 마르세이유", ja: "Uncharted waters Online OST- 마르세이유", en: "Uncharted waters Online OST- Marseille" } },

  { link: "yWZkOtriVVY", bgImage: "lostark", title: { ko: "10_레온하트 (크리스마스버전) (Leonhart X-mas Ver.) / 로스트아크", ja: "10_레온하트 (크리스마스버전) (Leonhart X-mas Ver.) / 로스트아크", en: "Leonhart X-mas Ver. / Lost Ark" } },
];
