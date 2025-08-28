// Central mapping for report ids → rows. Use this from both /preview and /export.
import { getPayStatementsMock } from "@/mocks/payStatements.mock";
import { getCheckRegisterMock } from "@/mocks/checkRegister.mock";
import { getDirectDepositRegisterMock } from "@/mocks/directDepositRegister.mock";
// If/when you want live DB, import your Supabase client here and swap per case.

export type ReportParams = { start?: string | null; end?: string | null };

function normalizeId(segments: string[]): string {
  // join & normalize common variants
  const raw = segments.join("/").toLowerCase();
  return raw
    .replace(/_/g, "-")
    .replace(/^checks-/, "checks/")
    .replace(/^checks\-(pay|check|direct)/, "checks/$1")
    .replace(/^checks-check-register$/, "checks/check-register")
    .replace(/^checks-direct-deposit-register$/, "checks/direct-deposit-register");
}

function fitDate(iso: string, p: ReportParams) {
  if (!p.start && !p.end) return iso;
  return (p.end ?? p.start) ?? iso;
}

export async function getReportRows(idSegments: string[], params: ReportParams): Promise<any[]> {
  const id = normalizeId(idSegments);
  const demo = (process.env.DEMO_MOCKS ?? process.env.NEXT_PUBLIC_DEMO_MOCKS ?? "")
    .toString().toLowerCase() === "on";

  // ⚠️ Start with empty → then, if demo or empty, use mocks.
  let rows: any[] = [];

  switch (id) {
    case "checks/pay-statements": {
      // TODO: swap to DB if you want: rows = await supabase.from("pay_statements")...
      if (demo || rows.length === 0) rows = getPayStatementsMock();
      rows = rows.map((r, i) => ({
        id: r.id ?? r.checkNumber ?? `PS-${i + 1}`,
        checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + i}`,
        employeeId: r.employeeId ?? r.employee_id ?? "",
        employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
        payDate: fitDate(r.payDate ?? r.pay_date ?? "", params),
        payPeriodStart: r.payPeriodStart ?? r.pay_period_start ?? (params.start ?? ""),
        payPeriodEnd: r.payPeriodEnd ?? r.pay_period_end ?? (params.end ?? ""),
        netPay: Number(r.netPay ?? r.net_pay ?? r.amount ?? 0),
        depositLast4: r.depositLast4 ?? r.accountLast4 ?? r.last4 ?? "",
      }));
      break;
    }
    case "checks/check-register": {
      if (demo || rows.length === 0) rows = getCheckRegisterMock();
      rows = rows.map((r, i) => ({
        id: r.id ?? r.checkNumber ?? `CR-${i + 1}`,
        checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + i}`,
        employeeId: r.employeeId ?? r.employee_id ?? "",
        employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
        payDate: fitDate(r.payDate ?? r.pay_date ?? "", params),
        grossPay: Number(r.grossPay ?? r.gross_pay ?? 0),
        taxes: Number(r.taxes ?? r.tax ?? 0),
        deductions: Number(r.deductions ?? r.deduction ?? 0),
        netPay: Number(r.netPay ?? r.net_pay ?? r.amount ?? 0),
      }));
      break;
    }
    case "checks/direct-deposit-register": {
      if (demo || rows.length === 0) rows = getDirectDepositRegisterMock();
      rows = rows.map((r, i) => ({
        id: r.id ?? r.employeeId ?? `DD-${i + 1}`,
        employeeId: r.employeeId ?? r.employee_id ?? "",
        employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
        payDate: fitDate(r.payDate ?? r.pay_date ?? "", params),
        amount: Number(r.amount ?? r.netPay ?? r.net_pay ?? 0),
        bankName: r.bankName ?? r.bank_name ?? "",
        accountType: r.accountType ?? r.account_type ?? "Checking",
        accountLast4: r.accountLast4 ?? r.last4 ?? "",
        routingMasked: r.routingMasked ?? r.routing_masked ?? undefined,
      }));
      break;
    }
    default: {
      rows = []; // Unknown id → empty
    }
  }

  return rows;
}

export function toCSV(rows: any[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = (v ?? "").toString();
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
}
