import { NextRequest, NextResponse } from "next/server";
// from: src/app/api/reports/[id]/route.ts  →  src/lib/supabaseServer.ts  = 5 levels up
import { getSupabaseServerClient, publicUrl } from "../../../../../lib/supabaseServer";
// from: src/app/api/reports/[id]/route.ts  →  src/app/reporting/_data.ts  = 5 levels up then /app/…
import { REPORTS } from "../../../../../app/reporting/_data";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const report = REPORTS.find((r) => r.id === id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const search = req.nextUrl.searchParams;
  const rpcArgs: Record<string, any> = {
    from: search.get("from") ?? null,
    to: search.get("to") ?? null,
    filters: search.get("filters") ? JSON.parse(search.get("filters") as string) : null,
    limit: Number(search.get("limit") ?? 50),
    offset: Number(search.get("offset") ?? 0),
  };

  const supabase = getSupabaseServerClient();
  const sp = report.procedure ?? `sp_${id}`;
  const { data, error } = await supabase.rpc(sp, rpcArgs);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows: any[] = Array.isArray(data) ? data : data?.rows ?? [];
  const total = typeof (data as any)?.total === "number" ? (data as any).total : rows.length;
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  let docs: Array<{ id: string; name: string; url?: string; size?: number }> | undefined;
  if (report.docBased) {
    docs = rows.map((r) => {
      const did = String(r.id ?? r.doc_id ?? r.document_id ?? crypto.randomUUID());
      const name = String(r.name ?? r.filename ?? `document-${did}.pdf`);
      let url: string | undefined = r.url ?? r.preview_url;
      if (!url && r.bucket && r.path) url = publicUrl(r.bucket, r.path);
      return { id: did, name, url, size: Number(r.size ?? 0) };
    });
  }

  return NextResponse.json({ columns, rows, total, docs });
}
