import Link from "next/link";
import { ReactNode } from "react";

const AdminPageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mr-2 flex w-full h-screen flex-col">
      <div className="flex w-full h-[52px] justify-between items-center border-b border-gray-200"></div>
      <div className="flex h-[calc(100%-52px)]">
        <aside className="w-[200px] h-full flex flex-col sm:border-r border-gray-200">
          <Link href="/admin/mgmt/posts/write">글 작성</Link>
          <Link href="/admin/mgmt/posts/list">글 관리</Link>
        </aside>
        <section className="w-10/12 pl-4 pr-2 pt-4 pb-2">{children}</section>
      </div>
    </div>
  );
};
export default AdminPageLayout;
