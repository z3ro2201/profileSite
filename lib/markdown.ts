import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const schema = {
  ...defaultSchema,
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    code: [...(((defaultSchema.attributes as any)?.code as any[]) ?? []), "className"],
    span: [...(((defaultSchema.attributes as any)?.span as any[]) ?? []), "className"],
    pre: [...(((defaultSchema.attributes as any)?.pre as any[]) ?? []), "className"],
  },
};

export async function markdownToHtml(md: string) {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, schema as any)
    .use(rehypeStringify)
    .process(md ?? "");

  return String(file);
}
