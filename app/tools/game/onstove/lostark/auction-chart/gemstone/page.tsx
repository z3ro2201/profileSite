import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  searchParams: Promise<{ gemStone: string; level: string; updatetime: string }>;
};

const GemStonePage = async ({ searchParams }: Props): Promise<ReactNode> => {
  const { gemStone, level, updatetime } = await searchParams;
  redirect(`/tools/game/onstove/lostark/auction-chart/gemstone/${gemStone}/${level}?updatetime=${updatetime}`);
};

export default GemStonePage;
