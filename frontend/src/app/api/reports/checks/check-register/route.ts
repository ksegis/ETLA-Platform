export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getCheckRegisterMock } from "@/mocks/checkRegister.mock";
// import { fetchCheckRegister } from "@/lib/data-sources/checkRegister";

function fitDateIntoRange(iso: string, start?: string | null, end?: string | null) {
  if (!start && !end) return iso;
  return (end ?? start) ?? iso;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end   = searchParams.get("end");

  let rows: any[] = [];
  try {
    // rows = await fetchCheckRegister({ start: start ?? undefined, end: end ?? undefined });
    rows = [];
  } catch {
    rows = [];
  }

  const demoFlag = (process.env.DEMO_MOCKS ?? process.env.NEXT_PUBLIC_DEMO_MOCKS ?? "")
    .toString().toLowerCase();

  if (demoFlag === "on" || rows.length === 0) {
    rows = getCheckRegisterMock();
  }

  const normalized = rows.map((r: any, idx: number) => {
    const payDate = fitDateIntoRange(r.payDate ?? r.pay_date, start, end);
    return {
      id: r.id ?? r.checkNumber ?? `CR-${idx + 1}`,
      checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + idx}`,
      employeeId: r.employeeId ?? r.employee_id ?? "",
      employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
      payDate,
      grossPay: Number(r.grossPay ?? r.gross_pay ?? 0),
      taxes: Number(r.taxes ?? r.tax ?? 0),
      deductions: Number(r.deductions ?? r.deduction ?? 0),
      netPay: Number(r.netPay ?? r.net_pay ?? r.amount ?? 0),
    };
  });

  return NextResponse.json(normalized);
}
