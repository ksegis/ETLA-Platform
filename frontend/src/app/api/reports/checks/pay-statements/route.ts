// src/app/api/reports/checks/pay-statements/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPayStatementsMock } from "../../../../../mocks/payStatements.mock";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end   = url.searchParams.get("end");

  // ✅ No cookies object needed
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let rows: any[] = [];
  try {
    let q = supabase.from("pay_statements").select("*");
    if (start) q = q.gte("pay_date", start);
    if (end)   q = q.lte("pay_date", end);
    const { data, error } = await q;
    if (error) throw error;
    rows = data ?? [];
  } catch {
    rows = [];
  }

  const demo = (process.env.DEMO_MOCKS ?? process.env.NEXT_PUBLIC_DEMO_MOCKS ?? "")
    .toString().toLowerCase() === "on";
  if (demo || rows.length === 0) rows = getPayStatementsMock();

  // normalize + id guard (keeps the grid from rendering blank)
  const normalized = rows.map((r: any, i: number) => ({
    id: r.id ?? r.checkNumber ?? `PS-${i + 1}`,
    checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + i}`,
    employeeId: r.employeeId ?? r.employee_id ?? "",
    employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
    payDate: r.payDate ?? r.pay_date ?? end ?? start ?? "",
    payPeriodStart: r.payPeriodStart ?? r.pay_period_start ?? start ?? "",
    payPeriodEnd: r.payPeriodEnd ?? r.pay_period_end ?? end ?? "",
    netPay: Number(r.netPay ?? r.net_pay ?? r.amount ?? 0),
    depositLast4: r.depositLast4 ?? r.accountLast4 ?? r.last4 ?? "",
  }));

  return NextResponse.json(normalized);
}
