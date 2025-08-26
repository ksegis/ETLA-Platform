// frontend/src/app/api/reports/[id]/export/route.ts
import { NextResponse } from "next/server";
import { getReportById } from "@/app/reporting/_data";
import { getMockRows } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic";

function resolveParams(ctx: any): Promise<Record<string, string>> {
  const p = ctx?.params;
  if (p && typeof p.then === "function") return p as Promise<Record<string, string>>;
  return Promise.resolve((p ?? {}) as Record<string, string>);
}

function idFromUrl(url: string): string | undefined {
  const m = url.match(/\/api\/reports\/([^/]+)/);
  return m ? decodeURIComponent(m[1]) : undefined;
}

function toCSV(rows: any[], columns: { key: string; label: string }[]) {
  const header = columns.map((c) => c.label).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const v = row[c.key];
        const s = v == null ? "" : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [header, ...lines].join("\r\n");
}

export async function GET(req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const id = params.id ?? idFromUrl(req.url);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const report = getReportById(id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const cols = report.columns ?? [];
  if (cols.length === 0) {
    return NextResponse.json({ error: "No columns for CSV" }, { status: 400 });
  }

  const rows = getMockRows(id);
  const csv = toCSV(rows, cols);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${report.slug || report.id}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
