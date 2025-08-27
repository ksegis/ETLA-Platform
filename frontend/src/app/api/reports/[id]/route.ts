import { NextRequest, NextResponse } from "next/server";
import { getMockRows } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic";

type Dict<T = any> = Record<string, T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: NextRequest, ctx: any) {
  const id = ctx?.params?.id as string;
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? "0");

  const allRows: Dict[] = await getMockRows(id);
  const rows = limit > 0 ? allRows.slice(0, limit) : allRows;
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return NextResponse.json({
    id,
    total: allRows.length,
    columns,
    rows,
  });
}
