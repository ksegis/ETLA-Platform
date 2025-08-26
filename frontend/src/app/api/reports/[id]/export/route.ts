import { NextResponse } from "next/server";
import { getMockRows } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic"; // no caching for downloads

// Keep the context untyped ("any") to avoid Next.js signature type errors
export async function GET(req: Request, context: any) {
  const id = String(context?.params?.id || "report");
  const { searchParams } = new URL(req.url);

  // optional query params
  const limit = Number(searchParams.get("limit") || 0); // 0 = no limit
  const colsParam = searchParams.get("columns") || searchParams.get("cols"); // comma-separated list

  // ✅ get rows (sync), then apply limit if provided
  const allRows = getMockRows(id);
  const rows = limit > 0 ? allRows.slice(0, limit) : allRows;

  // Choose columns: query override → keys of first row → empty
  const columns =
    colsParam?.split(",").map((s) => s.trim()).filter(Boolean) ||
    (rows[0] ? Object.keys(rows[0]) : []);

  // Build CSV
  const header = columns.join(",");
  const lines = rows.map((r) =>
    columns
      .map((k) => {
        const val = r[k] ?? "";
        const s = String(val);
        return s.includes(",") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      })
      .join(",")
  );
  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${id}.csv"`,
    },
  });
}
