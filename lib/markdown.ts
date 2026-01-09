import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// 필요하면 허용 태그/속성 확장 가능
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // 예: code block에 class 허용(하이라이트용)
    code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
    span: [...(defaultSchema.attributes?.span ?? []), ["className"]],
  },
};

export async function markdownToHtml(md: string) {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(md ?? "");

  return String(file);
}
