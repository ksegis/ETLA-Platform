export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getReportRows, toCSV } from "@/server/reportRegistry";

export async function GET(req: Request, ctx: { params: { id: string[] } }) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end   = searchParams.get("end");

  const rows = await getReportRows(ctx.params.id || [], { start, end });
  const csv = toCSV(rows);
  const filename = (ctx.params.id || []).join("_").toLowerCase().replace(/\W+/g, "-") + ".csv";

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename=${filename}`,
      "cache-control": "no-store",
    },
  });
}
