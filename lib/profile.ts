// s4 + blog(FloatingNav)에서 공유하는 프로필 정보 단일 소스.
// 이름/이메일 등 바뀔 때 이 파일 하나만 고치면 됨 (직접 문자열 박아넣지 말 것).
export const PROFILE = {
  // 표시용 이름 (헤더, 페이지 타이틀, OG 태그 등)
  name: "Kim Zero",
  // metadata title에 쓰이는 "{name} - {페이지명}" 조합용
  nameKo: "김제로",

  tagline: "사람들이 실제로 즐겨 쓰는 제품을 만드는 풀스택 개발자",
  shortTagline: "재미로 시작해서, 지금까지",

  // 이메일
  email: "hello@2er0.io",

  github: "https://github.com/z3ro2201",
  instagram: "https://instagram.com/doit.2er0",
} as const;
