import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { REPORTS } from "../../../../reporting/_data";
import { getMockReport } from "../../_mock";

// Async Supabase client
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

function shouldUseDemo(search: URLSearchParams) {
  return search.get("demo") === "1" || process.env.NEXT_PUBLIC_REPORTS_DEMO === "1";
}

// Next 15: params is Promise
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const report = REPORTS.find((r) => r.id === id);
  if (!report) return new Response("Report not found", { status: 404 });

  const search = req.nextUrl.searchParams;

  let rows: any[] = [];
  if (shouldUseDemo(search)) {
    const mock = getMockReport(id);
    rows = Array.isArray(mock?.rows) ? mock!.rows : [];
  } else {
    try {
      const rpcArgs: Record<string, any> = {
        from: search.get("from") ?? null,
        to: search.get("to") ?? null,
        filters: search.get("filters") ? JSON.parse(search.get("filters") as string) : null,
        limit: Number(search.get("limit") ?? 5000),
        offset: Number(search.get("offset") ?? 0),
      };
      const supabase = await getSupabaseServerClient();
      const sp = report.procedure ?? `sp_${id}`;
      const { data, error } = await supabase.rpc(sp, rpcArgs);
      if (error) rows = [];
      else rows = Array.isArray(data) ? data : (data as any)?.rows ?? [];
    } catch {
      const mock = getMockReport(id);
      rows = Array.isArray(mock?.rows) ? mock!.rows : [];
    }
  }

  // Build workbook
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const fileName = `${report.title.replace(/\s+/g, "_")}.xlsx`;
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
