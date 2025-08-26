// frontend/src/app/reporting/_data.ts

// Shared types
export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards";

export type ReportType = {
  id: string;            // unique id used in URLs and API routes
  title: string;         // display name
  group: GroupKey;       // left-nav group
  description?: string;
  category?: string;
  fields?: string;       // short “columns” blurb for the All Reports table
  approxRows?: string | number;
  slug?: string;         // optional alias for file names, etc.
  procedure?: string;    // optional server RPC name (when you wire Supabase later)
  docBased?: boolean;    // true = returns documents (e.g., W2 PDFs)
};

// Left-nav labels
export const GROUP_LABELS: Record<GroupKey, string> = {
  employee: "Employee",
  checks: "Checks",
  jobs: "Jobs",
  salary: "Salary",
  timecards: "Timecards",
};

// Canonical list of reports (keep ids stable!)
export const REPORTS: ReportType[] = [
  // Checks / Pay
  {
    id: "check-detail-history",
    slug: "check_detail_history",
    title: "Check Detail History",
    group: "checks",
    category: "Payroll",
    fields:
      "Check #, Pay Date, Pay Period, Gross, Taxes, Deductions, Net, Memo",
    approxRows: "20–2,000",
    description:
      "Gross-to-net detail per paycheck including taxes, deductions, earnings, memos, pay date/period, and identifiers.",
  },

  // Time
  {
    id: "timecard-detail-history",
    slug: "timecard_detail_history",
    title: "Time Card Detail History",
    group: "timecards",
    category: "Time & Attendance",
    fields: "In/Out Punches, Transfers, PTO, Exceptions, Approvals",
    approxRows: "20–10,000",
    description:
      "All punches, department/job transfers, PTO, and audit trail per timecard.",
  },

  // Salary / Comp
  {
    id: "salary-history",
    slug: "salary_history",
    title: "Salary History",
    group: "salary",
    category: "Compensation",
    fields: "Effective Date, Amount, % Change, Reason, Memo",
    approxRows: "10–500",
    description:
      "Compensation change history including effective dates, amounts, percentages, reasons, and memos.",
  },

  // Jobs / Positions
  {
    id: "job-history",
    slug: "job_history",
    title: "Job History",
    group: "jobs",
    category: "Org",
    fields: "Effective Date, Job Title, Location, Reason, Memo",
    approxRows: "10–500",
    description: "Historical job title changes with reasons and notes.",
  },
  {
    id: "position-history",
    slug: "position_history",
    title: "Position History",
    group: "jobs",
    category: "Org",
    fields: "Effective Date, Position, FLSA, Grade, Supervisor",
    approxRows: "10–500",
    description: "Position assignments and changes over time.",
  },
  {
    id: "department-analysis",
    slug: "department_analysis",
    title: "Department Analysis",
    group: "jobs",
    category: "Analytics",
    fields: "Dept, Headcount, Avg Rate, OT, Labor Cost",
    approxRows: "Summary",
    description: "Departmental labor insights (headcount, pay, OT, cost).",
  },

  // Employee / Documents / Benefits / Status
  {
    id: "status-history",
    slug: "status_history",
    title: "Status History",
    group: "employee",
    category: "Employment",
    fields: "Hire, Rehire, Term, Leave, Return Dates; Status",
    approxRows: "5–200",
    description: "Employment lifecycle events and status changes.",
  },
  {
    id: "w2-images",
    slug: "w2_images",
    title: "W-2 Forms",
    group: "employee",
    category: "Tax Documents",
    fields: "Tax Year, Employee, PDF",
    approxRows: "Per year",
    description: "Client-supplied W-2 PDF images by year.",
    docBased: true,
  },
  {
    id: "benefit-history",
    slug: "benefit_history",
    title: "Benefit History",
    group: "employee",
    category: "Benefits",
    fields: "Plan, Coverage, Tier, Election Date, Cost",
    approxRows: "10–500",
    description: "Benefit plan elections and changes over time.",
  },
  {
    id: "recruitment-history",
    slug: "recruitment_history",
    title: "Recruitment History",
    group: "jobs",
    category: "Talent",
    fields: "Requisition, Stage, Dates, Resume, Notes",
    approxRows: "10–2,000",
    description:
      "Recruiting events, cover letters, resumes, and recruiter notes.",
  },
  {
    id: "performance-history",
    slug: "performance_history",
    title: "Performance History",
    group: "jobs",
    category: "Talent",
    fields: "Review Date, Rating, Supervisor Notes, PDF",
    approxRows: "5–200",
    description:
      "Performance reviews with supervisor notes; optionally PDF attachments.",
    docBased: true,
  },
  {
    id: "paper-records-history",
    slug: "paper_records_history",
    title: "Paper Records History",
    group: "employee",
    category: "Documents",
    fields: "Doc Name, Type, Date, PDF",
    approxRows: "Varies",
    description:
      "Scanned historical paper files (converted to PDFs) for quick access.",
    docBased: true,
  },
];

// --- helpers exported for other modules ---

export const getAllReports = (): ReportType[] => REPORTS;

export const getReportsByGroup = (group: GroupKey): ReportType[] =>
  REPORTS.filter((r) => r.group === group);

export const getReportById = (id: string): ReportType | undefined =>
  REPORTS.find((r) => r.id === id);
