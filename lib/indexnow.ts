import "server-only";

const SITE_HOST = "2er0.io";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"; // 여러 검색엔진에 한 번에 전파됨 (빙/네이버 등)

/**
 * 발행/수정된 글 URL을 IndexNow에 알림 — 네이버/빙이 크롤링을 기다리지 않고
 * 바로 가져가게 함. 구글은 아직 IndexNow를 공식 지원 안 해서 대상에서 빠짐(사이트맵으로 커버).
 *
 * 키/도메인 설정이 없거나 실패해도 조용히 넘어감 — 색인 알림은 "있으면 좋은" 부가 기능이지
 * 이것 때문에 글 저장 자체가 막히면 안 됨.
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key || urls.length === 0) return;

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key,
        keyLocation: `https://${SITE_HOST}/${key}.txt`,
        urlList: urls,
      }),
    });

    if (!res.ok) {
      console.warn(`[indexnow] 알림 실패 (${res.status})`);
    }
  } catch (err) {
    console.warn("[indexnow] 알림 중 오류:", err);
  }
}
