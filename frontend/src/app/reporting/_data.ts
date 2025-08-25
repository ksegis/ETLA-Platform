// Central definitions for Reporting: types, labels, catalog, and demo row builders.

export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards";

export const GROUP_LABELS: Record<GroupKey, string> = {
  employee: "Employee",
  checks: "Checks",
  jobs: "Jobs",
  salary: "Salary",
  timecards: "Timecards",
};

export type ReportType = {
  id: string;
  title: string;
  group: GroupKey;
  description?: string;
  category?: string;
  fields?: string;
  approxRows?: number;          // optional; used in the table
  procedure?: string;           // 🔹 optional; used by API routes (e.g., Supabase RPC name)
  buildRows?: (filters?: any) => Promise<any[]> | any[]; // optional; used by PreviewModal
};

// ---------- Demo data builders ----------
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const depts = ["SALES", "SRV/HUB", "TEACH", "WORSHIP", "OPS", "HR"];
const names = ["Aeryn Sun", "John Crichton", "B. Stark", "C. Copeland", "R. Lofthouse"];

function makeCheckRows(count = 160): any[] {
  const rows: any[] = [];
  for (let i = 0; i < count; i++) {
    const m = i % months.length;
    const paydate = `2025-${String(m + 1).padStart(2, "0")}-01`;
    const gross = 2000 + (i % 6) * 120;
    rows.push({
      EMPLOYEENAME: names[i % names.length],
      EMPLOYEEID: `E${String(1 + (i % 250)).padStart(3, "0")}`,
      PAYDATE: paydate,
      GROSS: gross,
      TAX: Math.round(gross * 0.24),
      NETPAY: Math.round(gross * 0.76),
      DEPARTMENT: depts[i % depts.length],
      CHECKNO: 100100 + i,
    });
  }
  return rows;
}

function makeDepartmentAnalysisRows(count = 180): any[] {
  const rows: any[] = [];
  for (let i = 0; i < count; i++) {
    const m = i % months.length;
    const periodstart = `2025-${String(m + 1).padStart(2, "0")}-01`;
    const periodlabel = `${months[m]} 2025`;
    const department = depts[i % depts.length];
    rows.push({
      PERIODSTART: periodstart,
      PERIODLABEL: periodlabel,
      DEPARTMENT: department,
      REGULARPAY: 15000 + (i % 9) * 800,
      OTPAY: [0, 300, 315, 330, 840, 0][i % 6],
      BONUS: [0, 0, 500, 0, 1200, 0][i % 6],
    });
  }
  return rows;
}

function makeJobHistoryRows(count = 140): any[] {
  const titles = ["Sales Associate", "Server", "Teacher", "Worship Lead", "HR Generalist"];
  const actions = ["Promotion", "Transfer", "New Hire", "Lateral Move"];
  const reasons = ["Merit", "Reorg", "Backfill", "Request"];
  const rows: any[] = [];
  for (let i = 0; i < count; i++) {
    const m = i % months.length;
    const periodstart = `2025-${String(m + 1).padStart(2, "0")}-01`;
    const periodlabel = `${months[m]} 2025`;
    rows.push({
      EFFECTIVEDATE: periodstart,
      PERIODLABEL: periodlabel,
      EMPLOYEE: names[i % names.length],
      EMPLOYEEID: `E${String(1 + (i % 250)).padStart(3, "0")}`,
      TITLE: titles[i % titles.length],
      DEPARTMENT: depts[i % depts.length],
      ACTION: actions[i % actions.length],
      REASON: reasons[i % reasons.length],
    });
  }
  return rows;
}

function makePositionHistoryRows(count = 120): any[] {
  const positions = ["Associate", "Sr Associate", "Lead", "Manager"];
  const reasons = ["Backfill", "New Role", "Restructure"];
  const rows: any[] = [];
  for (let i = 0; i < count; i++) {
    const m = i % months.length;
    const periodstart = `2025-${String(m + 1).padStart(2, "0")}-01`;
    const periodlabel = `${months[m]} 2025`;
    rows.push({
      EFFECTIVEDATE: periodstart,
      PERIODLABEL: periodlabel,
      EMPLOYEE: names[i % names.length],
      EMPLOYEEID: `E${String(1 + (i % 250)).padStart(3, "0")}`,
      POSITION: positions[i % positions.length],
      DEPARTMENT: depts[i % depts.length],
      REASON: reasons[i % reasons.length],
    });
  }
  return rows;
}

// ---------- Report catalog ----------
export const REPORTS: ReportType[] = [
  {
    id: "checks-detail",
    title: "Check Detail History",
    group: "checks",
    category: "Payroll",
    fields: "Emp, Dept, Gross, Taxes, Net, Check No, Pay date",
    approxRows: 160,
    description: "Gross-to-net including taxes & deductions by check.",
    // procedure: "sp_checks_detail", // optional—API falls back to sp_${id}
    buildRows: () => makeCheckRows(),
  },
  {
    id: "dept-analysis",
    title: "Department Analysis",
    group: "jobs",
    category: "Compensation",
    fields: "Period, Dept, Regular, OT, Bonus",
    approxRows: 180,
    description: "Pay composition by department and period.",
    // procedure: "sp_dept_analysis",
    buildRows: () => makeDepartmentAnalysisRows(),
  },
  {
    id: "job-history",
    title: "Job History",
    group: "jobs",
    category: "Talent",
    fields: "Emp, Dept, Title, Action, Reason, Effective date",
    approxRows: 140,
    description: "Lifecycle of job changes with reasons.",
    // procedure: "sp_job_history",
    buildRows: () => makeJobHistoryRows(),
  },
  {
    id: "position-history",
    title: "Position History",
    group: "jobs",
    category: "Talent",
    fields: "Emp, Dept, Position, Reason, Effective date",
    approxRows: 120,
    description: "Position changes over time.",
    // procedure: "sp_position_history",
    buildRows: () => makePositionHistoryRows(),
  },
  {
    id: "salary-history",
    title: "Salary History",
    group: "salary",
    category: "Compensation",
    fields: "Emp, Amount, % increase, Reason, Memo",
    approxRows: 110,
    description: "Salary adjustments and rationale.",
    // procedure: "sp_salary_history",
  },
  {
    id: "timecard-detail",
    title: "Time Card Detail History",
    group: "timecards",
    category: "Time",
    fields: "Punches, PTO, Transfers, Period",
    approxRows: 200,
    description: "All punch activity by period.",
    // procedure: "sp_timecard_detail",
  },
];

export function getReportsByGroup(group: GroupKey): ReportType[] {
  return REPORTS.filter((r) => r.group === group);
}

export function getAllReports(): ReportType[] {
  return REPORTS.slice();
}

export function getReportById(id: string): ReportType | undefined {
  return REPORTS.find((r) => r.id === id);
}
