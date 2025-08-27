// frontend/src/app/reporting/_data.ts

// ---------- types ----------
export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards";

export type Report = {
  id: string;                        // unique id used by routes & mock generators
  title: string;                     // display name
  group: GroupKey;                   // nav group
  description?: string;              // short blurb
  fields?: (string | { name?: string; label?: string })[]; // sample columns to show in list
  approxRows?: number;               // hint for UI only
  // used by PreviewModal to decide facsimile renderer (if any)
  // "table" = default grid, "pay" = PayStatement, "w2" = W2Form, "timecard" = TimecardForm
  kind?: "table" | "pay" | "w2" | "timecard";
};

// ---------- labels ----------
export const GROUP_LABELS: Record<GroupKey, string> = {
  employee: "Employee",
  checks: "Pay & Checks",
  jobs: "Jobs",
  salary: "Comp & Deductions",
  timecards: "Timecards",
};

// ---------- catalog ----------
export const REPORTS: Report[] = [
  //
  // EMPLOYEE (includes demographics you asked for)
  //
  {
    id: "employee_master_demographics",
    title: "Employee Master Demographics",
    group: "employee",
    description: "Reference profile for HR, managers, and audits.",
    approxRows: 250,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Middle Initial",
      "Preferred Name",
      "Date of Birth",
      "Gender",
      "Marital Status",
      "SSN (masked)",
      "Address",
      "Personal Email",
      "Personal Phone",
      "Emergency Contact",
      "Hire Date",
      "Employment Status",
      "Termination Date",
      "Job Title",
      "Department",
      "Location",
    ],
  },
  {
    id: "eeo1",
    title: "EEO-1",
    group: "employee",
    description: "EEO-1 workforce composition by establishment and category.",
    approxRows: 250,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Gender",
      "Race / Ethnicity",
      "Job Category",
      "Hire Date",
      "Location / Establishment",
      "Employment Status",
    ],
  },
  {
    id: "vets_4212",
    title: "VETS-4212",
    group: "employee",
    description: "Federal contractor veteran employment report.",
    approxRows: 250,
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
  },
  {
    id: "benefit_eligibility",
    title: "Benefit Eligibility / Carrier Feed",
    group: "employee",
    description: "Demographics for benefits enrollment and ACA compliance.",
    approxRows: 250,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Date of Birth",
      "Gender",
      "Marital Status",
      "Address",
      "Hire Date",
      "Employment Status",
      "Benefit Eligibility Date",
      "Dependent Name",
      "Dependent DOB",
      "Dependent Relationship",
      "Dependent Gender",
      "Coverage Level",
    ],
  },
  {
    id: "payroll_tax_demographics",
    title: "Payroll & Tax Demographics",
    group: "employee",
    description: "Verification of payroll setup & tax filing readiness.",
    approxRows: 250,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "SSN (masked)",
      "Address",
      "State of Residence",
      "Work Location State",
      "Federal Filing Status",
      "State Filing Status",
      "Dependents / Allowances",
      "Direct Deposit (last 4)",
    ],
  },
  {
    id: "turnover_termination_demographics",
    title: "Turnover / Termination Demographics",
    group: "employee",
    description: "Exit tracking for retention and trend analysis.",
    approxRows: 120,
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Hire Date",
      "Termination Date",
      "Job Title",
      "Department",
      "Location",
      "Status at Exit",
      "Termination Reason / Code",
      "Gender",
      "Race / Ethnicity",
    ],
  },
  {
    id: "custom_demographic_analytics",
    title: "Custom Demographic Analytics",
    group: "employee",
    description: "Age, tenure, diversity and workforce mix.",
    approxRows: 250,
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
  },

  //
  // CHECKS (restored)
  //
  {
    id: "pay_statements",
    title: "Pay Statements",
    group: "checks",
    description: "Individual employee pay stubs (facsimile view).",
    approxRows: 800,
    kind: "pay",
    fields: [
      "Check Number",
      "Employee ID",
      "Employee Name",
      "Pay Date",
      "Pay Period Start",
      "Pay Period End",
      "Net Pay",
      "Deposit (last 4)",
    ],
  },
  {
    id: "check_register",
    title: "Check Register",
    group: "checks",
    description: "Issued checks and direct deposits.",
    approxRows: 800,
    kind: "table",
    fields: [
      "Check Number",
      "Employee ID",
      "Employee Name",
      "Pay Date",
      "Gross Pay",
      "Taxes",
      "Deductions",
      "Net Pay",
      "Payment Method",
    ],
  },
  {
    id: "direct_deposit_register",
    title: "Direct Deposit Register",
    group: "checks",
    description: "ACH distribution by account.",
    approxRows: 800,
    kind: "table",
    fields: [
      "Employee ID",
      "Employee Name",
      "Pay Date",
      "Amount",
      "Bank Name",
      "Account Type",
      "Account (last 4)",
      "Routing (masked)",
    ],
  },
  {
    id: "w2_forms",
    title: "W-2 Forms",
    group: "checks",
    description: "Annual W-2 facsimiles by employee.",
    approxRows: 250,
    kind: "w2",
    fields: [
      "Employee ID",
      "Employee Name",
      "Tax Year",
      "SSN (masked)",
      "Wages",
      "Federal Tax Withheld",
      "State",
      "State Wages",
      "State Tax",
    ],
  },
  {
    id: "garnishment_register",
    title: "Garnishment Register",
    group: "checks",
    description: "Garnishment deductions and remittances.",
    approxRows: 140,
    kind: "table",
    fields: [
      "Employee ID",
      "Employee Name",
      "Pay Date",
      "Order Type",
      "Case Number",
      "Amount",
      "YTD Amount",
      "Agency",
    ],
  },
  {
    id: "tax_liability_summary",
    title: "Payroll Tax Liability Summary",
    group: "checks",
    description: "Employer tax liabilities by period.",
    approxRows: 52,
    kind: "table",
    fields: [
      "Period",
      "941 Social Security",
      "941 Medicare",
      "FUTA",
      "SUTA",
      "Local",
      "Total Liability",
      "Deposit Due",
    ],
  },

  //
  // JOBS
  //
  {
    id: "job_history",
    title: "Job History",
    group: "jobs",
    description: "Promotions, transfers, and job changes.",
    approxRows: 300,
    fields: [
      "Employee ID",
      "Employee Name",
      "Effective Date",
      "From Title",
      "To Title",
      "From Dept",
      "To Dept",
      "Location",
      "Reason",
    ],
  },
  {
    id: "position_roster",
    title: "Position Roster",
    group: "jobs",
    description: "Active positions and incumbents.",
    approxRows: 180,
    fields: [
      "Position ID",
      "Job Title",
      "Department",
      "Location",
      "FTE",
      "Incumbent Count",
    ],
  },
  {
    id: "org_directory",
    title: "Org Directory",
    group: "jobs",
    description: "Directory by department and manager.",
    approxRows: 250,
    fields: [
      "Employee ID",
      "Employee Name",
      "Job Title",
      "Department",
      "Manager",
      "Work Email",
      "Work Phone",
      "Location",
    ],
  },

  //
  // SALARY / COMP
  //
  {
    id: "compensation_register",
    title: "Compensation Register",
    group: "salary",
    description: "Base pay rates and comp elements.",
    approxRows: 250,
    fields: [
      "Employee ID",
      "Employee Name",
      "Pay Rate",
      "Pay Type",
      "FLSA Status",
      "Grade",
      "Range Min",
      "Range Mid",
      "Range Max",
      "Effective Date",
    ],
  },
  {
    id: "overtime_summary",
    title: "Overtime Summary",
    group: "salary",
    description: "OT hours and dollars by employee.",
    approxRows: 200,
    fields: [
      "Employee ID",
      "Employee Name",
      "Period",
      "OT Hours",
      "OT Rate",
      "OT Amount",
    ],
  },
  {
    id: "deduction_summary",
    title: "Deduction Summary",
    group: "salary",
    description: "Recurring and one-time deductions.",
    approxRows: 220,
    fields: [
      "Employee ID",
      "Employee Name",
      "Deduction Code",
      "Description",
      "Amount",
      "Pre/Post Tax",
      "Start Date",
      "End Date",
    ],
  },

  //
  // TIMECARDS
  //
  {
    id: "timecard_detail",
    title: "Timecard Detail",
    group: "timecards",
    description: "Daily punches with facsimile sheet.",
    approxRows: 1200,
    kind: "timecard",
    fields: [
      "Employee ID",
      "Employee Name",
      "Work Date",
      "In",
      "Out",
      "Break",
      "Hours",
      "Earnings Code",
      "Department",
      "Location",
    ],
  },
  {
    id: "timecard_summary",
    title: "Timecard Summary",
    group: "timecards",
    description: "Weekly totals by earnings code.",
    approxRows: 600,
    fields: [
      "Employee ID",
      "Employee Name",
      "Week Ending",
      "Reg Hours",
      "OT Hours",
      "PTO Hours",
      "Total Hours",
    ],
  },
  {
    id: "punch_audit",
    title: "Punch Audit",
    group: "timecards",
    description: "Adds/edits to time entries.",
    approxRows: 300,
    fields: [
      "Employee ID",
      "Employee Name",
      "Work Date",
      "Action",
      "Old Value",
      "New Value",
      "Changed By",
      "Changed At",
    ],
  },
];

// ---------- helpers ----------
export function getAllReports(): Report[] {
  return REPORTS;
}

export function getReportsByGroup(group: GroupKey): Report[] {
  return REPORTS.filter((r) => r.group === group);
}

export function getReportById(id: string): Report | undefined {
  return REPORTS.find((r) => r.id === id);
}
