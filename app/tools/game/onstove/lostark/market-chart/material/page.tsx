import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { MATERIAL_ITEM_LIST } from "@/lib/lostark";

type Props = {
  // 레거시 호환용 — 예전엔 ?gemStone=&level= 형태였는데, 재료는 레벨 개념이 없어서
  // itemName만 씀. gemStone 파라미터명도 그대로 두는 건 기존 공유 링크가 안 깨지게 하려는 것.
  searchParams: Promise<{ gemStone?: string; itemName?: string; updatetime?: string }>;
};

const MaterialListRedirectPage = async ({ searchParams }: Props): Promise<ReactNode> => {
  const sp = await searchParams;
  const rawItem = sp.itemName ?? sp.gemStone ?? MATERIAL_ITEM_LIST[0];
  const updatetime = sp.updatetime ?? "1d";

  // ⚠️ searchParams는 이미 URL-디코딩된 값이라, 재조립할 때 다시 인코딩 안 하면
  // 한글/공백 등이 Location 헤더에 raw로 들어가서 Node가 "Invalid character in
  // header content"로 500을 냄. 재인코딩 필수.
  redirect(`/tools/game/onstove/lostark/market-chart/material/${encodeURIComponent(rawItem)}?updatetime=${encodeURIComponent(updatetime)}`);
};

export default MaterialListRedirectPage;
