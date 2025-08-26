// frontend/src/app/reporting/_data.ts

// --- Types ---------------------------------------------------------------
export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards";

export type ReportType = {
  id: string;                 // canonical id used in routes (also slug)
  slug: string;               // kept for backward compatibility
  title: string;
  description?: string;
  group: GroupKey;
  category?: string;
  fields?: number | string;   // free-form display of # of fields/columns
  approxRows?: number;        // for UI hints
  docBased?: boolean;         // if the preview is typically a "facsimile" doc
  procedure?: string;         // optional backend/stored-procedure name
  columns?: { key: string; label: string }[];
};

// --- Labels --------------------------------------------------------------
export const GROUP_LABELS: Record<GroupKey, string> = {
  employee: "Employee",
  checks: "Pay / Checks",
  jobs: "Jobs",
  salary: "Compensation",
  timecards: "Time & Labor",
};

// --- Reports -------------------------------------------------------------
// Keep ids stable; these ids are used by API routes and mock factories.
export const REPORTS: ReportType[] = [
  // Checks / Pay
  {
    id: "check-detail-history",
    slug: "check-detail-history",
    title: "Check Detail History",
    group: "checks",
    category: "Pay",
    approxRows: 120,
    docBased: true,
    columns: [
      { key: "checkNumber", label: "Check #" },
      { key: "payDate", label: "Pay Date" },
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "department", label: "Dept" },
      { key: "earnings", label: "Earnings" },
      { key: "taxes", label: "Taxes" },
      { key: "deductions", label: "Deductions" },
      { key: "netPay", label: "Net Pay" },
    ],
  },
  {
    id: "timecard-detail-history",
    slug: "timecard-detail-history",
    title: "Timecard Detail History",
    group: "timecards",
    category: "Time & Labor",
    approxRows: 200,
    columns: [
      { key: "date", label: "Date" },
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "in1", label: "In" },
      { key: "out1", label: "Out" },
      { key: "in2", label: "In" },
      { key: "out2", label: "Out" },
      { key: "hours", label: "Hours" },
      { key: "ptoHours", label: "PTO" },
      { key: "transferDept", label: "Transfer Dept" },
    ],
  },

  // Compensation / Jobs
  {
    id: "salary-history",
    slug: "salary-history",
    title: "Salary History",
    group: "salary",
    category: "Compensation",
    approxRows: 60,
    columns: [
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "effectiveDate", label: "Effective" },
      { key: "amount", label: "Amount" },
      { key: "percentChange", label: "% Change" },
      { key: "changeAmount", label: "Change $" },
      { key: "reasonCode", label: "Reason" },
    ],
  },
  {
    id: "job-history",
    slug: "job-history",
    title: "Job History",
    group: "jobs",
    category: "Jobs",
    approxRows: 50,
    columns: [
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "effectiveDate", label: "Effective" },
      { key: "jobTitle", label: "Job Title" },
      { key: "location", label: "Location" },
      { key: "reasonCode", label: "Reason" },
      { key: "memo", label: "Notes" },
    ],
  },
  {
    id: "position-history",
    slug: "position-history",
    title: "Position History",
    group: "jobs",
    category: "Jobs",
    approxRows: 45,
    columns: [
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "effectiveDate", label: "Effective" },
      { key: "position", label: "Position" },
      { key: "flsa", label: "FLSA" },
      { key: "grade", label: "Grade" },
      { key: "supervisor", label: "Supervisor" },
    ],
  },

  // Department Analysis (summary)
  {
    id: "department-analysis",
    slug: "department-analysis",
    title: "Department Analysis",
    group: "checks",
    category: "Analytics",
    approxRows: 10,
    columns: [
      { key: "department", label: "Department" },
      { key: "headcount", label: "Headcount" },
      { key: "avgHourlyRate", label: "Avg Rate" },
      { key: "overtimeHours", label: "OT Hours" },
      { key: "laborCost", label: "Labor Cost" },
    ],
  },

  // Employee status / docs / benefits etc. (kept to satisfy previous pages)
  {
    id: "status-history",
    slug: "status-history",
    title: "Status History",
    group: "employee",
    approxRows: 20,
    columns: [
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "hireDate", label: "Hire" },
      { key: "rehireDate", label: "Rehire" },
      { key: "leaveDate", label: "Leave" },
      { key: "returnDate", label: "Return" },
      { key: "termDate", label: "Term" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "benefit-history",
    slug: "benefit-history",
    title: "Benefit History",
    group: "employee",
    approxRows: 40,
    columns: [
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "plan", label: "Plan" },
      { key: "coverage", label: "Coverage" },
      { key: "tier", label: "Tier" },
      { key: "electionDate", label: "Election" },
      { key: "eeCost", label: "EE Cost" },
      { key: "erCost", label: "ER Cost" },
    ],
  },
  {
    id: "recruitment-history",
    slug: "recruitment-history",
    title: "Recruitment History",
    group: "employee",
    approxRows: 12,
    columns: [
      { key: "requisition", label: "Requisition" },
      { key: "candidate", label: "Candidate" },
      { key: "stage", label: "Stage" },
      { key: "stageDate", label: "Stage Date" },
      { key: "resume", label: "Resume" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "performance-history",
    slug: "performance-history",
    title: "Performance History",
    group: "employee",
    approxRows: 12,
    columns: [
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "reviewDate", label: "Review Date" },
      { key: "rating", label: "Rating" },
      { key: "notes", label: "Notes" },
      { key: "documentName", label: "Document" },
    ],
  },
  {
    id: "paper-records-history",
    slug: "paper-records-history",
    title: "Paper Records History",
    group: "employee",
    approxRows: 12,
    columns: [
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "docName", label: "Document" },
      { key: "docType", label: "Type" },
      { key: "docDate", label: "Date" },
    ],
  },
  {
    id: "w2-images",
    slug: "w2-images",
    title: "W-2 Images",
    group: "checks",
    approxRows: 5,
    docBased: true,
    columns: [
      { key: "employeeId", label: "Emp ID" },
      { key: "employeeName", label: "Employee" },
      { key: "taxYear", label: "Tax Year" },
      { key: "documentName", label: "Document" },
    ],
  },
];

// --- Helpers -------------------------------------------------------------
export function getAllReports(): ReportType[] {
  return REPORTS;
}

export function getReportsByGroup(group: GroupKey): ReportType[] {
  return REPORTS.filter((r) => r.group === group);
}

export function getReportById(id: string): ReportType | undefined {
  return REPORTS.find((r) => r.id === id || r.slug === id);
}
