// W-2 Forms
case "checks/w2-forms": {
  let q = supabase.from("w2_forms").select("*").eq("customer_id", customerId);
  if (start) q = q.gte("tax_year", start); // allow year as start/end string or use pay_date if you prefer
  if (end)   q = q.lte("tax_year", end);
  q = q.order("tax_year", { ascending: false });
  const { data, error } = await q;
  if (error) return NextResponse.json([], { headers: { "x-supabase-error": error.message } });
  rows = (data ?? []).map((r:any) => ({
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

// Garnishment Register
case "checks/garnishment-register": {
  let q = supabase.from("garnishment_register").select("*").eq("customer_id", customerId);
  if (start) q = q.gte("pay_date", start);
  if (end)   q = q.lte("pay_date", end);
  q = q.order("pay_date", { ascending: false });
  const { data, error } = await q;
  if (error) return NextResponse.json([], { headers: { "x-supabase-error": error.message } });
  rows = (data ?? []).map((r:any) => ({
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

// Payroll Tax Liability
case "checks/payroll-tax-liability": {
  let q = supabase.from("payroll_tax_liability").select("*").eq("customer_id", customerId);
  if (start) q = q.gte("period_end", start);
  if (end)   q = q.lte("period_end", end);
  q = q.order("period_end", { ascending: false });
  const { data, error } = await q;
  if (error) return NextResponse.json([], { headers: { "x-supabase-error": error.message } });
  rows = (data ?? []).map((r:any) => ({
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

// Employees roster/active are already implemented by you; keep those.

// Job Roster
case "jobs/job-roster": {
  let q = supabase.from("job_roster").select("*").eq("customer_id", customerId);
  const { data, error } = await q;
  if (error) return NextResponse.json([], { headers: { "x-supabase-error": error.message } });
  rows = (data ?? []).map((r:any) => ({
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

// Job Costing
case "jobs/job-costing": {
  let q = supabase.from("job_costing").select("*").eq("customer_id", customerId);
  if (start) q = q.gte("period_end", start);
  if (end)   q = q.lte("period_end", end);
  q = q.order("period_end", { ascending: false });
  const { data, error } = await q;
  if (error) return NextResponse.json([], { headers: { "x-supabase-error": error.message } });
  rows = (data ?? []).map((r:any) => ({
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

// Earnings Summary
case "salary/earnings-summary": {
  let q = supabase.from("earnings_summary").select("*").eq("customer_id", customerId);
  if (start) q = q.gte("period_end", start);
  if (end)   q = q.lte("period_end", end);
  q = q.order("period_end", { ascending: false });
  const { data, error } = await q;
  if (error) return NextResponse.json([], { headers: { "x-supabase-error": error.message } });
  rows = (data ?? []).map((r:any) => ({
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

// Earnings Detail
case "salary/earnings-detail": {
  let q = supabase.from("earnings_detail").select("*").eq("customer_id", customerId);
  if (start) q = q.gte("pay_date", start);
  if (end)   q = q.lte("pay_date", end);
  q = q.order("pay_date", { ascending: false });
  const { data, error } = await q;
  if (error) return NextResponse.json([], { headers: { "x-supabase-error": error.message } });
  rows = (data ?? []).map((r:any) => ({
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

// Timesheet Summary
case "timecards/timesheet-summary": {
  let q = supabase.from("timesheet_summary").select("*").eq("customer_id", customerId);
  if (start) q = q.gte("period_end", start);
  if (end)   q = q.lte("period_end", end);
  q = q.order("period_end", { ascending: false });
  const { data, error } = await q;
  if (error) return NextResponse.json([], { headers: { "x-supabase-error": error.message } });
  rows = (data ?? []).map((r:any) => ({
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

// Timesheet Detail
case "timecards/timesheet-detail": {
  let q = supabase.from("timesheet_detail").select("*").eq("customer_id", customerId);
  if (start) q = q.gte("work_date", start);
  if (end)   q = q.lte("work_date", end);
  q = q.order("work_date", { ascending: false });
  const { data, error } = await q;
  if (error) return NextResponse.json([], { headers: { "x-supabase-error": error.message } });
  rows = (data ?? []).map((r:any) => ({
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
