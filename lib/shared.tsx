"use client";
import { Share2 } from "lucide-react";
import { serif, sans } from "@/app/s4/_lib/theme";

export const shareContent = ({ title, text }: { title: string; text: string }) => {
  const url = window.location.href;
  // 브라우저가 Web Share API를 지원하는지 먼저 확인함.
  if (navigator.share) {
    navigator
      .share({ title, text, url })
      .then(() => console.log("공유 성공"))
      .catch((error) => console.error("공유 실패", error));
  } else {
    // Web Share API를 지원하지 않는 브라우저(예: 구형 PC 브라우저 등)용 예외 처리
    alert("이 브라우저에서는 공유 기능을 지원하지 않습니다. 링크를 복사해주세요.");
  }
};

export const SharedButton = ({ title, text }: { title: string; text: string }) => {
  return (
    <div className="my-10 flex items-center gap-3">
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all hover:opacity-80"
        style={{ background: "#e8eaf6", color: "#5c6bc0", ...sans }}
        onClick={() => shareContent({ title, text })}
      >
        <Share2 size={14} /> 공유하기
      </button>
    </div>
  );
};
