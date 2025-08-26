import { NextResponse } from "next/server";
import { getMockRows } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic"; // keep previews fresh

export async function GET(req: Request, context: any) {
  const id = String(context?.params?.id || "report");
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") || 50); // default preview size
  const allRows = getMockRows(id);
  const rows = allRows.slice(0, Math.max(0, limit));

  const columns = rows[0] ? Object.keys(rows[0]) : [];

  return NextResponse.json(
    {
      id,
      total: allRows.length,
      columns,
      rows,
    },
    { status: 200 }
  );
}
