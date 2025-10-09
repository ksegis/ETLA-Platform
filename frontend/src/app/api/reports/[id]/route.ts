import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { REPORTS } from "../../../reporting/_data";
import { getMockReport, applyDemoFilters } from "../_mock";

// Async Supabase server client (Next 15: cookies() is async)
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

// Next.js 15: params is a Promise
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const report = REPORTS.find((r) => r.id === id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const search = req.nextUrl.searchParams;

  // ---- DEMO MODE (server-side filtering on mock data) ----
  if (shouldUseDemo(search)) {
    const mock = getMockReport(id);
    const filtered = applyDemoFilters(mock?.rows ?? [], {
      from: search.get("from"),
      to: search.get("to"),
      filters: search.get("filters") ? JSON.parse(search.get("filters") as string) : null,
      limit: Number(search.get("limit") ?? 50),
      offset: Number(search.get("offset") ?? 0),
    });
    return NextResponse.json({
      columns: filtered.columns,
      rows: filtered.rows,
      total: filtered.total,
      docs: mock?.docs,
    });
  }

  // ---- LIVE DATA VIA RPC ----
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
      // Fall back to mock so the UI remains usable
      const mock = getMockReport(id);
      const filtered = applyDemoFilters(mock?.rows ?? [], {
        from: search.get("from"),
        to: search.get("to"),
        filters: rpcArgs.filters,
        limit: rpcArgs.limit,
        offset: rpcArgs.offset,
      });
      return NextResponse.json(
        { columns: filtered.columns, rows: filtered.rows, total: filtered.total, docs: mock?.docs, warning: error.message },
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

    // If live result is empty, serve filtered mock data for a useful preview
    if (!rows.length) {
      const mock = getMockReport(id);
      const filtered = applyDemoFilters(mock?.rows ?? [], {
        from: search.get("from"),
        to: search.get("to"),
        filters: rpcArgs.filters,
        limit: rpcArgs.limit,
        offset: rpcArgs.offset,
      });
      return NextResponse.json({
        columns: filtered.columns.length ? filtered.columns : columns,
        rows: filtered.rows.length ? filtered.rows : rows,
        total: filtered.total || total,
        docs: docs ?? mock?.docs,
      });
    }

    return NextResponse.json({ columns, rows, total, docs });
  } catch (e: any) {
    const mock = getMockReport(id);
    const filtered = applyDemoFilters(mock?.rows ?? [], {
      from: search.get("from"),
      to: search.get("to"),
      filters: search.get("filters") ? JSON.parse(search.get("filters") as string) : null,
      limit: Number(search.get("limit") ?? 50),
      offset: Number(search.get("offset") ?? 0),
    });
    return NextResponse.json(
      { columns: filtered.columns, rows: filtered.rows, total: filtered.total, docs: mock?.docs, warning: e?.message ?? "Server error" },
      { status: 200 }
    );
  }
}
