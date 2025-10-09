import { NextResponse } from "next/server";
import { getMockRows } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic"; // no caching

function toCsv(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const cols = Array.from(
    rows.reduce<Set<string>>((s, r) => {
      Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, new Set())
  );

  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(",")).join("\n");
  return `${header}\n${body}`;
}

export async function GET(_req: Request, ctx: any) {
  const id = String(ctx?.params?.id ?? "");
  const rows = getMockRows(id);
  const csv = toCsv(rows);
  const filename = `${id || "report"}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
