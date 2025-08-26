// frontend/src/app/api/reports/[id]/export/route.ts
import { NextResponse } from "next/server";
import { getReportById } from "@/app/reporting/_data";
import { getMockRows } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic";

function toCSV(rows: any[], columns: { key: string; label: string }[]) {
  const header = columns.map((c) => c.label).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const v = row[c.key];
        const s = v == null ? "" : String(v);
        return `"${s.replace(/"/g, '""')}"`
      })
      .join(",")
  );
  return [header, ...lines].join("\r\n");
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const report = getReportById(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const rows = getMockRows(id);
  const cols = report.columns ?? [];
  if (cols.length === 0) {
    return NextResponse.json({ error: "No columns for CSV" }, { status: 400 });
  }

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
