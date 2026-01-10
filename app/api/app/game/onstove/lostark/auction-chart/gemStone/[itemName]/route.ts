import { NextResponse } from "next/server";
import { prismaLoa } from "@/lib/prismaLoa";

export async function GET(req: Request, ctx: { params: Promise<{ itemName: string }> }) {
  try {
    const { itemName: raw } = await ctx.params;

    // 기존처럼 URL 인코딩된 값이 오므로 decode
    const itemName = decodeURIComponent(raw);

    if (!itemName) {
      return NextResponse.json({ code: 400, message: "itemName이 필요합니다." }, { status: 400 });
    }

    const rows = await prismaLoa.$queryRaw<
      Array<{
        item_name: string;
        item_amount: any;
        halfhour_registDateTime: string;
      }>
    >`
      SELECT
        item_name,
        ROUND(AVG(item_amount)) AS item_amount,
        DATE_FORMAT(
          DATE_SUB(
            item_registDateTime,
            INTERVAL (MINUTE(item_registDateTime) % 5) MINUTE
          ),
          '%Y-%m-%d %H:%i:00'
        ) AS halfhour_registDateTime
      FROM LOA_AUCTION_GEMS_PRICE
      WHERE item_name = ${itemName}
        AND item_registDateTime >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY
        item_name,
        DATE_FORMAT(
          DATE_SUB(
            item_registDateTime,
            INTERVAL (MINUTE(item_registDateTime) % 5) MINUTE
          ),
          '%Y-%m-%d %H:%i'
        )
      ORDER BY
        halfhour_registDateTime ASC
    `;

    return NextResponse.json({
      code: 200,
      message: "데이터를 성공적으로 조회했습니다.",
      data: rows.map((r) => ({
        item_name: r.item_name,
        item_amount: r.item_amount == null ? null : Number(r.item_amount),
        halfhour_registDateTime: r.halfhour_registDateTime,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ code: 500, message: e?.message ?? "unknown error" }, { status: 500 });
  }
}
