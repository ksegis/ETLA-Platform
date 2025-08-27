// ---------- types ----------
export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards";

export const GROUP_LABELS: Record<GroupKey, string> = {
  employee: "Employee",
  checks: "Checks",
  jobs: "Jobs",
  salary: "Salary",
  timecards: "Timecards",
};

export type Column = { key: string; label?: string };

export type Report = {
  id: string;              // stable id used for mock/data routing
  title: string;           // display name
  group: GroupKey;
  category: string;        // shown in "All Reports"
  fields: Column[];        // columns rendered in Preview/CSV
  approxRows: number;
  kind?: "list" | "pay" | "w2" | "timecard";
};

// Back-compat for older imports in the app
export type ReportType = Report;

// ---------- reports ----------
const DEMO: Report[] = [
  {
    id: "employee-master",
    title: "Employee Master Demographics",
    group: "employee",
    category: "Employee",
    approxRows: 1500,
    kind: "list",
    fields: [
      { key: "employeeId", label: "Employee ID" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "middleInitial", label: "Middle Initial" },
      { key: "preferredName", label: "Preferred Name" },
      { key: "dateOfBirth", label: "Date of Birth" },
      { key: "gender", label: "Gender" },
      { key: "maritalStatus", label: "Marital Status" },
      { key: "ssnMasked", label: "SSN (masked)" },
      { key: "address", label: "Address" },
      { key: "personalEmail", label: "Personal Email" },
      { key: "personalPhone", label: "Personal Phone" },
      { key: "emergencyContact", label: "Emergency Contact" },
      { key: "hireDate", label: "Hire Date" },
      { key: "employmentStatus", label: "Employment Status" },
      { key: "terminationDate", label: "Termination Date" },
      { key: "jobTitle", label: "Job Title" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
    ],
  },
  {
    id: "eeo1",
    title: "EEO-1",
    group: "employee",
    category: "Employee",
    approxRows: 1500,
    kind: "list",
    fields: [
      { key: "employeeId", label: "Employee ID" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "gender", label: "Gender" },
      { key: "raceEthnicity", label: "Race / Ethnicity" },
      { key: "jobCategory", label: "Job Category" },
      { key: "hireDate", label: "Hire Date" },
      { key: "establishment", label: "Location / Establishment" },
      { key: "employmentStatus", label: "Employment Status" },
    ],
  },
  {
    id: "vets4212",
    title: "VETS-4212",
    group: "employee",
    category: "Employee",
    approxRows: 1500,
    kind: "list",
    fields: [
      { key: "employeeId", label: "Employee ID" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "jobTitle", label: "Job Title" },
      { key: "department", label: "Department" },
      { key: "hireDate", label: "Hire Date" },
      { key: "veteranStatus", label: "Veteran Status" },
      { key: "location", label: "Location" },
    ],
  },
  {
    id: "benefits-eligibility",
    title: "Benefit Eligibility / Carrier Feed",
    group: "employee",
    category: "Employee",
    approxRows: 1500,
    kind: "list",
    fields: [
      { key: "employeeId", label: "Employee ID" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "dateOfBirth", label: "Date of Birth" },
      { key: "gender", label: "Gender" },
      { key: "maritalStatus", label: "Marital Status" },
      { key: "address", label: "Address" },
      { key: "hireDate", label: "Hire Date" },
      { key: "employmentStatus", label: "Employment Status" },
      { key: "benefitEligibilityDate", label: "Benefit Eligibility Date" },
      { key: "dependentInfo", label: "Dependent Info" },
      { key: "coverageLevel", label: "Coverage Level" },
    ],
  },
  {
    id: "payroll-tax-demo",
    title: "Payroll & Tax Demographics",
    group: "employee",
    category: "Employee",
    approxRows: 1500,
    kind: "list",
    fields: [
      { key: "employeeId", label: "Employee ID" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "ssnMasked", label: "SSN (masked)" },
      { key: "address", label: "Address" },
      { key: "stateOfResidence", label: "State of Residence" },
      { key: "workState", label: "Work Location State" },
      { key: "federalFilingStatus", label: "Federal Filing Status" },
      { key: "stateFilingStatus", label: "State Filing Status" },
      { key: "allowances", label: "Allowances / Dependents" },
      { key: "directDepositMasked", label: "Direct Deposit (masked)" },
    ],
  },
  {
    id: "turnover-demo",
    title: "Turnover / Termination Demographics",
    group: "employee",
    category: "Employee",
    approxRows: 240,
    kind: "list",
    fields: [
      { key: "employeeId", label: "Employee ID" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "hireDate", label: "Hire Date" },
      { key: "terminationDate", label: "Termination Date" },
      { key: "jobTitle", label: "Job Title" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "employmentStatusAtExit", label: "Employment Status at Exit" },
      { key: "terminationReason", label: "Termination Reason / Code" },
      { key: "gender", label: "Gender" },
      { key: "raceEthnicity", label: "Race / Ethnicity" },
    ],
  },
  {
    id: "custom-demo-analytics",
    title: "Custom Demographic Analytics",
    group: "employee",
    category: "Employee",
    approxRows: 900,
    kind: "list",
    fields: [
      { key: "employeeId", label: "Employee ID" },
      { key: "gender", label: "Gender" },
      { key: "raceEthnicity", label: "Race / Ethnicity" },
      { key: "age", label: "Age" },
      { key: "tenureYears", label: "Tenure (years)" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "employmentType", label: "Employment Type" },
    ],
  },
];

// You likely have other (non-demographic) reports defined elsewhere;
// keep those in your repo. Here we just ensure these show up.
export const REPORTS: Report[] = [...DEMO];

// ---------- helpers ----------
export const getAllReports = (): Report[] => REPORTS;

export const getReportsByGroup = (group: GroupKey): Report[] =>
  REPORTS.filter((r) => r.group === group);

export const getReportById = (id: string): Report | undefined =>
  REPORTS.find((r) => r.id === id);
