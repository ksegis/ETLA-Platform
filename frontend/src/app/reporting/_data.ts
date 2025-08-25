// Central catalog for all reporting metadata (lists, labels, helpers)

export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards";

export const GROUP_LABELS: Record<GroupKey, string> = {
  employee: "Employee",
  checks: "Checks",
  jobs: "Jobs",
  salary: "Salary",
  timecards: "Timecards",
};

export type ReportType = {
  id: string;            // stable identifier (used by routes)
  slug: string;          // readable id (often same as id)
  title: string;         // display name in the UI
  group: GroupKey;       // menu group
  category?: string;     // optional sub-category label shown in table
  description?: string;  // short blurb under the title
  fields?: number;       // number of columns in the report dataset
  approxRows?: number;   // approximate row count shown in table
  // optional flags for certain behaviors (kept for future use)
  docBased?: boolean;
};

// ---------------------------
// Checks (as before)
// ---------------------------
const CHECKS: ReportType[] = [
  {
    id: "benefit-group-analysis",
    slug: "benefit-group-analysis",
    title: "Benefit Group Analysis",
    group: "checks",
    category: "Payroll",
    description: "Benefit groups by cost",
    fields: 12,
    approxRows: 150,
  },
  {
    id: "check-detail-history",
    slug: "check-detail-history",
    title: "Check Detail History",
    group: "checks",
    category: "Payroll",
    description:
      "Gross-to-net: earnings, deductions, taxes, memos, pay date/week/number, check number, etc.",
    fields: 40,
    approxRows: 5000,
  },
  {
    id: "pay-period-analysis",
    slug: "pay-period-analysis",
    title: "Pay Period Analysis",
    group: "checks",
    category: "Payroll",
    description: "Summary by period",
    fields: 8,
    approxRows: 500,
  },
  {
    id: "tax-information",
    slug: "tax-information",
    title: "Tax Information",
    group: "checks",
    category: "Payroll",
    description: "Jurisdictions & withholdings",
    fields: 26,
    approxRows: 1850,
  },
  {
    id: "w2-documents",
    slug: "w2-documents",
    title: "W-2 Documents",
    group: "checks",
    category: "Payroll",
    description: "Client-supplied W-2 PDF images with metadata and download links.",
    fields: 6,
    approxRows: 2113,
    docBased: true,
  },
];

// ---------------------------
// Jobs (as before)
// ---------------------------
const JOBS: ReportType[] = [
  {
    id: "dept-analysis",
    slug: "dept-analysis",
    title: "Department Analysis",
    group: "jobs",
    category: "Jobs",
    description:
      "Pay composition by department and period (headcount/FTE, regular/OT/bonus, employer taxes/benefits, burden, avg comp).",
    fields: 20,
    approxRows: 1200,
  },
  {
    id: "job-history",
    slug: "job-history",
    title: "Job History",
    group: "jobs",
    category: "Jobs",
    description:
      "Effective-dated job changes: job code/title, department, cost center, location, pay group, reason.",
    fields: 22,
    approxRows: 3200,
  },
  {
    id: "position-history",
    slug: "position-history",
    title: "Position History",
    group: "jobs",
    category: "Jobs",
    description:
      "Effective-dated position changes: positions, incumbents, vacancies, FTE by period/cost center/location.",
    fields: 24,
    approxRows: 2600,
  },
];

// ---------------------------
/* Employee (typical basics; if you had different names before,
   you can just tweak the titles — the table will populate again) */
const EMPLOYEE: ReportType[] = [
  {
    id: "employee-roster",
    slug: "employee-roster",
    title: "Employee Roster",
    group: "employee",
    category: "Employee",
    description:
      "Active roster with home/work info, department, location, manager, and identifiers.",
    fields: 28,
    approxRows: 450,
  },
  {
    id: "headcount-summary",
    slug: "headcount-summary",
    title: "Headcount Summary",
    group: "employee",
    category: "Employee",
    description: "Headcount and FTE by org, department, location, and period.",
    fields: 14,
    approxRows: 60,
  },
  {
    id: "turnover-history",
    slug: "turnover-history",
    title: "Turnover History",
    group: "employee",
    category: "Employee",
    description:
      "New hires, separations, and turnover rates by period with reasons and tenure bands.",
    fields: 18,
    approxRows: 300,
  },
];

// ---------------------------
// Salary (common comp reports)
// ---------------------------
const SALARY: ReportType[] = [
  {
    id: "compensation-summary",
    slug: "compensation-summary",
    title: "Compensation Summary",
    group: "salary",
    category: "Salary",
    description:
      "Base pay, allowances, and total comp by employee; supports range and currency-aware views.",
    fields: 20,
    approxRows: 420,
  },
  {
    id: "range-penetration",
    slug: "range-penetration",
    title: "Range Penetration",
    group: "salary",
    category: "Salary",
    description:
      "Position range min/mid/max with compa-ratio and penetration by employee/grade.",
    fields: 16,
    approxRows: 420,
  },
  {
    id: "merit-history",
    slug: "merit-history",
    title: "Merit History",
    group: "salary",
    category: "Salary",
    description: "Merit and market adjustments by cycle with percent and amount deltas.",
    fields: 14,
    approxRows: 310,
  },
];

// ---------------------------
// Timecards (typical time reports)
// ---------------------------
const TIMECARDS: ReportType[] = [
  {
    id: "timecard-detail",
    slug: "timecard-detail",
    title: "Timecard Detail",
    group: "timecards",
    category: "Time",
    description:
      "In/Out punches, totals, approvals, and pay codes by day and employee.",
    fields: 28,
    approxRows: 6200,
  },
  {
    id: "overtime-summary",
    slug: "overtime-summary",
    title: "Overtime Summary",
    group: "timecards",
    category: "Time",
    description: "OT hours and cost by employee/department/period.",
    fields: 12,
    approxRows: 800,
  },
  {
    id: "exceptions",
    slug: "exceptions",
    title: "Exceptions",
    group: "timecards",
    category: "Time",
    description:
      "Missed punches, unapproved time, policy exceptions, and premium triggers.",
    fields: 12,
    approxRows: 340,
  },
];

// Master list
export const REPORTS: ReportType[] = [
  ...EMPLOYEE,
  ...CHECKS,
  ...JOBS,
  ...SALARY,
  ...TIMECARDS,
];

// Helpers used across pages/components
export function getReportsByGroup(group: GroupKey): ReportType[] {
  return REPORTS.filter((r) => r.group === group);
}

export function getAllReports(): ReportType[] {
  return REPORTS.slice();
}

export function getReportById(idOrSlug: string): ReportType | undefined {
  const key = String(idOrSlug).toLowerCase();
  return REPORTS.find(
    (r) => r.id.toLowerCase() === key || r.slug.toLowerCase() === key
  );
}
