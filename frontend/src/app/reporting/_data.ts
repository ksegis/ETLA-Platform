// Shared types and the 12-report catalog + group mapping
export type Category = "payroll" | "hr" | "executive";
export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards" | "all";

export interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: string; // name from IconLib
  category: Category;
  fields: number;
  estimatedRecords: number;
  isFavorite?: boolean;
  lastGenerated?: string; // ISO
  group: Exclude<GroupKey, "all">; // one of the 5 left-nav groups
}

export const REPORTS: ReportType[] = [
  // Payroll (5)
  { id:"pay_period_analysis", title:"Pay Period Analysis", description:"Summary by period",
    icon:"dollars", category:"payroll", fields:8, estimatedRecords:500, group:"checks" },
  { id:"benefit_group_analysis", title:"Benefit Group Analysis", description:"Benefit groups by cost",
    icon:"briefcase", category:"payroll", fields:12, estimatedRecords:150, group:"checks" },
  { id:"department_analysis", title:"Department Analysis", description:"Cost by department",
    icon:"building", category:"payroll", fields:15, estimatedRecords:2500, group:"jobs" },
  { id:"compensation_history", title:"Compensation History", description:"Changes over time",
    icon:"history", category:"payroll", fields:10, estimatedRecords:890, group:"salary" },
  { id:"tax_information", title:"Tax Information", description:"Jurisdictions & withholdings",
    icon:"banknote", category:"payroll", fields:26, estimatedRecords:1850, group:"checks" },

  // HR (4)
  { id:"current_demographics", title:"Current Demographics", description:"Workforce snapshot",
    icon:"users", category:"hr", fields:35, estimatedRecords:2113, group:"employee" },
  { id:"employee_status_history", title:"Employee Status History", description:"Active/inactive changes",
    icon:"clipboard", category:"hr", fields:6, estimatedRecords:450, group:"employee" },
  { id:"position_history", title:"Position History", description:"Role changes",
    icon:"edit", category:"hr", fields:13, estimatedRecords:670, group:"jobs" },
  { id:"custom_fields", title:"Custom Fields", description:"User-defined attributes",
    icon:"info", category:"hr", fields:5, estimatedRecords:320, group:"employee" },

  // Executive (3)
  { id:"monthly_executive_report", title:"Monthly Executive Report", description:"High-level KPIs",
    icon:"chart", category:"executive", fields:25, estimatedRecords:12, group:"salary" },
  { id:"detailed_analytics", title:"Detailed Analytics", description:"Deep-dive dataset",
    icon:"trend", category:"executive", fields:50, estimatedRecords:5000, group:"salary" },
  { id:"compliance_report", title:"Compliance Report", description:"Audit readiness",
    icon:"shield", category:"executive", fields:30, estimatedRecords:2113, group:"employee" },
];

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
