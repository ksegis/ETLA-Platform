// frontend/src/app/api/reports/[id]/route.ts
import { NextResponse } from "next/server";
import { getReportById } from "@/app/reporting/_data";
import { getMockRows } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const report = getReportById(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  let rows = getMockRows(id);
  if (q) {
    rows = rows.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ report, rows });
}
