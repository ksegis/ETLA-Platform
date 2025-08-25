// Shared metadata and helpers for reporting

export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards";

export type ReportType = {
  id: string;            // stable id used by preview/export
  slug: string;          // safe filename hint
  title: string;
  description: string;
  group: GroupKey;
  fields?: number;
  approxRows?: number;
};

export const GROUP_LABELS: Record<GroupKey, string> = {
  employee: "Employee",
  checks: "Checks",
  jobs: "Jobs",
  salary: "Salary",
  timecards: "Timecards",
};

export const REPORTS: ReportType[] = [
  {
    id: "dept-analysis",
    slug: "department-analysis",
    title: "Department Analysis",
    description:
      "Pay composition by department and period (headcount/FTE, regular/OT/bonus, employer taxes, benefits, burden, avg comp).",
    group: "jobs",
    fields: 20,
    approxRows: 1200,
  },
  {
    id: "job-history",
    slug: "job-history",
    title: "Job History",
    description:
      "Lifecycle of job changes: job code/grade/level/manager/location, effective dates, reasons.",
    group: "jobs",
    fields: 22,
    approxRows: 3200,
  },
  {
    id: "position-history",
    slug: "position-history",
    title: "Position History",
    description:
      "Position changes over time: headcount, vacancies, incumbents, FTE, cost center.",
    group: "jobs",
    fields: 24,
    approxRows: 2600,
  },
];

export function getReportsByGroup(group?: string): ReportType[] {
  if (!group) return REPORTS;
  return REPORTS.filter((r) => r.group === (group as GroupKey));
}

export function getReportById(id: string): ReportType | undefined {
  return REPORTS.find((r) => r.id === id);
}
