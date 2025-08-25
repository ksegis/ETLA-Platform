import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { REPORTS } from "../../../reporting/_data";
import { getMockReport } from "../_mock";

// Async Supabase server client
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

function shouldUseDemo(search: URLSearchParams) {
  return search.get("demo") === "1" || process.env.NEXT_PUBLIC_REPORTS_DEMO === "1";
}

// Next 15: params is Promise
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const report = REPORTS.find((r) => r.id === id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const search = req.nextUrl.searchParams;

  // DEMO: serve mock immediately if requested
  if (shouldUseDemo(search)) {
    const mock = getMockReport(id);
    return NextResponse.json({
      columns: mock?.columns ?? [],
      rows: mock?.rows ?? [],
      total: mock?.rows?.length ?? 0,
      docs: mock?.docs
    });
  }

  // Otherwise call the stored procedure
  const rpcArgs: Record<string, any> = {
    from: search.get("from") ?? null,
    to: search.get("to") ?? null,
    filters: search.get("filters") ? JSON.parse(search.get("filters") as string) : null,
    limit: Number(search.get("limit") ?? 50),
    offset: Number(search.get("offset") ?? 0),
  };

  try {
    const supabase = await getSupabaseServerClient();
    const sp = report.procedure ?? `sp_${id}`;
    const { data, error } = await supabase.rpc(sp, rpcArgs);
    if (error) {
      // If DB fails, fall back to mock so the UI still works
      const mock = getMockReport(id);
      return NextResponse.json(
        { columns: mock?.columns ?? [], rows: mock?.rows ?? [], total: mock?.rows?.length ?? 0, docs: mock?.docs, warning: error.message },
        { status: 200 }
      );
    }

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

    // If real result is empty, return mock so preview is useful
    if (!rows.length) {
      const mock = getMockReport(id);
      return NextResponse.json({
        columns: mock?.columns ?? columns,
        rows: mock?.rows ?? rows,
        total: mock?.rows?.length ?? total,
        docs: docs ?? mock?.docs
      });
    }

    return NextResponse.json({ columns, rows, total, docs });
  } catch (e: any) {
    const mock = getMockReport(id);
    return NextResponse.json(
      { columns: mock?.columns ?? [], rows: mock?.rows ?? [], total: mock?.rows?.length ?? 0, docs: mock?.docs, warning: e?.message ?? "Server error" },
      { status: 200 }
    );
  }
}
