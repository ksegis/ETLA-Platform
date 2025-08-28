// src/features/reports/checks/PayStatements/usePayStatements.ts
import { useEffect, useState } from "react";
import { getPayStatementsMock } from "@/mocks/payStatements.mock";

export type PayStatementRow = {
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
  return (rows ?? []).map((r: any, i: number) => ({
    id: r.id ?? r.checkNumber ?? `PS-${i + 1}`,
    checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + i}`,
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
  // Show mocks immediately so the table is never blank
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

        // 1) Prefer the generic preview route we implemented
        const candidates = [
          `/api/reports/checks/pay-statements/preview?${qs.toString()}`,
          `/api/reports/checks/pay-statements?${qs.toString()}`, // default to preview JSON if no suffix
        ];

        for (const url of candidates) {
          const res = await fetch(url, { cache: "no-store", credentials: "include" });
          if (!res.ok) continue;
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const normalized = normalize(data, params.start, params.end);
            if (!cancelled) setRows(normalized);
            break;
          }
        }
      } catch (e: any) {
        if (!cancelled) setErr(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.start, params.end]);

  // Return both shapes; some tables read `rows`, some read `data`
  return { rows, data: rows, loading, error: err };
}
