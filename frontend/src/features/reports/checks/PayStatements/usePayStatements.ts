import { useEffect, useState } from "react";
import { getPayStatementsMock } from "@/mocks/payStatements.mock";

type PayStatementRow = {
  id: string;
  checkNumber: string;
  employeeId: string;
  employeeName: string;
  payDate: string;        // ISO
  payPeriodStart: string; // ISO
  payPeriodEnd: string;   // ISO
  netPay: number;
  depositLast4?: string;
};

function normalize(rows: any[], start?: string, end?: string): PayStatementRow[] {
  const fitDate = (iso?: string | null) => (end ?? start ?? iso ?? "");
  return rows.map((r, idx) => ({
    id: r.id ?? r.checkNumber ?? `PS-${idx + 1}`,
    checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + idx}`,
    employeeId: r.employeeId ?? r.employee_id ?? "",
    employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
    payDate: fitDate(r.payDate ?? r.pay_date),
    payPeriodStart: r.payPeriodStart ?? r.pay_period_start ?? (start ?? ""),
    payPeriodEnd: r.payPeriodEnd ?? r.pay_period_end ?? (end ?? ""),
    netPay: Number(r.netPay ?? r.net_pay ?? r.amount ?? 0),
    depositLast4: r.depositLast4 ?? r.accountLast4 ?? r.last4 ?? "",
  }));
}

export function usePayStatements(params: { start?: string; end?: string }) {
  // 🔒 Always start with mocks so the grid has rows immediately
  const [rows, setRows] = useState<PayStatementRow[]>(
    normalize(getPayStatementsMock(), params.start, params.end)
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        if (params.start) qs.set("start", params.start);
        if (params.end) qs.set("end", params.end);

        const res = await fetch(`/api/reports/checks/pay-statements?${qs.toString()}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const normalized = normalize(data, params.start, params.end);
          if (!cancelled) setRows(normalized);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.start, params.end]);

  // Return both rows and data for compatibility with various table wrappers
  return { rows, data: rows, loading, error: err };
}
