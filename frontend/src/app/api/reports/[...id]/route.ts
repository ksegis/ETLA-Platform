// src/app/api/reports/[...id]/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Map any incoming segment patterns to our canonical id */
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

/** Next 15 route handler (use `any` for ctx to avoid signature type issues) */
export async function GET(req: Request, ctx: any) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end   = url.searchParams.get("end");

  // segments + optional trailing action
  const raw = ctx?.params?.id as string | string[] | undefined;
  const segs = Array.isArray(raw) ? [...raw] : (raw ? [raw] : []);

  let action: "preview" | "export" = "preview";
  const last = segs[segs.length - 1]?.toLowerCase();
  if (last === "preview" || last === "export") {
    action = last as "preview" | "export";
    segs.pop();
  }
  const id = normalizeId(segs);

  // ----- Supabase client (use your Vercel var names) -----
  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  const SUPABASE_SERVICE_ROLE =
    process.env.SUPABASE_SERVICE_ROLE_TOKEN // <-- your configured var
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    ?? process.env.SUPABASE_SERVICE_KEY
    ?? process.env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    // Return empty with a hint in headers if envs are missing
    return NextResponse.json([], {
      status: 200,
      headers: {
        "x-missing-env": `url:${!SUPABASE_URL}, service:${!SUPABASE_SERVICE_ROLE}`,
      },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  let rows: any[] = [];

  switch (id) {
    case "checks/pay-statements": {
      // Build query with optional date filters
      let q = supabase.from("pay_statements").select("*");
      if (start) q = q.gte("pay_date", start);
      if (end)   q = q.lte("pay_date", end);
      q = q.order("pay_date", { ascending: false });

      const { data, error } = await q;
      if (error) {
        // Surface an empty list but include debug header
        return NextResponse.json([], {
          status: 200,
          headers: { "x-supabase-error": error.message },
        });
      }

      // DB → UI (camelCase)
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
      break;
    }

    // Other report ids not implemented yet (return empty array safely)
    default:
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

  // default: JSON preview
  return NextResponse.json(rows, { status: 200, headers: { "cache-control": "no-store" } });
}
