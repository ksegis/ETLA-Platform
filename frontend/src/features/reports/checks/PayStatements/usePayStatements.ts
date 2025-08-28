import { useEffect, useState } from "react";

export type PayStatementRow = {
  id: string;
  checkNumber: string;
  employeeId: string;
  employeeName: string;
  payDate: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  netPay: number;
  depositLast4?: string;
};

export function usePayStatements(params: { start?: string; end?: string }) {
  const [rows, setRows] = useState<PayStatementRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        if (params.start) qs.set("start", params.start);
        if (params.end) qs.set("end", params.end);

        // Read from Supabase via our server route (no mocks involved)
        const res = await fetch(
          `/api/reports/checks/pay-statements/preview?${qs.toString()}`,
          { cache: "no-store", credentials: "include" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (aborted) return;

        const normalized: PayStatementRow[] = (Array.isArray(data) ? data : []).map(
          (r: any, i: number) => ({
            id: r.id ?? r.checkNumber ?? `PS-${i + 1}`,
            checkNumber: r.checkNumber ?? r.check_number ?? "",
            employeeId: r.employeeId ?? r.employee_id ?? "",
            employeeName: r.employeeName ?? r.employee_name ?? "",
            payDate: r.payDate ?? r.pay_date ?? "",
            payPeriodStart: r.payPeriodStart ?? r.pay_period_start ?? "",
            payPeriodEnd: r.payPeriodEnd ?? r.pay_period_end ?? "",
            netPay: Number(r.netPay ?? r.net_pay ?? 0),
            depositLast4: r.depositLast4 ?? r.deposit_last4 ?? undefined,
          })
        );

        setRows(normalized);
      } catch (e: any) {
        if (!aborted) setError(e?.message ?? "Failed to load pay statements");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [params.start, params.end]);

  // return both shapes; some components use rows vs data
  return { rows, data: rows, loading, error };
}
