import { GEMSTONE_LIST } from "@/lib/lostark";
export type UpdatetimeKey = "1h" | "30m" | "15m" | "10m" | "7d" | "15d" | "30d" | "1d";

export type GemStone = (typeof GEMSTONE_LIST)[number];

export type AuctionGemChartProp = {
  GEMSTONE_LIST: readonly string[];
  initialGemStone?: string;
  initialLevel?: string;
  initialData?: GemChartResponse;
  UPDATETIME_LIST?: readonly string[];
  initialUpdatetime?: string;
};

export type GemChartRow = {
  item_name: string;
  item_amount: number | null;
  halfhour_registDateTime: string;
};

export type GemChartResponse = {
  code: number;
  message: string;
  updatetime?: string;
  rangeSeconds?: number;
  bucketSeconds?: number;
  data: GemChartRow[];
};
export type Tab = "CHANGE" | "OPEN_API";
