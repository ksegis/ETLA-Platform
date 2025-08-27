import { useEffect, useState } from "react";
import { getPayStatementsMock } from "@/mocks/payStatements.mock";

type PayStatementApiRow = {
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
  const [rows, setRows] = useState<PayStatementApiRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // 1) Keep your existing API call intact
        const qs = new URLSearchParams();
        if (params.start) qs.set("start", params.start);
        if (params.end) qs.set("end", params.end);

        const res = await fetch(`/api/reports/checks/pay-statements?${qs.toString()}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PayStatementApiRow[] = await res.json();

        // 2) Fallback to mock only if empty OR DEMO_MOCKS enabled
        const useMocks =
          (Array.isArray(data) && data.length === 0) ||
          (import.meta?.env?.VITE_DEMO_MOCKS === "on" ||
           process.env.DEMO_MOCKS === "on");

        const finalRows = useMocks ? getPayStatementsMock() : data;

        if (!cancelled) setRows(finalRows);
      } catch (e: any) {
        // On error, do NOT explode the page—use mock for demo continuity
        const finalRows = getPayStatementsMock();
        if (!cancelled) {
          setRows(finalRows);
          setErr(e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.start, params.end]);

  return { rows, loading, error: err };
}
