import { NextResponse } from "next/server";
import { getMockRows } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic"; // disable caching for mock preview

export async function GET(req: Request, ctx: any) {
  const id = ctx?.params?.id ?? "report";

  const url = new URL(req.url);
  const sp = url.searchParams;

  const q = sp.get("q") || undefined;
  const from = sp.get("from") || undefined;
  const to = sp.get("to") || undefined;
  const limit = Number(sp.get("limit") || "") || undefined;

  const filters: Record<string, any> = {};
  if (q) filters.q = q;
  if (from) filters.from = from;
  if (to) filters.to = to;

  // ✅ Await the mock rows
  const rows = await getMockRows(id, filters, limit);

  return NextResponse.json(
    { id, rows, count: rows.length },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
