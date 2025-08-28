import { useEffect, useState } from "react";
import { getCheckRegisterMock } from "@/mocks/checkRegister.mock";

type CheckRegisterRow = {
  id: string;
  checkNumber: string;
  employeeId: string;
  employeeName: string;
  payDate: string; // ISO
  grossPay: number;
  taxes: number;
  deductions: number;
  netPay: number;
};

function normalizeCheckRegister(rows: any[], start?: string, end?: string): CheckRegisterRow[] {
  const fitDate = (iso?: string | null) => {
    if (!start && !end) return iso ?? "";
    return (end ?? start) ?? (iso ?? "");
  };
  return rows.map((r, idx) => ({
    id: r.id ?? r.checkNumber ?? `CR-${idx + 1}`,
    checkNumber: r.checkNumber ?? r.check_number ?? r.checkNo ?? `MOCK-${1000 + idx}`,
    employeeId: r.employeeId ?? r.employee_id ?? "",
    employeeName: r.employeeName ?? r.employee_name ?? r.name ?? "",
    payDate: fitDate(r.payDate ?? r.pay_date),
    grossPay: Number(r.grossPay ?? r.gross_pay ?? 0),
    taxes: Number(r.taxes ?? r.tax ?? 0),
    deductions: Number(r.deductions ?? r.deduction ?? 0),
    netPay: Number(r.netPay ?? r.net_pay ?? r.amount ?? 0),
  }));
}

export function useCheckRegister(params: { start?: string; end?: string }) {
  const [rows, setRows] = useState<CheckRegisterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        if (params.start) qs.set("start", params.start);
        if (params.end) qs.set("end", params.end);

        const res = await fetch(`/api/reports/checks/check-register?${qs.toString()}`, {
          credentials: "include",
        });

        let data: any[] = [];
        if (res.ok) data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          const mock = getCheckRegisterMock();
          const normalized = normalizeCheckRegister(mock, params.start, params.end);
          if (!cancelled) setRows(normalized);
          return;
        }

        const normalized = normalizeCheckRegister(data, params.start, params.end);
        if (!cancelled) setRows(normalized);
      } catch (e: any) {
        const mock = getCheckRegisterMock();
        const normalized = normalizeCheckRegister(mock, params.start, params.end);
        if (!cancelled) {
          setErr(e);
          setRows(normalized);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.start, params.end]);

  return { rows, loading, error: err };
}
