import "dotenv/config";
import { prisma } from "@/lib/prisma";

const SITE_HOST = "2er0.io";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// IndexNow는 한 번 요청에 URL을 최대 10,000개까지 배열로 받아줌.
// 지금 글 수(수십 개)로는 여유롭게 한 번에 다 들어가지만,
// 나중에 글이 많아져도 안전하게 청크로 나눠서 보냄.
const CHUNK_SIZE = 500;

async function main() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    throw new Error("INDEXNOW_KEY 환경변수가 없습니다. .env에 설정 후 다시 실행하세요.");
  }

  const posts = await prisma.post.findMany({
    where: { state: "PUBLISHED" },
    select: { id: true },
    orderBy: { id: "asc" },
  });

  if (posts.length === 0) {
    console.log("발행된 글이 없습니다.");
    return;
  }

  const urls = posts.map((p) => `https://${SITE_HOST}/blog/posts/view/${p.id}`);
  console.log(`총 ${urls.length}개 URL을 IndexNow로 전송합니다.`);

  for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
    const chunk = urls.slice(i, i + CHUNK_SIZE);

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key,
        keyLocation: `https://${SITE_HOST}/${key}.txt`,
        urlList: chunk,
      }),
    });

    console.log(`  [${i + 1}~${i + chunk.length}] → HTTP ${res.status}${res.ok ? " OK" : " 실패"}`);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("    응답 본문:", text || "(없음)");
    }
  }

  console.log("완료.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
