export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getReportRows } from "@/server/reportRegistry";

export async function GET(req: Request, ctx: { params: { id: string[] } }) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end   = searchParams.get("end");

  const rows = await getReportRows(ctx.params.id || [], { start, end });
  return NextResponse.json(rows);
}
