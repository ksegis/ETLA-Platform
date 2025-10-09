import { NextResponse } from "next/server";
import { getMockRows } from "@/app/reporting/_mock";

export const dynamic = "force-dynamic"; // no caching

export async function GET(_req: Request, ctx: any) {
  const id = String(ctx?.params?.id ?? "");
  const rows = getMockRows(id);
  return NextResponse.json({ id, rows, count: rows.length });
}
