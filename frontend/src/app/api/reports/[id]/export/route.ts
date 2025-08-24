import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
// FROM: src/app/api/reports/[id]/export/route.ts → src/app/reporting/_data.ts
import { REPORTS } from "../../../../reporting/_data";

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

// Next.js 15: params is a Promise
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const report = REPORTS.find((r) => r.id === id);
    if (!report) return new Response("Report not found", { status: 404 });

    const search = req.nextUrl.searchParams;
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
    if (error) return new Response(error.message, { status: 400 });

    const rows: any[] = Array.isArray(data) ? data : (data as any)?.rows ?? [];
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
  } catch (e: any) {
    return new Response(e?.message ?? "Server error", { status: 500 });
  }
}
