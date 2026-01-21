// lib/botDetection.ts

/**
 * User-Agent를 분석하여 봇인지 확인
 */
export function isBot(userAgent: string): boolean {
  const botPatterns = [
    // 검색 엔진
    "googlebot",
    "bingbot",
    "slurp", // Yahoo
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "sogou",
    "exabot",
    "Yeti",

    // 소셜 미디어 크롤러
    "facebookexternalhit",
    "facebookcatalog",
    "twitterbot",
    "linkedinbot",
    "pinterestbot",
    "slackbot",
    "telegrambot",
    "whatsapp",
    "kakaotalk-scrap",

    // 기타 크롤러
    "rogerbot",
    "embedly",
    "quora link preview",
    "showyoubot",
    "outbrain",
    "vkshare",
    "w3c_validator",
    "semrushbot",
    "ahrefsbot",
    "mj12bot",
    "dotbot",
    "blexbot",
    "petalbot",

    // 모니터링/분석
    "uptimerobot",
    "pingdom",
    "statuscake",
    "newrelic",
  ];

  const lowerUA = userAgent.toLowerCase();
  return botPatterns.some((pattern) => lowerUA.includes(pattern));
}

/**
 * JavaScript 지원 여부 확인 (헤더 기반)
 */
export function supportsJavaScript(headers: Headers): boolean {
  // Accept 헤더에 text/html이 있으면 브라우저
  const accept = headers.get("accept") || "";

  // 봇은 보통 */* 또는 text/html만 요청
  // 일반 브라우저는 text/html,application/xhtml+xml,... 형태
  if (accept.includes("application/xhtml+xml")) {
    return true;
  }

  // Sec-Fetch-Dest 헤더로 판단 (modern browsers)
  const fetchDest = headers.get("sec-fetch-dest");
  if (fetchDest === "document") {
    return true;
  }

  return false;
}
