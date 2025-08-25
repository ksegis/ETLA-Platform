import { NextResponse } from "next/server";
import { getMockRows } from "@/app/reporting/_mock";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Always return mock rows for now (simplest, most reliable demo path).
  const { id } = params;
  const rows = getMockRows(id);
  return NextResponse.json({ id, rows, count: rows.length });
}
