export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPayStatementsMock } from "@/mocks/payStatements.mock";
// import { fetchPayStatements } from "@/lib/data-sources/payStatements";

function fitDateIntoRange(iso: string, start?: string | null, end?: string | null) {
  if (!start && !end) return iso;
  // choose end if present, else start
  return (end ?? start) ?? iso;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end   = searchParams.get("end");

  let rows: any[] = [];
  try {
    // rows = await fetchPayStatements({ start: start ?? undefined, end: end ?? undefined });
    rows = [];
  } catch {
    rows = [];
  }

  const demoFlag = (process.env.DEMO_MOCKS ?? process.env.NEXT_PUBLIC_DEMO_MOCKS ?? "")
    .toString().toLowerCase();

  if (demoFlag === "on" || rows.length === 0) {
    rows = getPayStatementsMock();
  }

  // normalize shape + guarantee id + fit dates into range if provided
  const normalized = rows.map((r: any, idx: number) => {
    const payDate = fitDateIntoRange(r.payDate ?? r.pay_date, start, end);
    return {
      id: r.id ?? r.checkNumber ?? `PS-${idx + 1}`,
      checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + idx}`,
      employeeId: r.employeeId ?? r.employee_id ?? "",
      employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
      payDate,
      payPeriodStart: r.payPeriodStart ?? r.pay_period_start ?? (start ?? r.payPeriodStart ?? ""),
      payPeriodEnd: r.payPeriodEnd ?? r.pay_period_end ?? (end ?? r.payPeriodEnd ?? ""),
      netPay: Number(r.netPay ?? r.net_pay ?? r.amount ?? 0),
      depositLast4: r.depositLast4 ?? r.accountLast4 ?? r.last4 ?? "",
    };
  });

  return NextResponse.json(normalized);
}
