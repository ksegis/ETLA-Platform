import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
// FROM: src/app/api/reports/[id]/route.ts → src/app/reporting/_data.ts
import { REPORTS } from "../../../reporting/_data";

// Async Supabase server client (await cookies())
async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const cookieStore = await cookies();
  const token =
    cookieStore.get("sb-access-token")?.value ??
    cookieStore.get("supabase-auth-token")?.value ??
    undefined;

  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
}

function publicUrl(bucket: string, path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

// Next.js 15: params is a Promise
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    const supabase = await getSupabaseServerClient();
    const sp = report.procedure ?? `sp_${id}`;
    const { data, error } = await supabase.rpc(sp, rpcArgs);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const rows: any[] = Array.isArray(data) ? data : (data as any)?.rows ?? [];
    const total = typeof (data as any)?.total === "number" ? (data as any).total : rows.length;
    const columns = rows[0] ? Object.keys(rows[0]) : [];

    let docs: Array<{ id: string; name: string; url?: string; size?: number }> | undefined;
    if (report.docBased) {
      docs = rows.map((r) => {
        const did = String(r.id ?? r.doc_id ?? r.document_id ?? (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)));
        const name = String(r.name ?? r.filename ?? `document-${did}.pdf`);
        let url: string | undefined = r.url ?? r.preview_url;
        if (!url && r.bucket && r.path) url = publicUrl(r.bucket, r.path);
        return { id: did, name, url, size: Number(r.size ?? 0) };
      });
    }

    return NextResponse.json({ columns, rows, total, docs });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
