import { useEffect, useState } from "react";
import { getCheckRegisterMock } from "@/mocks/checkRegister.mock";

type CheckRegisterApiRow = {
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
  const [rows, setRows] = useState<CheckRegisterApiRow[] | null>(null);
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CheckRegisterApiRow[] = await res.json();

        const demoFlag = (process.env.NEXT_PUBLIC_DEMO_MOCKS ?? process.env.DEMO_MOCKS ?? "")
          .toString()
          .toLowerCase();

        const useMocks = (Array.isArray(data) && data.length === 0) || demoFlag === "on";
        const finalRows = useMocks ? getCheckRegisterMock() : data;

        if (!cancelled) setRows(finalRows);
      } catch (e: any) {
        if (!cancelled) {
          setRows(getCheckRegisterMock()); // graceful fallback
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
