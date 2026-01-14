import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prismaLoa } from "@/lib/prismaLoa";

import { UpdatetimeKey } from "@/types/Lostark";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

function clampUpdatetime(v: string | null): UpdatetimeKey {
  const s = (v ?? "").trim() as UpdatetimeKey;
  const allowed = new Set<UpdatetimeKey>(["1h", "30m", "15m", "10m", "7d", "15d", "30d", "1d"]);
  return allowed.has(s) ? s : "1d";
}

function pickPolicy(key: UpdatetimeKey): { rangeSeconds: number; bucketSeconds: number } {
  // 하루 미만(= 24시간 범위 고정) : 1h/30m/15m/10m 단위
  if (key === "1h") return { rangeSeconds: 1 * DAY, bucketSeconds: 1 * HOUR };
  if (key === "30m") return { rangeSeconds: 1 * DAY, bucketSeconds: 30 * 60 };
  if (key === "15m") return { rangeSeconds: 1 * DAY, bucketSeconds: 15 * 60 };
  if (key === "10m") return { rangeSeconds: 1 * DAY, bucketSeconds: 10 * 60 };

  // 7일 이하: 일주일 기간(=7d) + 15분 단위
  if (key === "7d") return { rangeSeconds: 7 * DAY, bucketSeconds: 15 * 60 };

  // 초과(>7d): (15d/30d) + 1시간 단위
  if (key === "15d") return { rangeSeconds: 15 * DAY, bucketSeconds: 1 * HOUR };
  if (key === "30d") return { rangeSeconds: 30 * DAY, bucketSeconds: 1 * HOUR };

  // fallback: 24h + 15m
  return { rangeSeconds: 1 * DAY, bucketSeconds: 15 * 60 };
}

export async function GET(req: Request, ctx: { params: Promise<{ itemName: string }> }) {
  try {
    const { itemName: raw } = await ctx.params;
    const itemName = decodeURIComponent(raw ?? "");
    if (!itemName) {
      return NextResponse.json({ code: 400, message: "itemName이 필요합니다." }, { status: 400 });
    }

    const url = new URL(req.url);
    const updatetime = clampUpdatetime(url.searchParams.get("updatetime"));

    const { rangeSeconds, bucketSeconds } = pickPolicy(updatetime);

    const bucketExpr = Prisma.sql`
      FROM_UNIXTIME(
        FLOOR(UNIX_TIMESTAMP(item_registDateTime) / ${bucketSeconds}) * ${bucketSeconds}
      )
    `;

    const rows = await prismaLoa.$queryRaw<
      Array<{
        item_name: string;
        item_amount: any;
        bucket_time: string;
      }>
    >(Prisma.sql`
      SELECT
        item_name,
        ROUND(AVG(item_amount)) AS item_amount,
        DATE_FORMAT(${bucketExpr}, '%Y-%m-%d %H:%i:00') AS bucket_time
      FROM LOA_AUCTION_GEMS_PRICE
      WHERE item_name = ${itemName}
        AND item_registDateTime >= DATE_SUB(NOW(), INTERVAL ${rangeSeconds} SECOND)
      GROUP BY item_name, bucket_time
      ORDER BY bucket_time ASC
    `);

    return NextResponse.json({
      code: 200,
      message: "OK",
      updatetime,
      rangeSeconds,
      bucketSeconds,
      data: rows.map((r) => ({
        item_name: r.item_name,
        item_amount: r.item_amount == null ? null : Number(r.item_amount),
        halfhour_registDateTime: r.bucket_time,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ code: 500, message: e?.message ?? "unknown error" }, { status: 500 });
  }
}
