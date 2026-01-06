import { ReactNode } from "react";
const GalleryPicture = ({ children }: { children: ReactNode }) => {
  return <div className="relative mb-2 w-full h-[calc(100%-40px)] flex flex-col items-center justify-center border border-gray-200 rounded-sm bg-[rgba(255,255,255,.85)] overflow-hidden">{children}</div>;
};

const GalleryContainer = ({ children }: { children: ReactNode }) => {
  return <div className="w-full h-[150px] lg:h-[220px] p-2">{children}</div>;
};

const GalleryInfo = ({ title, date }: { title?: string; date?: string }) => {
  return (
    <div className="flex justify-between items-center text-[var(--primary-text)] font-bold">
      <span className="block w-[calc(100%-80px-0.5rem)] lg:truncate">{title}</span>
      <span className="block min-w-[80px] text-right">{date}</span>
    </div>
  );
};

export { GalleryPicture, GalleryContainer, GalleryInfo };
