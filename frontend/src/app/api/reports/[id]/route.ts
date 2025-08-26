// frontend/src/app/api/reports/[id]/route.ts
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

export async function GET(req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const id = params.id ?? idFromUrl(req.url);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const report = getReportById(id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();

  let rows = getMockRows(id);
  if (q) rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));

  return NextResponse.json({ report, rows });
}
