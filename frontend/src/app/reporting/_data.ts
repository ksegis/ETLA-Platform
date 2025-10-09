// reporting/_data.ts

// --- Types
export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards" | "all";

export type ReportType = {
  id: string;
  title: string;
  description?: string;
  category: string;         // e.g. Payroll, HR
  group: GroupKey;
  fields?: number;          // rough field count (for UI only)
  estimatedRows?: number;   // rough row count (for UI only)
  procedure?: string;       // optional stored procedure name for live data
  docBased?: boolean;       // true => document/PDF style report (e.g. W-2)
};

// --- Labels for the left nav groups (used by ClientGroupPage)
export const GROUP_LABELS: Record<Exclude<GroupKey, "all">, string> = {
  employee: "Employee",
  checks: "Checks",
  jobs: "Jobs",
  salary: "Salary",
  timecards: "Timecards",
};

// --- Catalog of reports (UI metadata)
export const REPORTS: ReportType[] = [
  // ---------------- Checks
  {
    id: "check_detail_history",
    title: "Check Detail History",
    description:
      "Gross-to-net: earnings, deductions, taxes, memos, pay date/week/number, check number, etc.",
    category: "Payroll",
    group: "checks",
    fields: 40,
    estimatedRows: 5000,
    procedure: "sp_check_detail_history",
  },
  {
    id: "pay_period_analysis",
    title: "Pay Period Analysis",
    description: "Summary by pay period.",
    category: "Payroll",
    group: "checks",
    fields: 8,
    estimatedRows: 500,
    procedure: "sp_pay_period_analysis",
  },
  {
    id: "tax_information",
    title: "Tax Information",
    description: "Jurisdictions & withholdings.",
    category: "Payroll",
    group: "checks",
    fields: 26,
    estimatedRows: 1850,
    procedure: "sp_tax_information",
  },
  {
    id: "w2_documents",
    title: "W-2 Documents",
    description: "Client-supplied W-2 PDFs with metadata and download links.",
    category: "Payroll",
    group: "checks",
    fields: 6,
    estimatedRows: 2113,
    docBased: true,
  },

  // ---------------- Pay / Jobs
  {
    id: "department_analysis",
    title: "Department Analysis",
    description:
      "Department labor cost by period: headcount/FTE, regular/OT/bonus, employer taxes, benefits, burden, and avg comp.",
    category: "Payroll",
    group: "jobs",
    fields: 20,
    estimatedRows: 1200,
    procedure: "sp_department_analysis",
  },
  {
    id: "job_history",
    title: "Job History",
    description:
      "Effective-dated job changes: job code/title, action & reason, department, supervisor, FLSA, grade, pay type/rate.",
    category: "HR",
    group: "jobs",
    fields: 22,
    estimatedRows: 3200,
    procedure: "sp_job_history",
  },
  {
    id: "position_history",
    title: "Position History",
    description:
      "Effective-dated position changes: position ID/title, status, FTE/standard hours, grade, cost center, supervisor.",
    category: "HR",
    group: "jobs",
    fields: 24,
    estimatedRows: 2600,
    procedure: "sp_position_history",
  },
];

// --- Helpers used across pages
export function getReportsByGroup(group: GroupKey): ReportType[] {
  if (group === "all") return REPORTS.slice();
  return REPORTS.filter((r) => r.group === group);
}

export function getReportById(id: string): ReportType | undefined {
  return REPORTS.find((r) => r.id === id);
}
