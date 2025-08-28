// src/app/api/reports/[...id]/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeId(segments: string[]): string {
  const raw = segments.join("/").toLowerCase();
  return raw
    .replace(/_/g, "-")
    .replace(/^checks-/, "checks/")
    .replace(/^checks\-(pay|check|direct)/, "checks/$1")
    .replace(/^checks-check-register$/, "checks/check-register")
    .replace(/^checks-direct-deposit-register$/, "checks/direct-deposit-register");
}

function toCSV(rows: any[]): string {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = (v ?? "").toString();
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
}

// Use `any` for ctx to avoid Next 15 route signature type noise
export async function GET(req: Request, ctx: any) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end   = url.searchParams.get("end");

  const raw = ctx?.params?.id as string | string[] | undefined;
  const segs = Array.isArray(raw) ? [...raw] : (raw ? [raw] : []);

  // trailing "preview" or "export" (default: preview JSON)
  let action: "preview" | "export" = "preview";
  const last = segs[segs.length - 1]?.toLowerCase();
  if (last === "preview" || last === "export") {
    action = last as "preview" | "export";
    segs.pop();
  }

  const id = normalizeId(segs);
  let rows: any[] = [];

  if (id === "checks/pay-statements") {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
    );

    // Build query with optional date filter
    let q = supabase.from("pay_statements").select("*");
    if (start) q = q.gte("pay_date", start);
    if (end)   q = q.lte("pay_date", end);
    q = q.order("pay_date", { ascending: false });

    const { data, error } = await q;
    if (error) {
      // Surface an empty list to UI but include header for debugging if needed
      return NextResponse.json([], {
        headers: { "x-error": `pay_statements:${error.message}` },
        status: 200,
      });
    }

    // Normalize DB → UI shape (camelCase)
    rows = (data ?? []).map((r: any) => ({
      id: r.id,
      checkNumber: r.check_number,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      payDate: r.pay_date,
      payPeriodStart: r.pay_period_start,
      payPeriodEnd: r.pay_period_end,
      netPay: Number(r.net_pay),
      depositLast4: r.deposit_last4 ?? null,
    }));
  } else {
    // Not implementing other reports in this pass; return empty
    rows = [];
  }

  if (action === "export") {
    const csv = toCSV(rows);
    const filename = (segs.length ? segs.join("_") : "report")
      .toLowerCase()
      .replace(/\W+/g, "-") + ".csv";
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename=${filename}`,
        "cache-control": "no-store",
      },
    });
  }

  return NextResponse.json(rows);
}
