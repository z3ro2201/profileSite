import { Undo } from "lucide-react";
import Link from "next/link";
const PrologPage = () => {
  return (
    <>
      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="py-5 px-3 min-w-[300px] min-w-[300px] bg-[rgba(255,255,255,.5)] text-center rounded-sm">
          준비중 입니다.
          <Link href="/s3" className="mx-2 mt-3 mb-2 px-4 py-2 flex border border-[var(--primary-text)] rounded-full text-[1rem] items-center justify-center gap-2 text-[var(--primary-text)] font-bold bg-white">
            <Undo size={14} /> 처음화면으로
          </Link>
        </div>
      </div>
    </>
  );
};

export default PrologPage;
