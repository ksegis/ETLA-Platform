// src/app/api/reports/[...id]/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeId(segments: string[]): string {
  const raw = segments.join("/").toLowerCase();
  return raw.replace(/_/g, "-");
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const customerId = url.searchParams.get("customerId") || "DEMO";

  // Extract segments from the pathname instead of using `{ params }`
  // e.g. /api/reports/checks/pay-statements/preview
  const base = "/api/reports/";
  const idx = url.pathname.indexOf(base);
  const tail = idx >= 0 ? url.pathname.slice(idx + base.length) : "";
  const segs = tail.split("/").filter(Boolean);

  let action: "preview" | "export" = "preview";
  const last = segs[segs.length - 1]?.toLowerCase();
  if (last === "preview" || last === "export") {
    action = last as "preview" | "export";
    segs.pop();
  }
  const id = normalizeId(segs);

  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE =
    process.env.SUPABASE_SERVICE_ROLE_TOKEN ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return NextResponse.json([], { headers: { "x-missing-env": "supabase" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  let rows: any[] = [];

  switch (id) {
    // ===== CHECKS =====
    case "checks/pay-statements": {
      let q = supabase.from("pay_statements").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("pay_date", start);
      if (end)   q = q.lte("pay_date", end);
      q = q.order("pay_date", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
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
      break;
    }

    case "checks/check-register": {
      let q = supabase.from("check_register").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("pay_date", start);
      if (end)   q = q.lte("pay_date", end);
      q = q.order("pay_date", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        checkNumber: r.check_number,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        payDate: r.pay_date,
        grossPay: Number(r.gross_pay),
        taxes: Number(r.taxes),
        deductions: Number(r.deductions),
        netPay: Number(r.net_pay),
      }));
      break;
    }

    case "checks/direct-deposit-register": {
      let q = supabase.from("direct_deposit_register").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("pay_date", start);
      if (end)   q = q.lte("pay_date", end);
      q = q.order("pay_date", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        payDate: r.pay_date,
        amount: Number(r.amount),
        bankName: r.bank_name ?? null,
        accountType: r.account_type ?? null,
        accountLast4: r.account_last4 ?? null,
        routingMasked: r.routing_masked ?? null,
      }));
      break;
    }

    case "checks/w2-forms": {
      let q = supabase.from("w2_forms").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("tax_year", start);
      if (end)   q = q.lte("tax_year", end);
      q = q.order("tax_year", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        taxYear: r.tax_year,
        ssnMasked: r.ssn_masked ?? null,
        wages: Number(r.wages ?? 0),
        federalTaxWithheld: Number(r.federal_tax_withheld ?? 0),
        state: r.state ?? null,
        stateWages: Number(r.state_wages ?? 0),
      }));
      break;
    }

    case "checks/garnishment-register": {
      let q = supabase.from("garnishment_register").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("pay_date", start);
      if (end)   q = q.lte("pay_date", end);
      q = q.order("pay_date", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        orderType: r.order_type ?? null,
        caseNumber: r.case_number ?? null,
        payDate: r.pay_date,
        amount: Number(r.amount ?? 0),
        ytdAmount: Number(r.ytd_amount ?? 0),
      }));
      break;
    }

    case "checks/payroll-tax-liability": {
      let q = supabase.from("payroll_tax_liability").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("period_end", start);
      if (end)   q = q.lte("period_end", end);
      q = q.order("period_end", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        taxType: r.tax_type,
        periodEnd: r.period_end,
        liabilityAmount: Number(r.liability_amount ?? 0),
        depositDueDate: r.deposit_due_date ?? null,
        depositDate: r.deposit_date ?? null,
        status: r.status ?? null,
      }));
      break;
    }

    // ===== EMPLOYEES =====
    case "employees/roster":
    case "employees/active": {
      let q = supabase.from("employees").select("*").eq("customer_id", customerId);
      if (id.endsWith("active")) q = q.eq("status", "active");
      q = q.order("full_name", { ascending: true });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        employeeId: r.id,
        fullName: r.full_name,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email ?? null,
        phone: r.phone ?? null,
        status: r.status,
        hireDate: r.hire_date ?? null,
        termDate: r.term_date ?? null,
        department: r.department ?? null,
        location: r.location ?? null,
        jobTitle: r.job_title ?? null,
        payType: r.pay_type ?? null,
        payRate: r.pay_rate != null ? Number(r.pay_rate) : null,
      }));
      break;
    }

    // ===== JOBS =====
    case "jobs/job-roster": {
      const { data, error } = await supabase
        .from("job_roster")
        .select("*")
        .eq("customer_id", customerId);
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        jobCode: r.job_code,
        jobName: r.job_name,
        status: r.status ?? null,
        startDate: r.start_date ?? null,
        endDate: r.end_date ?? null,
        department: r.department ?? null,
      }));
      break;
    }

    case "jobs/job-costing": {
      let q = supabase.from("job_costing").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("period_end", start);
      if (end)   q = q.lte("period_end", end);
      q = q.order("period_end", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        jobCode: r.job_code,
        jobName: r.job_name,
        periodStart: r.period_start,
        periodEnd: r.period_end,
        laborHours: Number(r.labor_hours ?? 0),
        laborCost: Number(r.labor_cost ?? 0),
        burdenCost: Number(r.burden_cost ?? 0),
        totalCost: Number(r.total_cost ?? 0),
      }));
      break;
    }

    // ===== SALARY =====
    case "salary/earnings-summary": {
      let q = supabase.from("earnings_summary").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("period_end", start);
      if (end)   q = q.lte("period_end", end);
      q = q.order("period_end", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        periodStart: r.period_start,
        periodEnd: r.period_end,
        regularHours: Number(r.regular_hours ?? 0),
        overtimeHours: Number(r.overtime_hours ?? 0),
        grossPay: Number(r.gross_pay ?? 0),
      }));
      break;
    }

    case "salary/earnings-detail": {
      let q = supabase.from("earnings_detail").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("pay_date", start);
      if (end)   q = q.lte("pay_date", end);
      q = q.order("pay_date", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        payDate: r.pay_date,
        earningCode: r.earning_code ?? null,
        hours: Number(r.hours ?? 0),
        rate: Number(r.rate ?? 0),
        amount: Number(r.amount ?? 0),
      }));
      break;
    }

    // ===== TIMECARDS =====
    case "timecards/timesheet-summary": {
      let q = supabase.from("timesheet_summary").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("period_end", start);
      if (end)   q = q.lte("period_end", end);
      q = q.order("period_end", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        periodStart: r.period_start,
        periodEnd: r.period_end,
        totalHours: Number(r.total_hours ?? 0),
        overtimeHours: Number(r.overtime_hours ?? 0),
      }));
      break;
    }

    case "timecards/timesheet-detail": {
      let q = supabase.from("timesheet_detail").select("*").eq("customer_id", customerId);
      if (start) q = q.gte("work_date", start);
      if (end)   q = q.lte("work_date", end);
      q = q.order("work_date", { ascending: false });
      const { data, error } = await q;
      if (error) break;
      rows = (data ?? []).map((r: any) => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        workDate: r.work_date,
        projectCode: r.project_code ?? null,
        jobCode: r.job_code ?? null,
        hours: Number(r.hours ?? 0),
        payCode: r.pay_code ?? null,
      }));
      break;
    }

    default:
      rows = [];
  }

  if (action === "export") {
    const csv = toCSV(rows);
    const filename =
      (segs.length ? segs.join("_") : "report").toLowerCase().replace(/\W+/g, "-") + ".csv";
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename=${filename}`,
        "cache-control": "no-store",
      },
    });
  }

  return NextResponse.json(rows, { headers: { "cache-control": "no-store" } });
}
