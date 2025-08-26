import { NextResponse } from "next/server";
import { getMockRows, toCSV } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic"; // disable caching for mock export

// Lightweight CSV builder that can pick specific columns (optional).
function toCSVPick(rows: any[], columns?: string[]) {
  if (!rows || rows.length === 0) return "";

  const headers = (columns && columns.length > 0)
    ? columns
    : Object.keys(rows[0]);

  const esc = (v: any) => (v ?? "").toString().replaceAll('"', '""');
  const head = headers.map(h => `"${esc(h)}"`).join(",");

  const lines = rows.map(r =>
    headers.map(h => `"${esc((r as any)[h])}"`).join(",")
  );

  return [head, ...lines].join("\n");
}

export async function GET(req: Request, ctx: any) {
  const id = ctx?.params?.id ?? "report";

  const url = new URL(req.url);
  const sp = url.searchParams;

  // Optional filters & options
  const q = sp.get("q") || undefined;
  const from = sp.get("from") || undefined;
  const to = sp.get("to") || undefined;
  const limit = Number(sp.get("limit") || "") || undefined;
  const cols = (sp.get("cols") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const filters: Record<string, any> = {};
  if (q) filters.q = q;
  if (from) filters.from = from;
  if (to) filters.to = to;

  // ✅ Await the mock rows
  const rows = await getMockRows(id, filters, limit);

  // If columns specified, use them; otherwise use default toCSV
  const csv = cols.length > 0 ? toCSVPick(rows, cols) : toCSV(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${id}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
