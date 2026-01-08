import dynamic from "next/dynamic";

const PostEditor = dynamic(() => import("@/components/blog/Editor/PostEditor"), {
  ssr: false,
  loading: () => <div className="p-4">에디터 로딩중...</div>,
});

export default function WritePage() {
  return (
    <div className="p-6">
      <PostEditor PostType="new" PostId={null} />
    </div>
  );
}
