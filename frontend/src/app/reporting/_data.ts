// frontend/src/app/reporting/_data.ts
export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards" | "all";

export const GROUP_LABELS: Record<Exclude<GroupKey, "all">, string> = {
  employee: "Employee",
  checks: "Checks",
  jobs: "Jobs",
  salary: "Salary",
  timecards: "Timecards",
};

export type ReportType = {
  id: string;                 // <= used by /api/reports/[id]
  title: string;
  group: Exclude<GroupKey, "all">;
  category?: string;
  description?: string;
  fields?: number;
  approxRows?: number;
};

export const REPORTS: ReportType[] = [
  /** Checks */
  {
    id: "check-detail-history",
    title: "Check Detail History",
    group: "checks",
    category: "Payroll",
    description:
      "Gross-to-net: earnings, deductions, taxes, memos, pay date/week/number, check number, etc.",
    fields: 40,
    approxRows: 5000,
  },
  {
    id: "benefit-group-analysis",
    title: "Benefit Group Analysis",
    group: "checks",
    category: "Payroll",
    description: "Benefit groups by cost",
    fields: 12,
    approxRows: 150,
  },
  {
    id: "pay-period-analysis",
    title: "Pay Period Analysis",
    group: "checks",
    category: "Payroll",
    description: "Summary by period",
    fields: 8,
    approxRows: 500,
  },
  {
    id: "tax-information",
    title: "Tax Information",
    group: "checks",
    category: "Payroll",
    description: "Jurisdictions & withholdings",
    fields: 26,
    approxRows: 1850,
  },
  {
    id: "w2-documents",
    title: "W-2 Documents",
    group: "checks",
    category: "Payroll",
    description: "Client-supplied W-2 PDF images with metadata and download links.",
    fields: 6,
    approxRows: 2100,
  },

  /** Jobs */
  {
    id: "department-analysis",
    title: "Department Analysis",
    group: "jobs",
    category: "Jobs",
    description:
      "Pay composition by department and period: headcount/FTE, regular/OT/bonus, employer taxes, benefits, burden, and avg comp.",
    fields: 20,
    approxRows: 1200,
  },
  {
    id: "job-history",
    title: "Job History",
    group: "jobs",
    category: "Jobs",
    description: "Effective-dated job changes: job code/title, dept, location, FLSA, pay group.",
    fields: 22,
    approxRows: 3200,
  },
  {
    id: "position-history",
    title: "Position History",
    group: "jobs",
    category: "Jobs",
    description: "Effective-dated position changes: position id, manager, cost center, FTE.",
    fields: 24,
    approxRows: 2600,
  },

  /** Employee */
  {
    id: "employee-directory",
    title: "Employee Directory",
    group: "employee",
    category: "Core HR",
    description: "Directory with work contact, dept, location, manager and employment dates.",
    fields: 18,
    approxRows: 1500,
  },
  {
    id: "headcount-summary",
    title: "Headcount Summary",
    group: "employee",
    category: "Core HR",
    description: "Headcount/FTE by department and location with hires/terms.",
    fields: 14,
    approxRows: 240,
  },

  /** Salary / Comp */
  {
    id: "salary-grade-distribution",
    title: "Salary Grade Distribution",
    group: "salary",
    category: "Compensation",
    description: "Population by grade, min/mid/max, compa-ratio and range penetration.",
    fields: 16,
    approxRows: 900,
  },
  {
    id: "compa-ratio",
    title: "Compa-Ratio by Department",
    group: "salary",
    category: "Compensation",
    description: "Avg compa-ratio and range penetration by department.",
    fields: 10,
    approxRows: 120,
  },
  {
    id: "merit-forecast",
    title: "Merit Increase Forecast",
    group: "salary",
    category: "Compensation",
    description: "Proposed merit/market/lump-sum changes and new compa-ratio.",
    fields: 22,
    approxRows: 450,
  },

  /** Timecards */
  {
    id: "timecard-detail",
    title: "Timecard Detail",
    group: "timecards",
    category: "Time",
    description: "Punches by day with total hours, project/cost center, approvals.",
    fields: 24,
    approxRows: 8000,
  },
  {
    id: "overtime-analysis",
    title: "Overtime Analysis",
    group: "timecards",
    category: "Time",
    description: "OT hours and cost by employee/department, week and rule.",
    fields: 18,
    approxRows: 700,
  },
  {
    id: "absence-summary",
    title: "Absence Summary",
    group: "timecards",
    category: "Time",
    description: "PTO/LOA usage and balances by employee and plan.",
    fields: 16,
    approxRows: 650,
  },
];

export function getAllReports(): ReportType[] {
  return REPORTS;
}
export function getReportsByGroup(group: GroupKey | string): ReportType[] {
  if (!group || group === "all") return REPORTS;
  return REPORTS.filter((r) => r.group === group);
}
export function getReportById(id: string): ReportType | undefined {
  return REPORTS.find((r) => r.id === id);
}
