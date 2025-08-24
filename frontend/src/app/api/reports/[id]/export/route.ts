import { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/supabaseServer";
import { REPORTS } from "@/app/reporting/_data";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const report = REPORTS.find(r => r.id === id);
  if (!report) return new Response("Report not found", { status: 404 });

  const search = req.nextUrl.searchParams;
  const rpcArgs: Record<string, any> = {
    from: search.get("from") ?? null,
    to: search.get("to") ?? null,
    filters: search.get("filters") ? JSON.parse(search.get("filters") as string) : null,
    // pull more rows for export; caller can override with ?limit=
    limit: Number(search.get("limit") ?? 5000),
    offset: Number(search.get("offset") ?? 0),
  };

  const supabase = getSupabaseServerClient();
  const sp = report.procedure ?? `sp_${id}`;
  const { data, error } = await supabase.rpc(sp, rpcArgs);
  if (error) return new Response(error.message, { status: 400 });

  const rows: any[] = Array.isArray(data) ? data : (data?.rows ?? []);
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
