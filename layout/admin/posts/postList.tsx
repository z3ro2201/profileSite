"use client";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import { T } from "@/components/ui/DivTable";
import { PostStateType } from "@/lib/post";

import { Button } from "@/components/ui/Button";

const PostListLayout = ({ posts }: { posts: any[] }) => {
  const submitDeletePost = async (id: number) => {
    try {
      const data = await apiFetch(`/admin/blog/posts/${id}`, { method: "DELETE" });
      console.log(data);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };
  return (
    <T.Table>
      <T.Thead>
        <T.Tr>
          <T.Th align="center" width="10%">
            카테고리
          </T.Th>
          <T.Th align="center" width="50%">
            제목
          </T.Th>
          <T.Th align="center">작성일</T.Th>
          <T.Th align="center">상태</T.Th>
          <T.Th align="center">관리</T.Th>
        </T.Tr>
      </T.Thead>
      <T.Tbody>
        {posts.map((p: any) => (
          <T.Tr key={p.id}>
            <T.Td align="center" width="10%">
              &nbsp;
            </T.Td>
            <T.Td align="center" width="50%">
              <Link className="block" href={`./${p.id}`}>
                {p.title}
              </Link>
            </T.Td>
            <T.Td align="center">{new Date(p.createdAt).toISOString().split("T")[0]}</T.Td>
            <T.Td align="center">{PostStateType.find((item) => item.code === p.state)?.name}</T.Td>
            <T.Td align="center">
              <Button variant="success" size="sm" href={`/admin/mgmt/posts/${p.id}/modify`} className="mr-1">
                편집
              </Button>
              <Button size="sm" variant="danger" onClick={() => submitDeletePost(p.id)}>
                삭제
              </Button>
            </T.Td>
          </T.Tr>
        ))}
      </T.Tbody>
    </T.Table>
  );
};

export default PostListLayout;
