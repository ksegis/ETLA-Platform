import { NextRequest, NextResponse } from "next/server";
import { getMockRows } from "@/app/reporting/_mock";

// Keep everything dynamic (no caching)
export const dynamic = "force-dynamic";

type Dict<T = any> = Record<string, T>;

function toCSV(rows: Dict[], columns: string[]): string {
  const header = columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
  const body = rows
    .map((r) =>
      columns
        .map((c) => {
          const v = r[c];
          const s =
            v == null
              ? ""
              : typeof v === "string"
              ? v
              : typeof v === "number"
              ? String(v)
              : JSON.stringify(v);
          return `"${String(s).replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? "0");
  const columnsParam = url.searchParams.get("columns"); // optional: comma-separated list

  // ✅ Await the mock rows (it returns a Promise)
  const allRows = await getMockRows(id);
  const rows = limit > 0 ? allRows.slice(0, limit) : allRows;

  // Columns: explicit query → keys of first row → empty
  let columns: string[] = [];
  if (columnsParam) {
    columns = columnsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (rows.length > 0) {
    columns = Object.keys(rows[0]);
  }

  const csv = toCSV(rows, columns);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${id}.csv"`,
    },
  });
}
