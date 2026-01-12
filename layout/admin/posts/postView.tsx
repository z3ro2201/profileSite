import { PublicPostDetail } from "@/types/Posts";

type Props = {
  post?: PublicPostDetail;
  finalHtml: string | TrustedHTML;
};

const AdminPostView = ({ post, finalHtml }: Props) => {
  return (
    <>
      <h1>{post?.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: finalHtml }} />

      {(post?.tags?.length ?? 0) > 0 && (
        <ul>
          {post!.tags.map((tag) => (
            <li key={tag.slug}>{tag.name}</li>
          ))}
        </ul>
      )}
    </>
  );
};

export default AdminPostView;
