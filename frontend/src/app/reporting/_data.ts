// frontend/src/app/reporting/_data.ts
// -----------------------------------------------------------------------------
// Report registry & helpers used by the Reporting UI, PreviewModal, and APIs.
// This file is self-contained and conservative with types to avoid build drift.
// -----------------------------------------------------------------------------

// ----------------------------- Types -----------------------------------------
export type GroupKey = "employee" | "checks" | "timecards" | "jobs" | "salary";

export const GROUP_LABELS: Record<GroupKey, string> = {
  employee: "Employee",
  checks: "Payroll / Pay",
  timecards: "Timecards",
  jobs: "Jobs",
  salary: "Salary",
};

export type ReportKind = "table" | "pay" | "w2" | "timecard" | "docs";

export type ColumnDef = string | { name: string; label?: string };

export interface Report {
  id: string;                 // unique id used in routes (e.g. /api/reports/[id])
  slug?: string;              // used for filenames; falls back to id/title elsewhere
  title: string;              // display name
  group: GroupKey;            // group bucket
  category?: string;          // subcategory label (e.g. "Demographics")
  kind: ReportKind;           // how PreviewModal renders (table/pay/w2/timecard/docs)
  fields?: ColumnDef[];       // columns for table-like previews/exports
  description?: string;       // short help text in UI (optional)

  // Optional flags/metadata kept for backward-compat with earlier code paths:
  approxRows?: number;        // estimated row count for preview
  docBased?: boolean;         // true if API should return documents instead of rows
  procedure?: string;         // name of a DB RPC/stored proc if/when used
}

// ---------------------- Demographics (new, requested) ------------------------
const DEMOGRAPHIC_REPORTS: Report[] = [
  {
    id: "emp_master_demo",
    slug: "employee_master_demographics",
    title: "Employee Master Demographics",
    group: "employee",
    category: "Demographics",
    kind: "table",
    approxRows: 500,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Middle Initial",
      "Preferred Name",
      "Date of Birth",
      "Gender",
      "Marital Status",
      "Social Security Number (masked)",
      "Address (Street, City, State, Zip)",
      "Personal Email",
      "Personal Phone",
      "Emergency Contact (Name, Relationship, Phone)",
      "Hire Date",
      "Employment Status",
      "Termination Date",
      "Job Title",
      "Department",
      "Location",
    ],
    description:
      "General reference for HR, managers, and audits. Includes personal and job info with masked SSN.",
  },
  {
    id: "eeo_1",
    slug: "eeo_1",
    title: "EEO-1",
    group: "employee",
    category: "Demographics",
    kind: "table",
    approxRows: 500,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Gender",
      "Race / Ethnicity",
      "Job Category (EEO category)",
      "Hire Date",
      "Location / Establishment",
      "Employment Status",
    ],
    description: "Equal Employment Opportunity compliance snapshot.",
  },
  {
    id: "vets_4212",
    slug: "vets_4212",
    title: "VETS-4212",
    group: "employee",
    category: "Demographics",
    kind: "table",
    approxRows: 500,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Job Title",
      "Department",
      "Hire Date",
      "Veteran Status",
      "Location",
    ],
    description: "Federal contractor veteran reporting.",
  },
  {
    id: "benefit_eligibility",
    slug: "benefit_eligibility_carrier_feed",
    title: "Benefit Eligibility / Carrier Feed",
    group: "employee",
    category: "Demographics",
    kind: "table",
    approxRows: 500,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Date of Birth",
      "Gender",
      "Marital Status",
      "Address (Street, City, State, Zip)",
      "Hire Date",
      "Employment Status",
      "Benefit Eligibility Date",
      "Dependent Info (Name, DOB, Relationship, Gender)",
      "Coverage Level",
    ],
    description: "Demographics for benefits and ACA compliance.",
  },
  {
    id: "payroll_tax_demo",
    slug: "payroll_tax_demographics",
    title: "Payroll & Tax Demographics",
    group: "employee",
    category: "Demographics",
    kind: "table",
    approxRows: 500,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "SSN (masked)",
      "Address (Street, City, State, Zip)",
      "State of Residence",
      "Work Location State",
      "Federal Filing Status",
      "State Filing Status",
      "Number of Allowances / Dependents",
      "Direct Deposit Bank Info (masked, last 4 digits only)",
    ],
    description: "Payroll verification and tax readiness audit.",
  },
  {
    id: "turnover_demo",
    slug: "turnover_termination_demographics",
    title: "Turnover / Termination Demographics",
    group: "employee",
    category: "Demographics",
    kind: "table",
    approxRows: 500,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Hire Date",
      "Termination Date",
      "Job Title",
      "Department",
      "Location",
      "Employment Status at Exit",
      "Termination Reason / Code",
      "Gender",
      "Race / Ethnicity",
    ],
    description: "Tracks exits and trends across org units with EEOC context.",
  },
  {
    id: "custom_demo_analytics",
    slug: "custom_demographic_analytics",
    title: "Custom Demographic Analytics",
    group: "employee",
    category: "Demographics",
    kind: "table",
    approxRows: 500,
    fields: [
      "Employee ID",
      "Gender",
      "Race / Ethnicity",
      "Age",
      "Tenure",
      "Department",
      "Location",
      "Employment Type",
    ],
    description: "Planning/diversity tracking (Age & Tenure are calculated).",
  },
];

// ----------------------- Core baseline reports (minimal) ---------------------
// These keep other parts of the UI working and provide non-demo examples.
const BASELINE_REPORTS: Report[] = [
  // Checks / Payroll
  {
    id: "pay_register",
    slug: "pay_register",
    title: "Pay Register",
    group: "checks",
    category: "Payroll",
    kind: "table",
    approxRows: 200,
    fields: [
      "Check #",
      "Check Date",
      "Employee ID",
      "Employee",
      "Gross Pay",
      "Taxes",
      "Deductions",
      "Net Pay",
    ],
    description: "High-level register of checks by employee.",
  },
  {
    id: "pay_statements",
    slug: "pay_statements",
    title: "Pay Statements (Facsimile)",
    group: "checks",
    category: "Payroll",
    kind: "pay",          // PreviewModal can render a facsimile
    docBased: false,
    approxRows: 50,
    description: "Pay stub facsimiles for selected checks or periods.",
  },
  {
    id: "w2_forms",
    slug: "w2_forms",
    title: "W-2 Forms (Facsimile)",
    group: "checks",
    category: "Year-End",
    kind: "w2",           // PreviewModal can render a W2 form facsimile
    docBased: true,
    approxRows: 25,
    description: "Year-end W-2 facsimiles for employees.",
  },

  // Timecards
  {
    id: "timecard_detail",
    slug: "timecard_detail",
    title: "Timecard Detail (Facsimile)",
    group: "timecards",
    category: "Time & Attendance",
    kind: "timecard",     // PreviewModal can render a timecard-like layout
    approxRows: 200,
    description: "Punch-level detail per employee and pay period.",
  },
  {
    id: "timecard_summary",
    slug: "timecard_summary",
    title: "Timecard Summary",
    group: "timecards",
    category: "Time & Attendance",
    kind: "table",
    approxRows: 200,
    fields: [
      "Employee ID",
      "Employee",
      "Pay Period Start",
      "Pay Period End",
      "Regular Hours",
      "Overtime Hours",
      "PTO Hours",
      "Total Hours",
    ],
    description: "Summary of hours by category for each employee.",
  },

  // Jobs
  {
    id: "job_roster",
    slug: "job_roster",
    title: "Job Roster",
    group: "jobs",
    category: "Workforce",
    kind: "table",
    approxRows: 300,
    fields: ["Employee ID", "Employee", "Job Title", "Department", "Location", "FLSA Status"],
    description: "Current job, department, and FLSA status.",
  },

  // Salary
  {
    id: "salary_changes",
    slug: "salary_changes",
    title: "Salary Change History",
    group: "salary",
    category: "Compensation",
    kind: "table",
    approxRows: 300,
    fields: [
      "Employee ID",
      "Employee",
      "Effective Date",
      "Old Rate",
      "New Rate",
      "Pay Frequency",
      "Reason",
      "Approved By",
    ],
    description: "Tracks compensation changes over time.",
  },
];

// ----------------------------- Exports ---------------------------------------
export const REPORTS: Report[] = [
  ...DEMOGRAPHIC_REPORTS,
  ...BASELINE_REPORTS,
];

export function getAllReports(): Report[] {
  return REPORTS.slice();
}

export function getReportsByGroup(group: GroupKey): Report[] {
  return REPORTS.filter((r) => r.group === group);
}

export function getReportById(id: string): Report | undefined {
  return REPORTS.find((r) => r.id === id);
}

// Convenience: list groups in a stable order for navigation UIs
export const GROUPS: { key: GroupKey; label: string }[] = ([
  "employee",
  "checks",
  "timecards",
  "jobs",
  "salary",
] as const).map((key) => ({ key, label: GROUP_LABELS[key] }));
