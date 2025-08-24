// Shared types and the report catalog (includes your 10 new histories)

export type Category = "payroll" | "hr" | "executive";
export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards" | "all";

export interface ReportType {
  id: string;
  title: string;
  description: string;
  category: Category;              // logical area
  group: Exclude<GroupKey, "all">; // left-nav group
  fields: number;                  // column count (preview)
  estimatedRecords: number;        // preview size
  isFavorite?: boolean;
  lastGenerated?: string;          // ISO
  // extras
  procedure?: string;              // stored procedure name
  docBased?: boolean;              // returns docs (PDF/images)
  docMime?: "pdf" | "image";       // dominant mime if docBased
}

/** ---- Original 12 (kept) ---- */
const BASE_REPORTS: ReportType[] = [
  // Payroll
  { id:"pay_period_analysis", title:"Pay Period Analysis", description:"Summary by period",
    category:"payroll", group:"checks", fields:8,  estimatedRecords:500,  procedure:"sp_pay_period_analysis" },
  { id:"benefit_group_analysis", title:"Benefit Group Analysis", description:"Benefit groups by cost",
    category:"payroll", group:"checks", fields:12, estimatedRecords:150, procedure:"sp_benefit_group_analysis" },
  { id:"department_analysis", title:"Department Analysis", description:"Cost by department",
    category:"payroll", group:"jobs",   fields:15, estimatedRecords:2500, procedure:"sp_department_analysis" },
  { id:"compensation_history", title:"Compensation History", description:"Changes over time",
    category:"payroll", group:"salary", fields:10, estimatedRecords:890,  procedure:"sp_compensation_history" },
  { id:"tax_information", title:"Tax Information", description:"Jurisdictions & withholdings",
    category:"payroll", group:"checks", fields:26, estimatedRecords:1850, procedure:"sp_tax_information" },

  // HR
  { id:"current_demographics", title:"Current Demographics", description:"Workforce snapshot",
    category:"hr", group:"employee", fields:35, estimatedRecords:2113, procedure:"sp_current_demographics" },
  { id:"employee_status_history", title:"Employee Status History", description:"Active/inactive changes",
    category:"hr", group:"employee", fields:6,  estimatedRecords:450,  procedure:"sp_employee_status_history" },
  { id:"position_history", title:"Position History", description:"Role changes",
    category:"hr", group:"jobs",     fields:13, estimatedRecords:670,  procedure:"sp_position_history" },
  { id:"custom_fields", title:"Custom Fields", description:"User-defined attributes",
    category:"hr", group:"employee", fields:5,  estimatedRecords:320,  procedure:"sp_custom_fields" },

  // Executive
  { id:"monthly_executive_report", title:"Monthly Executive Report", description:"High-level KPIs",
    category:"executive", group:"salary", fields:25, estimatedRecords:12,   procedure:"sp_monthly_exec" },
  { id:"detailed_analytics", title:"Detailed Analytics", description:"Deep-dive dataset",
    category:"executive", group:"salary", fields:50, estimatedRecords:5000, procedure:"sp_detailed_analytics" },
  { id:"compliance_report", title:"Compliance Report", description:"Audit readiness",
    category:"executive", group:"employee", fields:30, estimatedRecords:2113, procedure:"sp_compliance_report" },
];

/** ---- NEW: Your 10 History reports ---- */
const HISTORY_REPORTS: ReportType[] = [
  // 1) Check Detail History
  { id:"check_detail_history", title:"Check Detail History",
    description:"Gross-to-net: earnings, deductions, taxes, memos, pay date/week/number, check number, etc.",
    category:"payroll", group:"checks", fields:40, estimatedRecords:5000,
    procedure:"sp_check_detail_history" },

  // 2) Time Card Detail History
  { id:"time_card_detail_history", title:"Time Card Detail History",
    description:"All punches, PTO, department transfers, etc.",
    category:"hr", group:"timecards", fields:20, estimatedRecords:12000,
    procedure:"sp_time_card_detail_history" },

  // 3) Salary History
  { id:"salary_history", title:"Salary History",
    description:"Amounts, memos, reason codes, % and amount increases.",
    category:"payroll", group:"salary", fields:12, estimatedRecords:2500,
    procedure:"sp_salary_history" },

  // 4) Job History
  { id:"job_history", title:"Job History",
    description:"Job titles, memos, reason codes.",
    category:"hr", group:"jobs", fields:10, estimatedRecords:2200,
    procedure:"sp_job_history" },

  // 5) Status History
  { id:"status_history", title:"Status History",
    description:"Hire dates, term dates, leave dates, etc.",
    category:"hr", group:"employee", fields:8, estimatedRecords:2600,
    procedure:"sp_status_history" },

  // 6) W2s (document-based)
  { id:"w2_documents", title:"W-2 Documents",
    description:"Client-supplied W-2 PDF images with metadata and download links.",
    category:"payroll", group:"checks", fields:6, estimatedRecords:2113,
    procedure:"sp_w2_document_index", docBased:true, docMime:"pdf" },

  // 7) Benefit History
  { id:"benefit_history", title:"Benefit History",
    description:"Plan names, major plan details, election dates.",
    category:"hr", group:"employee", fields:15, estimatedRecords:1800,
    procedure:"sp_benefit_history" },

  // 8) Recruitment History (document-based)
  { id:"recruitment_history", title:"Recruitment History",
    description:"Applications, dates, cover letters, resumes, notes.",
    category:"hr", group:"employee", fields:12, estimatedRecords:3500,
    procedure:"sp_recruitment_history", docBased:true, docMime:"pdf" },

  // 9) Performance History (document-based)
  { id:"performance_history", title:"Performance History",
    description:"Review dates, supervisor notes, attached PDFs/images.",
    category:"hr", group:"employee", fields:10, estimatedRecords:1400,
    procedure:"sp_performance_history", docBased:true, docMime:"pdf" },

  // 10) Paper Records History (document-based)
  { id:"paper_records_history", title:"Paper Records History",
    description:"Scanned boxes → PDF images for searchable access.",
    category:"executive", group:"employee", fields:7, estimatedRecords:9000,
    procedure:"sp_paper_records_index", docBased:true, docMime:"pdf" },
];

export const REPORTS: ReportType[] = [...BASE_REPORTS, ...HISTORY_REPORTS];

export const GROUP_LABELS: Record<Exclude<GroupKey,"all">, string> = {
  employee: "Employee",
  checks: "Checks",
  jobs: "Jobs",
  salary: "Salary",
  timecards: "Timecards",
};

export function getReportsByGroup(group: GroupKey): ReportType[] {
  if (group === "all") return REPORTS;
  return REPORTS.filter(r => r.group === group);
}
