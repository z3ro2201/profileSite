import Link from "next/link";
import { headers } from "next/headers";

type Lang = "ko" | "en" | "ja";

const detectLang = async (): Promise<Lang> => {
  const h = await headers(); // ✅ Promise unwrap
  const lang = (h.get("accept-language") ?? "").toLowerCase();

  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("en")) return "en";
  return "ko";
};

const TEXT: Record<Lang, { title: string; desc: string; home: string }> = {
  ko: {
    title: "페이지를 찾을 수 없습니다",
    desc: "요청하신 페이지가 존재하지 않거나 이동되었어요.",
    home: "홈으로 돌아가기",
  },
  en: {
    title: "Page not found",
    desc: "The page you are looking for does not exist or has been moved.",
    home: "Go back home",
  },
  ja: {
    title: "ページが見つかりません",
    desc: "お探しのページは存在しないか、移動された可能性があります。",
    home: "ホームへ戻る",
  },
};

const NotFoundPage = async () => {
  const lang = await detectLang(); // ✅ await
  const t = TEXT[lang];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <p className="mt-4 text-black/60">{t.desc}</p>

      <Link href="/" className="mt-8 inline-flex rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
        {t.home}
      </Link>
    </div>
  );
};

export default NotFoundPage;
