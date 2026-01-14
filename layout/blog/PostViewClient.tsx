import { cn } from "@/lib/cn";
import Link from "next/link";

type TocItem = { id: string; text: string; level: number };

type Props = {
  post: {
    id: number;
    title: string;
    createdAt: string | Date;
    publishedAt: string | Date | null;
    category?: { name: string } | null;
  };
  finalHtml: string;
  toc: TocItem[];
  compact?: boolean; // ✅ 피드용(옵션)
  isAdmin?: boolean;
};

const PostViewClient = ({ post, finalHtml, toc, compact, isAdmin }: Props) => {
  return (
    <div className={cn("mx-auto w-full px-5 py-10", compact ? "py-6" : "")}>
      {isAdmin && (
        <>
          <Link href={`/admin/mgmt/posts/${post?.id}/modify`}>수정</Link>
          <Link href={`/admin/mgmt/posts/${post?.id}/delete`}>삭제</Link>
        </>
      )}
      <div className={cn("p-2 mb-2 w-full flex flex-col justify-end", compact ? "h-auto" : "h-[146px]")}>
        <div className="mb-2">
          <div className="w-full">
            <span className="py-1 px-3 min-w-[50px] inline-block bg-black text-white rounded-full text-[.8rem]">{post.category?.name ?? "Uncategorized"}</span>
          </div>
          <h1 className="pb-1 inline-block border-b border-white text-[2.24rem] font-bold">{post.title}</h1>
        </div>

        <div className="mt-1 flex justify-between text-[0.9rem]">
          <div>
            <span className="inline-block mr-2">{post.publishedAt ? new Date(post.publishedAt).toLocaleString("ko-KR") : new Date(post.createdAt).toLocaleString("ko-KR")}</span>
          </div>
        </div>
      </div>

      <div className={cn("relative py-2 pr-4 lg:pt-6 lg:pr-6", !compact && toc.length > 0 ? "grid grid-cols-1 gap-10 lg:grid-cols-[1fr_260px]" : "")}>
        <article className="px-3 py-2 prose max-w-none bg-white border border-black/10 rounded-lg">
          <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
        </article>

        {!compact && toc.length > 0 && (
          <aside className="fixed lg:sticky lg:top-6 lg:overflow-auto">
            <div className="rounded-xl border border-black/10 bg-white p-5">
              <div className="text-xl font-extrabold">Contents</div>
              <nav className="mt-4 space-y-2 text-[15px] leading-6">
                {toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className={["block text-black/70 hover:text-black", item.level === 2 ? "pl-0" : item.level === 3 ? "pl-4" : "pl-8"].join(" ")}>
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default PostViewClient;
