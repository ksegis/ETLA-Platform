// src/server/reportRegistry.ts
// Central mapping for report ids → rows (Supabase only; no mocks).

import { createClient } from "@supabase/supabase-js";

export type ReportId =
  | "checks/pay-statements"
  | "checks/check-register"
  | "checks/direct-deposit-register";

type Params = { start?: string; end?: string };

export async function getReportRows(id: ReportId, params: Params = {}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
  );

  switch (id) {
    case "checks/pay-statements": {
      let q = supabase.from("pay_statements").select("*");
      if (params.start) q = q.gte("pay_date", params.start);
      if (params.end)   q = q.lte("pay_date", params.end);
      q = q.order("pay_date", { ascending: false });

      const { data, error } = await q;
      if (error) return [];

      // DB → UI shape (camelCase)
      return (data ?? []).map((r: any) => ({
        id: r.id,
        checkNumber: r.check_number,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        payDate: r.pay_date,
        payPeriodStart: r.pay_period_start,
        payPeriodEnd: r.pay_period_end,
        netPay: Number(r.net_pay),
        depositLast4: r.deposit_last4 ?? null,
      }));
    }

    // Not implemented yet (no mocks). Return empty to avoid build/runtime errors.
    case "checks/check-register":
    case "checks/direct-deposit-register":
    default:
      return [];
  }
}
