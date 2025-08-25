export type ReportType = {
  id: string;
  title: string;
  description?: string;
  category: string;         // e.g. Payroll, HR
  group: "employee" | "checks" | "jobs" | "salary" | "timecards" | "all";
  fields?: number;          // rough field count
  estimatedRows?: number;   // rough row count
  procedure?: string;       // optional stored procedure name for live data
  docBased?: boolean;       // true = shows document preview (e.g., W-2 PDFs)
};

export const REPORTS: ReportType[] = [
  // ---- CHECKS (examples already in your app) ----
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
    description: "Client-supplied W-2 PDF images with metadata and download links.",
    category: "Payroll",
    group: "checks",
    fields: 6,
    estimatedRows: 2113,
    docBased: true,
  },

  // ---- NEW: PAY REPORTS UNDER JOBS ----
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
