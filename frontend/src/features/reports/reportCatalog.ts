// src/features/reports/reportCatalog.ts
export type Col = {
  key: string;
  label: string;
  width?: number | string;
  align?: "left" | "right" | "center";
};

export type FilterControl =
  | { type: "search"; key: string; label: string; placeholder?: string }
  | { type: "date"; key: "start" | "end"; label: string }
  | { type: "select"; key: string; label: string; options: { value: string; label: string }[] };

export type ReportDef = {
  id: string;                // used by /api/reports/[...id]
  title: string;
  description?: string;
  group: "employee" | "checks" | "jobs" | "salary" | "timecards";
  hasFacsimile?: boolean;    // adds a "Display" action column
  columns: Col[];
  filters: FilterControl[];
};

export const REPORTS: ReportDef[] = [
  // -------- EMPLOYEE
  {
    id: "employees/roster",
    title: "Employee Roster",
    description: "Active employees with core profile fields",
    group: "employee",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "first_name", label: "First" },
      { key: "last_name", label: "Last" },
      { key: "status", label: "Status" },
      { key: "department", label: "Department" },
      { key: "title", label: "Title" },
      { key: "location", label: "Location" },
      { key: "hire_date", label: "Hire Date" },
      { key: "term_date", label: "Term Date" },
    ],
    filters: [
      { type: "search", key: "q", label: "Search", placeholder: "Name / EmpID" },
      { type: "select", key: "status", label: "Status", options: [
        { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }
      ]},
      { type: "select", key: "department", label: "Department", options: [] },
      { type: "select", key: "location", label: "Location", options: [] },
      { type: "date", key: "start", label: "Start" },
      { type: "date", key: "end", label: "End" },
    ],
  },
  {
    id: "employees/active",
    title: "Employee – Active",
    description: "Active employee snapshot",
    group: "employee",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "department", label: "Department" },
      { key: "title", label: "Title" },
      { key: "location", label: "Location" },
      { key: "hire_date", label: "Hire Date" },
      { key: "tenure_years", label: "Tenure (yrs)" },
    ],
    filters: [
      { type: "search", key: "q", label: "Search", placeholder: "Name / EmpID" },
      { type: "select", key: "department", label: "Department", options: [] },
      { type: "select", key: "location", label: "Location", options: [] },
    ],
  },
  {
    id: "employees/master-demographics",
    title: "Employee Master Demographics",
    description: "Reference profile for HR/managers",
    group: "employee",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "first_name", label: "First" },
      { key: "last_name", label: "Last" },
      { key: "gender", label: "Gender" },
      { key: "dob", label: "DOB" },
      { key: "marital_status", label: "Marital Status" },
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "zip", label: "Zip" },
    ],
    filters: [
      { type: "search", key: "q", label: "Search", placeholder: "Name / EmpID" },
      { type: "select", key: "gender", label: "Gender", options: [] },
      { type: "date", key: "start", label: "DOB From" },
      { type: "date", key: "end", label: "DOB To" },
    ],
  },
  { id: "employees/eeo1", title: "EEO-1", description: "EEO-1 composition", group: "employee",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "gender", label: "Gender" },
      { key: "race_ethnicity", label: "Race / Ethnicity" },
      { key: "job_category", label: "EEO Category" },
      { key: "hire_date", label: "Hire Date" },
      { key: "location", label: "Establishment" },
    ],
    filters: [
      { type: "select", key: "location", label: "Establishment", options: [] },
      { type: "select", key: "job_category", label: "EEO Category", options: [] },
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },
  { id: "employees/vets4212", title: "VETS-4212", description: "Federal contractor veteran employment report", group: "employee",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "job_title", label: "Job Title" },
      { key: "department", label: "Department" },
      { key: "hire_date", label: "Hire Date" },
      { key: "veteran_status", label: "Veteran Status" },
      { key: "location", label: "Location" },
    ],
    filters: [
      { type: "select", key: "veteran_status", label: "Veteran Status", options: [] },
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },
  { id: "employees/benefit-carrier", title: "Benefit Eligibility / Carrier Feed", description: "Eligibility & ACA compliance", group: "employee",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "plan_name", label: "Plan" },
      { key: "carrier", label: "Carrier" },
      { key: "eligibility_date", label: "Eligibility Date" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { type: "select", key: "carrier", label: "Carrier", options: [] },
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },
  { id: "employees/payroll-tax-demo", title: "Payroll & Tax Demographics", description: "Filing readiness", group: "employee",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "ssn_masked", label: "SSN (masked)" },
      { key: "address", label: "Address" },
      { key: "state_of_residence", label: "State of Residence" },
      { key: "work_state", label: "Work State" },
      { key: "federal_filing_status", label: "Federal Filing Status" },
    ],
    filters: [
      { type: "select", key: "state_of_residence", label: "Residence", options: [] },
      { type: "select", key: "work_state", label: "Work State", options: [] },
      { type: "select", key: "federal_filing_status", label: "Fed Filing", options: [] },
    ],
  },
  { id: "employees/terminations", title: "Turnover / Termination Demographics", description: "Exit tracking & trend analysis", group: "employee",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "department", label: "Department" },
      { key: "job_title", label: "Job Title" },
      { key: "termination_date", label: "Termination Date" },
      { key: "termination_reason", label: "Reason" },
      { key: "location", label: "Location" },
    ],
    filters: [
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
      { type: "select", key: "termination_reason", label: "Reason", options: [] },
    ],
  },
  { id: "employees/custom-analytics", title: "Custom Demographic Analytics", description: "Age, tenure, diversity mix", group: "employee",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "gender", label: "Gender" },
      { key: "race_ethnicity", label: "Race / Ethnicity" },
      { key: "age", label: "Age" },
      { key: "tenure_years", label: "Tenure (yrs)" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "employment_type", label: "Employment Type" },
    ],
    filters: [
      { type: "select", key: "employment_type", label: "Employment Type", options: [] },
      { type: "select", key: "department", label: "Department", options: [] },
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },

  // -------- CHECKS
  {
    id: "checks/pay-statements",
    title: "Pay Statements",
    description: "Individual employee pay stubs (facsimile view).",
    group: "checks",
    hasFacsimile: true,
    columns: [
      { key: "check_number", label: "Check #" },
      { key: "employee_id", label: "Employee" },
      { key: "employee_name", label: "Employee Name" },
      { key: "pay_date", label: "Pay Date" },
      { key: "pay_period_start", label: "Period Start" },
      { key: "pay_period_end", label: "Period End" },
      { key: "net_pay", label: "Net Pay" },
      { key: "deposit_last4", label: "Deposit (last 4)" },
    ],
    filters: [
      { type: "search", key: "q", label: "Search", placeholder: "EmpID/Name/Check#" },
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },
  {
    id: "checks/check-register",
    title: "Check Register",
    description: "Issued checks and direct deposits.",
    group: "checks",
    columns: [
      { key: "check_number", label: "Check #" },
      { key: "employee_id", label: "Employee" },
      { key: "employee_name", label: "Employee Name" },
      { key: "pay_date", label: "Pay Date" },
      { key: "gross_pay", label: "Gross" },
      { key: "taxes", label: "Taxes" },
      { key: "deductions", label: "Deductions" },
      { key: "net_pay", label: "Net" },
    ],
    filters: [
      { type: "search", key: "q", label: "Search", placeholder: "EmpID/Name/Check#" },
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },
  {
    id: "checks/direct-deposit-register",
    title: "Direct Deposit Register",
    description: "ACH distribution by account.",
    group: "checks",
    columns: [
      { key: "employee_id", label: "Employee" },
      { key: "employee_name", label: "Employee Name" },
      { key: "pay_date", label: "Pay Date" },
      { key: "amount", label: "Amount" },
      { key: "bank_name", label: "Bank" },
      { key: "account_type", label: "Account Type" },
      { key: "account_last4", label: "Account Last 4" },
    ],
    filters: [
      { type: "search", key: "q", label: "Search", placeholder: "EmpID/Name/Bank" },
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },
  {
    id: "checks/w2-forms",
    title: "W-2 Forms",
    description: "Annual W-2 facsimiles (PDF).",
    group: "checks",
    hasFacsimile: true,
    columns: [
      { key: "employee_id", label: "Employee" },
      { key: "employee_name", label: "Employee Name" },
      { key: "tax_year", label: "Tax Year" },
      { key: "ssn_masked", label: "SSN (masked)" },
      { key: "wages", label: "Wages" },
      { key: "federal_tax_withheld", label: "Federal Withheld" },
      { key: "state", label: "State" },
      { key: "state_wages", label: "State Wages" },
    ],
    filters: [
      { type: "select", key: "tax_year", label: "Tax Year", options: [] },
      { type: "search", key: "q", label: "Search", placeholder: "EmpID/Name" },
    ],
  },
  {
    id: "checks/garnishment-register",
    title: "Garnishment Register",
    description: "Garnishment deductions and balances.",
    group: "checks",
    columns: [
      { key: "employee_id", label: "Employee" },
      { key: "employee_name", label: "Employee Name" },
      { key: "order_type", label: "Order Type" },
      { key: "case_number", label: "Case #" },
      { key: "pay_date", label: "Pay Date" },
      { key: "amount", label: "Amount" },
      { key: "ytd", label: "YTD" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { type: "select", key: "order_type", label: "Order Type", options: [] },
      { type: "select", key: "status", label: "Status", options: [] },
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },
  {
    id: "checks/payroll-tax-liability",
    title: "Payroll Tax Liability",
    description: "Liability and deposit status by period.",
    group: "checks",
    columns: [
      { key: "period_end", label: "Period End" },
      { key: "tax_type", label: "Tax Type" },
      { key: "liability", label: "Liability" },
      { key: "deposit_due", label: "Deposit Due" },
      { key: "deposited", label: "Deposited" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { type: "select", key: "tax_type", label: "Tax Type", options: [] },
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },

  // -------- JOBS
  {
    id: "jobs/job-roster",
    title: "Job Roster",
    description: "All jobs and assignments.",
    group: "jobs",
    columns: [
      { key: "job_code", label: "Job Code" },
      { key: "job_name", label: "Job Name" },
      { key: "status", label: "Status" },
      { key: "department", label: "Department" },
      { key: "start_date", label: "Start" },
      { key: "end_date", label: "End" },
    ],
    filters: [
      { type: "select", key: "status", label: "Status", options: [
        { value: "open", label: "Open" }, { value: "closed", label: "Closed" }
      ]},
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
    ],
  },
  {
    id: "jobs/job-costing",
    title: "Job Costing",
    description: "Labor cost by job and period.",
    group: "jobs",
    columns: [
      { key: "job_code", label: "Job Code" },
      { key: "department", label: "Department" },
      { key: "earning_type", label: "Earning Type" },
      { key: "hours", label: "Hours" },
      { key: "amount", label: "Amount" },
      { key: "period", label: "Period" },
    ],
    filters: [
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
      { type: "select", key: "earning_type", label: "Earning", options: [] },
    ],
  },

  // -------- SALARY
  {
    id: "salary/earnings-summary",
    title: "Earnings Summary",
    description: "Totals by employee/department/earning.",
    group: "salary",
    columns: [
      { key: "employee_id", label: "Employee" },
      { key: "employee_name", label: "Employee Name" },
      { key: "department", label: "Department" },
      { key: "earning_code", label: "Earning Code" },
      { key: "hours", label: "Hours" },
      { key: "amount", label: "Amount" },
      { key: "period", label: "Period" },
    ],
    filters: [
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
      { type: "select", key: "department", label: "Department", options: [] },
    ],
  },
  {
    id: "salary/earnings-detail",
    title: "Earnings Detail",
    description: "Per-check earning line items.",
    group: "salary",
    columns: [
      { key: "employee_id", label: "Employee" },
      { key: "employee_name", label: "Employee Name" },
      { key: "earning_code", label: "Earning Code" },
      { key: "rate", label: "Rate" },
      { key: "hours", label: "Hours" },
      { key: "amount", label: "Amount" },
      { key: "pay_date", label: "Pay Date" },
      { key: "check_number", label: "Check #" },
    ],
    filters: [
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
      { type: "search", key: "q", label: "Search", placeholder: "EmpID/Name/Check#" },
      { type: "select", key: "earning_code", label: "Earning Code", options: [] },
    ],
  },

  // -------- TIMECARDS
  {
    id: "timecards/timesheet-summary",
    title: "Timesheet Summary",
    description: "Hours & cost by period.",
    group: "timecards",
    columns: [
      { key: "employee_id", label: "Employee" },
      { key: "employee_name", label: "Employee Name" },
      { key: "department", label: "Department" },
      { key: "job", label: "Job" },
      { key: "hour_type", label: "Hour Type" },
      { key: "hours", label: "Hours" },
      { key: "amount", label: "Amount" },
      { key: "period", label: "Period" },
    ],
    filters: [
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
      { type: "select", key: "hour_type", label: "Hour Type", options: [] },
    ],
  },
  {
    id: "timecards/timesheet-detail",
    title: "Timesheet Detail",
    description: "Daily entries with approval status.",
    group: "timecards",
    columns: [
      { key: "employee_id", label: "Employee" },
      { key: "employee_name", label: "Employee Name" },
      { key: "date", label: "Date" },
      { key: "job", label: "Job" },
      { key: "hour_type", label: "Hour Type" },
      { key: "hours", label: "Hours" },
      { key: "amount", label: "Amount" },
      { key: "approval_status", label: "Approval" },
    ],
    filters: [
      { type: "date", key: "start", label: "From" },
      { type: "date", key: "end", label: "To" },
      { type: "select", key: "approval_status", label: "Approval", options: [] },
    ],
  },
];

export const REPORTS_BY_GROUP: Record<ReportDef["group"], ReportDef[]> = {
  employee: REPORTS.filter(r => r.group === "employee"),
  checks: REPORTS.filter(r => r.group === "checks"),
  jobs: REPORTS.filter(r => r.group === "jobs"),
  salary: REPORTS.filter(r => r.group === "salary"),
  timecards: REPORTS.filter(r => r.group === "timecards"),
};
