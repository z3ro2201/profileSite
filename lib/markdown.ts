import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

import rehypeStringify from "rehype-stringify";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";

export type TocItem = {
  id: string;
  text: string;
  level: number; // 1~6
};

/**
 * Markdown AST에서 heading을 찾아:
 * - TOC 수집
 * - heading에 id 주입
 */
function remarkCollectTocAndAddHeadingIds(toc: TocItem[]) {
  return (tree: any) => {
    const slugger = new GithubSlugger();

    visit(tree, "heading", (node: any) => {
      const level = node.depth as number; // 1~6
      const text = toString(node).trim();
      if (!text) return;

      // ✅ 목차는 보통 h2~h4 정도가 보기 좋음 (원하면 수정)
      if (level < 2 || level > 4) return;

      const id = slugger.slug(text);

      toc.push({ id, text, level });

      // ✅ h2/h3/h4에 id 부여되도록 hProperties에 넣어줌
      node.data = node.data ?? {};
      node.data.hProperties = node.data.hProperties ?? {};
      node.data.hProperties.id = id;
    });
  };
}

/**
 * Markdown -> HTML + TOC
 * - GFM 지원
 * - sanitize로 XSS 방어
 * - heading id 허용
 */
export async function markdownToHtmlWithToc(md: string) {
  const toc: TocItem[] = [];

  // rehype-sanitize 스키마 확장 (버전 타입 이슈 피하려고 타입 강제 안 함)
  const schema = {
    ...defaultSchema,
    attributes: {
      ...(defaultSchema.attributes ?? {}),
      // ✅ heading의 id 허용
      h2: [...(((defaultSchema.attributes as any)?.h2 as any[]) ?? []), "id"],
      h3: [...(((defaultSchema.attributes as any)?.h3 as any[]) ?? []), "id"],
      h4: [...(((defaultSchema.attributes as any)?.h4 as any[]) ?? []), "id"],

      // (선택) 코드블록 클래스 허용 - 나중에 하이라이터 붙일 때 필요
      code: [...(((defaultSchema.attributes as any)?.code as any[]) ?? []), "className"],
      pre: [...(((defaultSchema.attributes as any)?.pre as any[]) ?? []), "className"],
      span: [...(((defaultSchema.attributes as any)?.span as any[]) ?? []), "className"],
    },
  };

  const file = await remark()
    .use(remarkGfm)
    .use(remarkCollectTocAndAddHeadingIds, toc)
    .use(remarkRehype)
    .use(rehypeSanitize, schema as any)
    .use(rehypeStringify)
    .process(md ?? "");

  return { html: String(file), toc };
}
