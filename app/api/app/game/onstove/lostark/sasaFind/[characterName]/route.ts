import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

type InvenSasaItem = {
  title: string;
  link?: string;
};

type InvenSasaResponse = {
  ok: boolean;
  characterName: string;
  message: string;
  list: InvenSasaItem[];
};

// category 값을 그대로 name 파라미터로 사용
const toInvenNameParam = (category: string | null): string => {
  return category || "subjcont"; // 기본값: 제목+내용
};

const buildAbsUrl = (href: string) => {
  if (!href) return undefined;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  return `https://www.inven.co.kr${href.startsWith("/") ? "" : "/"}${href}`;
};

const isPostLink = (href: string) => {
  // 사사게 게시글 URL 패턴
  return href.includes("/board/lostark/5355/");
};

export async function GET(req: Request, ctx: { params: { characterName: string } } | { params: Promise<{ characterName: string }> }) {
  const params = "then" in (ctx as any).params ? await (ctx as any).params : (ctx as any).params;

  const characterName = (params?.characterName ?? "").trim();

  if (!characterName) {
    return NextResponse.json<InvenSasaResponse>(
      {
        ok: false,
        characterName: "",
        message: "characterName이 비어있습니다.",
        list: [],
      },
      { status: 400 }
    );
  }

  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const invenName = toInvenNameParam(category);

  const invenUrl = `https://www.inven.co.kr/board/lostark/5355?query=list&p=1&sterm=` + `&name=${encodeURIComponent(invenName)}` + `&keyword=${encodeURIComponent(characterName)}`;

  try {
    const res = await fetch(invenUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        Referer: "https://www.inven.co.kr/",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json<InvenSasaResponse>(
        {
          ok: false,
          characterName,
          message: `인벤 요청 실패 (HTTP ${res.status})`,
          list: [],
        },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 🔍 결과 없음 판정 (구조 + 텍스트 이중 체크)
    const pageText = $.text();
    const noResult = $("div.no-result").length > 0 || pageText.includes("검색 결과가 없습니다") || pageText.includes("검색된 글이 없습니다");

    if (noResult) {
      return NextResponse.json<InvenSasaResponse>({
        ok: true,
        characterName,
        message: "검색 결과가 없습니다.",
        list: [],
      });
    }

    // 📌 게시글 파싱 (구조 변화에 강한 방식)
    const list: InvenSasaItem[] = [];
    const seen = new Set<string>();

    const root = $("div.board-list").length ? $("div.board-list") : $("body");

    root.find("a[href]").each((_, el) => {
      const a = $(el);
      const href = a.attr("href") ?? "";
      if (!href || !isPostLink(href)) return;

      const link = buildAbsUrl(href);
      if (!link || seen.has(link)) return;

      const title = a
        .text()
        .replace(/[\t\n\r ]+/g, " ")
        .trim();
      if (!title) return;

      seen.add(link);
      list.push({ title, link });
    });

    return NextResponse.json<InvenSasaResponse>({
      ok: true,
      characterName,
      message: `조회 완료 (${list.length}건)`,
      list,
    });
  } catch (e: any) {
    return NextResponse.json<InvenSasaResponse>(
      {
        ok: false,
        characterName,
        message: e?.message ?? "사사게 조회 중 오류가 발생했습니다.",
        list: [],
      },
      { status: 500 }
    );
  }
}
