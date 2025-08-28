export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

// ✅ correct relative depth (4x ../)
import { getPayStatementsMock } from "../../../../mocks/payStatements.mock";
import { getCheckRegisterMock } from "../../../../mocks/checkRegister.mock";
import { getDirectDepositRegisterMock } from "../../../../mocks/directDepositRegister.mock";

// Accept the official shape Next expects: id can be string | string[]
type RouteParams = { params: { id: string | string[] } };

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

function fitDate(iso: string, start?: string | null, end?: string | null) {
  if (!start && !end) return iso;
  return (end ?? start) ?? iso;
}

// ✅ Use the union type for params; normalize to string[]
export async function GET(req: Request, { params }: RouteParams) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end   = url.searchParams.get("end");

  const segs = Array.isArray(params?.id)
    ? [...params.id]
    : (params?.id ? [params.id] : []);

  // last token may be "preview" or "export"
  let action: "preview" | "export" = "preview";
  const last = segs[segs.length - 1]?.toLowerCase();
  if (last === "export" || last === "preview") {
    action = last as "preview" | "export";
    segs.pop();
  }

  const id = normalizeId(segs);
  let rows: any[] = [];

  switch (id) {
    case "checks/pay-statements":
      rows = getPayStatementsMock().map((r, i) => ({
        id: r.id ?? r.checkNumber ?? `PS-${i + 1}`,
        checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + i}`,
        employeeId: r.employeeId ?? r.employee_id ?? "",
        employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
        payDate: fitDate(r.payDate ?? r.pay_date ?? "", start, end),
        payPeriodStart: r.payPeriodStart ?? r.pay_period_start ?? (start ?? ""),
        payPeriodEnd: r.payPeriodEnd ?? r.pay_period_end ?? (end ?? ""),
        netPay: Number(r.netPay ?? r.net_pay ?? r.amount ?? 0),
        depositLast4: r.depositLast4 ?? r.accountLast4 ?? r.last4 ?? "",
      }));
      break;

    case "checks/check-register":
      rows = getCheckRegisterMock().map((r, i) => ({
        id: r.id ?? r.checkNumber ?? `CR-${i + 1}`,
        checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + i}`,
        employeeId: r.employeeId ?? r.employee_id ?? "",
        employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
        payDate: fitDate(r.payDate ?? r.pay_date ?? "", start, end),
        grossPay: Number(r.grossPay ?? r.gross_pay ?? 0),
        taxes: Number(r.taxes ?? r.tax ?? 0),
        deductions: Number(r.deductions ?? r.deduction ?? 0),
        netPay: Number(r.netPay ?? r.net_pay ?? r.amount ?? 0),
      }));
      break;

    case "checks/direct-deposit-register":
      rows = getDirectDepositRegisterMock().map((r, i) => ({
        id: r.id ?? r.employeeId ?? `DD-${i + 1}`,
        employeeId: r.employeeId ?? r.employee_id ?? "",
        employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
        payDate: fitDate(r.payDate ?? r.pay_date ?? "", start, end),
        amount: Number(r.amount ?? r.netPay ?? r.net_pay ?? 0),
        bankName: r.bankName ?? r.bank_name ?? "",
        accountType: r.accountType ?? r.account_type ?? "Checking",
        accountLast4: r.accountLast4 ?? r.last4 ?? "",
        routingMasked: r.routingMasked ?? r.routing_masked ?? undefined,
      }));
      break;

    default:
      rows = [];
  }

  if (action === "export") {
    const csv = toCSV(rows);
    const filename = (segs.length ? segs.join("_") : "report").toLowerCase().replace(/\W+/g, "-") + ".csv";
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
