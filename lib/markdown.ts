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

type MarkdownToHtmlResult = {
  html: string;
  toc: TocItem[];
  title: string | null;
};

type RemarkPluginArgs = {
  toc: TocItem[];
  setTitle: (t: string) => void;
  tocMinLevel?: number; // default 2
  tocMaxLevel?: number; // default 4
};

/**
 * ✅ 첫 번째 h1(#)을 title로 추출하고 본문에서는 제거
 * ✅ h2~h4(기본)만 TOC 수집 + heading id 주입
 */
function remarkExtractTitleAndCollectToc(options: RemarkPluginArgs) {
  const { toc, setTitle, tocMinLevel = 2, tocMaxLevel = 4 } = options;

  return (tree: any) => {
    const slugger = new GithubSlugger();
    let titleCaptured = false;

    const removals: Array<{ parent: any; index: number }> = [];

    // ✅ 여기서 index 타입은 number | undefined 로 받기 (unist-util-visit 타입에 맞춤)
    visit(tree, "heading", (node: any, index: number | undefined, parent: any) => {
      const level = node.depth as number;
      const text = toString(node).trim();
      if (!text) return;

      // ✅ 첫 번째 h1은 title로만 쓰고 본문에서는 제거
      if (level === 1 && !titleCaptured) {
        titleCaptured = true;
        setTitle(text);

        if (parent && typeof index === "number") {
          removals.push({ parent, index });
        }
        return;
      }

      // ✅ TOC 범위만
      if (level < tocMinLevel || level > tocMaxLevel) return;

      const id = slugger.slug(text);
      toc.push({ id, text, level });

      node.data = node.data ?? {};
      node.data.hProperties = node.data.hProperties ?? {};
      node.data.hProperties.id = id;
    });

    // ✅ 뒤에서부터 제거 (index 꼬임 방지)
    removals
      .sort((a, b) => b.index - a.index)
      .forEach(({ parent, index }) => {
        if (parent?.children?.[index]) parent.children.splice(index, 1);
      });
  };
}

/**
 * Markdown -> HTML + TOC + title
 */
export async function markdownToHtmlWithToc(md: string): Promise<MarkdownToHtmlResult> {
  const toc: TocItem[] = [];
  let title: string | null = null;

  const schema = {
    ...defaultSchema,
    attributes: {
      ...(defaultSchema.attributes ?? {}),
      // heading id 허용
      h2: [...(((defaultSchema.attributes as any)?.h2 as any[]) ?? []), "id"],
      h3: [...(((defaultSchema.attributes as any)?.h3 as any[]) ?? []), "id"],
      h4: [...(((defaultSchema.attributes as any)?.h4 as any[]) ?? []), "id"],

      // (선택) 코드 하이라이팅 대비 클래스 허용
      code: [...(((defaultSchema.attributes as any)?.code as any[]) ?? []), "className"],
      pre: [...(((defaultSchema.attributes as any)?.pre as any[]) ?? []), "className"],
      span: [...(((defaultSchema.attributes as any)?.span as any[]) ?? []), "className"],
    },
  };

  const file = await remark()
    .use(remarkGfm)
    .use(remarkExtractTitleAndCollectToc, {
      toc,
      setTitle: (t) => (title = t),
      tocMinLevel: 2,
      tocMaxLevel: 4,
    })
    .use(remarkRehype)
    .use(rehypeSanitize, schema as any)
    .use(rehypeStringify)
    .process(md ?? "");

  return { html: String(file), toc, title };
}
