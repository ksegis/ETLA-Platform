import { useEffect, useState } from "react";

export type CheckRegisterRow = {
  id: string;
  checkNumber: string;
  employeeId: string;
  employeeName: string;
  payDate: string;
  grossPay: number;
  taxes: number;
  deductions: number;
  netPay: number;
};

export function useCheckRegister(params: { start?: string; end?: string }) {
  const [rows, setRows] = useState<CheckRegisterRow[]>([]);
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

        // Read from the API (which now reads Supabase only)
        const res = await fetch(
          `/api/reports/checks/check-register/preview?${qs.toString()}`,
          { cache: "no-store", credentials: "include" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (aborted) return;

        const normalized: CheckRegisterRow[] = (Array.isArray(data) ? data : []).map(
          (r: any, i: number) => ({
            id: r.id ?? r.checkNumber ?? `CR-${i + 1}`,
            checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? "",
            employeeId: r.employeeId ?? r.employee_id ?? "",
            employeeName: r.employeeName ?? r.employee_name ?? "",
            payDate: r.payDate ?? r.pay_date ?? "",
            grossPay: Number(r.grossPay ?? r.gross_pay ?? 0),
            taxes: Number(r.taxes ?? r.tax ?? 0),
            deductions: Number(r.deductions ?? r.deduction ?? 0),
            netPay: Number(r.netPay ?? r.net_pay ?? 0),
          })
        );

        setRows(normalized);
      } catch (e: any) {
        if (!aborted) setError(e?.message ?? "Failed to load check register");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [params.start, params.end]);

  return { rows, data: rows, loading, error };
}
