import "server-only";

const MODEL = "claude-haiku-4-5-20251001"; // 짧은 요약 생성엔 가장 저렴한 모델로 충분
const MAX_INPUT_CHARS = 12000; // 너무 긴 글은 앞부분만 잘라서 비용/속도 절약

/**
 * 마크다운 본문을 3~4문장짜리 한국어 요약으로 변환.
 * 실패해도(키 없음, API 에러 등) null을 반환해서 글 저장 자체는 절대 안 막음 —
 * 요약은 "있으면 좋은" 부가 기능이지, 글쓰기를 막을 이유가 아님.
 */
export async function generateAiSummary(markdown: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[ai-summary] ANTHROPIC_API_KEY가 없어서 요약을 건너뜁니다.");
    return null;
  }

  const trimmed = markdown.trim();
  if (trimmed.length < 200) return null; // 너무 짧은 글은 요약할 의미가 없음

  const input = trimmed.slice(0, MAX_INPUT_CHARS);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system:
          "블로그 글을 읽고 핵심만 3~4문장으로 한국어로 요약해줘. 과장하지 말고 담백하게. 요약문 외에 다른 말은 하지 마.",
        messages: [{ role: "user", content: input }],
      }),
    });

    if (!res.ok) {
      console.error(`[ai-summary] API 응답 실패 (${res.status})`);
      return null;
    }

    const data = await res.json();
    const text = data?.content?.find((b: { type: string }) => b.type === "text")?.text;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch (err) {
    console.error("[ai-summary] 생성 실패:", err);
    return null;
  }
}
