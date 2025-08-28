export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
// Prefer your tsconfig alias if present:
import { getPayStatementsMock } from "@/mocks/payStatements.mock";
// If alias isn't configured, use: import { getPayStatementsMock } from "../../../../../mocks/payStatements.mock";
// import { fetchPayStatements } from "@/lib/data-sources/payStatements";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ?? undefined;
  const end   = searchParams.get("end")   ?? undefined;

  let rows: ReturnType<typeof getPayStatementsMock> = [];
  try {
    // rows = await fetchPayStatements({ start, end });
    rows = []; // leave empty if you haven't wired the real fetch yet
  } catch {
    rows = [];
  }

  const demoFlag = (process.env.DEMO_MOCKS ?? process.env.NEXT_PUBLIC_DEMO_MOCKS ?? "")
    .toString()
    .toLowerCase();

  if (demoFlag === "on" || rows.length === 0) rows = getPayStatementsMock();
  return NextResponse.json(rows);
}
