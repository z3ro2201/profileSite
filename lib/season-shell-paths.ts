// FloatingNav + 현재 시즌 셸(SeasonShell)을 쓰는 라우트 prefix 목록.
// /blog, /privacy처럼 특정 시즌 폴더 밑에 안 두고도 "현재 시즌처럼 보이게" 하고 싶은
// 페이지는 여기에 경로만 추가하면 됨. season5가 오더라도 이 파일 + SeasonShell 내부만
// 고치면 되고, 페이지들을 옮기거나 다시 만들 필요 없음.
export const SEASON_SHELL_PATHS = ["/blog", "/s4", "/privacy"] as const;

export const matchesSeasonShellPath = (pathname: string): boolean =>
  SEASON_SHELL_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
