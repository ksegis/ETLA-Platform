export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getDirectDepositRegisterMock } from "@/mocks/directDepositRegister.mock";
// import { fetchDirectDepositRegister } from "@/lib/data-sources/directDepositRegister";

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
    // rows = await fetchDirectDepositRegister({ start: start ?? undefined, end: end ?? undefined });
    rows = [];
  } catch {
    rows = [];
  }

  const demoFlag = (process.env.DEMO_MOCKS ?? process.env.NEXT_PUBLIC_DEMO_MOCKS ?? "")
    .toString().toLowerCase();

  if (demoFlag === "on" || rows.length === 0) {
    rows = getDirectDepositRegisterMock();
  }

  const normalized = rows.map((r: any, idx: number) => {
    const payDate = fitDateIntoRange(r.payDate ?? r.pay_date, start, end);
    return {
      id: r.id ?? r.employeeId ?? `DD-${idx + 1}`,
      employeeId: r.employeeId ?? r.employee_id ?? "",
      employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
      payDate,
      amount: Number(r.amount ?? r.netPay ?? r.net_pay ?? 0),
      bankName: r.bankName ?? r.bank_name ?? "",
      accountType: (r.accountType ?? r.account_type ?? "Checking") as "Checking" | "Savings",
      accountLast4: r.accountLast4 ?? r.last4 ?? "",
      routingMasked: r.routingMasked ?? r.routing_masked ?? undefined,
    };
  });

  return NextResponse.json(normalized);
}
