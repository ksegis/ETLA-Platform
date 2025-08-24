import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, publicUrl } from "../../../lib/supabaseServer"; // <-- rel path
import { REPORTS } from "../../../app/reporting/_data"; // <-- rel path

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
  const total = typeof data?.total === "number" ? data.total : rows.length;
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  let docs: Array<{ id: string; name: string; url?: string; size?: number }> | undefined;
  if (report.docBased) {
    docs = rows.map((r) => {
      const id = String(r.id ?? r.doc_id ?? r.document_id ?? crypto.randomUUID());
      const name = String(r.name ?? r.filename ?? `document-${id}.pdf`);
      let url: string | undefined = r.url ?? r.preview_url;
      if (!url && r.bucket && r.path) url = publicUrl(r.bucket, r.path);
      return { id, name, url, size: Number(r.size ?? 0) };
    });
  }

  return NextResponse.json({ columns, rows, total, docs });
}
