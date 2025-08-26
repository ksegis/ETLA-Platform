// frontend/src/app/reporting/_data.ts
export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards" | "all";

export const GROUP_LABELS: Record<Exclude<GroupKey, "all">, string> = {
  employee: "Employee",
  checks: "Checks",
  jobs: "Jobs",
  salary: "Salary",
  timecards: "Timecards",
};

export type ReportKind = "paystub" | "w2" | "timecard" | "table" | "doc";

export type ReportType = {
  id: string;
  slug: string;
  title: string;
  group: GroupKey;
  description?: string;
  category?: string;
  fields?: string;
  approxRows?: number;
  kind: ReportKind;
  // present for server routes that referenced these in earlier builds
  procedure?: string;
  docBased?: boolean;
};

// --- Report catalog (put all your reports back, mark which ones are “facsimile”) ---
export const REPORTS: ReportType[] = [
  // CHECKS / PAY
  {
    id: "check-detail-history",
    slug: "check-detail-history",
    title: "Check Detail History",
    group: "checks",
    description:
      "Gross-to-net detail including earnings, taxes, deductions, memos; with pay date, pay period, pay number, check/advice number.",
    category: "Payroll",
    fields: "Emp, Pay Date, Period, Check#, Earnings, Taxes, Deductions, Net",
    approxRows: 250,
    kind: "paystub",
    procedure: "sp_check_detail_history",
  },
  // TIME
  {
    id: "timecard-detail-history",
    slug: "timecard-detail-history",
    title: "Time Card Detail History",
    group: "timecards",
    description:
      "All punches with in/out times, totals by earning code, PTO and transfers.",
    category: "Time",
    fields: "Emp, Period, Punches, Transfers, PTO",
    approxRows: 180,
    kind: "timecard",
    procedure: "sp_timecard_detail_history",
  },
  // COMP
  {
    id: "salary-history",
    slug: "salary-history",
    title: "Salary History",
    group: "salary",
    description:
      "Compensation changes with amount, percent, reasons and effective dates.",
    category: "Compensation",
    fields: "Emp, Eff Dt, Amount, % Change, Reason",
    approxRows: 90,
    kind: "table",
  },
  // JOB
  {
    id: "job-history",
    slug: "job-history",
    title: "Job History",
    group: "jobs",
    description:
      "Job title changes with effective dates, reasons and notes.",
    category: "Job",
    fields: "Emp, Eff Dt, Title, Reason, Notes",
    approxRows: 110,
    kind: "table",
  },
  // EMPLOYEE
  {
    id: "status-history",
    slug: "status-history",
    title: "Status History",
    group: "employee",
    description:
      "Hire/rehire, leave, termination dates and related status changes.",
    category: "Employee",
    fields: "Emp, Status, Eff Dt, Reason",
    approxRows: 120,
    kind: "table",
  },
  // DOCUMENT-BASED
  {
    id: "w2-statements",
    slug: "w2-statements",
    title: "W-2 Statements",
    group: "checks",
    description:
      "Employer-provided W-2 images for year-end. Select a year and employee to view.",
    category: "Tax",
    fields: "Emp, Year, Wages, Withholding",
    approxRows: 40,
    kind: "w2",
    docBased: true,
  },
  {
    id: "benefit-history",
    slug: "benefit-history",
    title: "Benefit History",
    group: "employee",
    description:
      "Plan enrollments and key plan details with election dates.",
    category: "Benefits",
    fields: "Emp, Plan, Coverage, Effective, End",
    approxRows: 80,
    kind: "table",
  },
  {
    id: "recruitment-history",
    slug: "recruitment-history",
    title: "Recruitment History",
    group: "employee",
    description:
      "Applications, stages, resumes/cover letters and notes.",
    category: "Talent",
    fields: "Candidate, Req, Stage, Dates",
    approxRows: 60,
    kind: "table",
    docBased: true,
  },
  {
    id: "performance-history",
    slug: "performance-history",
    title: "Performance History",
    group: "employee",
    description:
      "Supervisor notes and review documents (PDFs).",
    category: "Performance",
    fields: "Emp, Review Dt, Rating, Notes",
    approxRows: 55,
    kind: "table",
    docBased: true,
  },
  {
    id: "paper-records",
    slug: "paper-records",
    title: "Paper Records",
    group: "employee",
    description:
      "Scanned historical paper records as searchable PDFs.",
    category: "Documents",
    fields: "Emp, Doc Type, Date",
    approxRows: 500,
    kind: "doc",
    docBased: true,
  },
];

// --- Helpers ---
export const getAllReports = () => REPORTS;
export const getReportsByGroup = (group: GroupKey) =>
  group === "all" ? REPORTS : REPORTS.filter((r) => r.group === group);

// ---------- MOCK DATA (enough variety to test filters & forms) ----------
type PayStubRow = {
  employeeId: string;
  employeeName: string;
  department?: string;
  payGroup?: string;
  payNumber?: string;
  checkNumber?: string;
  payDate: string; // ISO
  periodStart: string;
  periodEnd: string;
  earnings: Array<{ code: string; desc: string; hours?: number; rate?: number; amount: number }>;
  taxes: Array<{ code: string; desc: string; amount: number; ytd?: number }>;
  deductions: Array<{ code: string; desc: string; amount: number; ytd?: number }>;
  memos?: string[];
  ytd: { gross: number; taxes: number; deductions: number; net: number };
};

type W2Row = {
  employeeId: string;
  employeeName: string;
  ssnMasked: string;
  year: number;
  wages: number;
  fedWithheld: number;
  socialWages: number;
  socialTax: number;
  medicareWages: number;
  medicareTax: number;
  state?: string;
  stateWages?: number;
  stateTax?: number;
  locality?: string;
  localityWages?: number;
  localityTax?: number;
};

type TimecardRow = {
  employeeId: string;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  punches: Array<{
    date: string;
    in: string;
    out: string;
    hours: number;
    dept?: string;
    code?: string; // REG/OT/PTO etc.
  }>;
  totals: { reg: number; ot: number; pto: number; other?: number };
};

const names = [
  ["E0001", "Alex Johnson"],
  ["E0002", "Maria Garcia"],
  ["E0003", "Sam Thompson"],
  ["E0004", "Priya Patel"],
  ["E0005", "Daniel Kim"],
] as const;

function dollars(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}
function rnd<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function addDays(baseISO: string, days: number) {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const MOCK_PAYSTUBS: PayStubRow[] = (() => {
  const base = "2024-12-06";
  const rows: PayStubRow[] = [];
  names.forEach(([id, nm], idx) => {
    for (let i = 0; i < 6; i++) {
      const end = addDays(base, -14 * i - idx);
      const start = addDays(end, -13);
      const gross = dollars(1500, 2600);
      const taxes = dollars(250, 520);
      const ded = dollars(120, 300);
      const net = Math.round((gross - taxes - ded) * 100) / 100;
      rows.push({
        employeeId: id,
        employeeName: nm,
        department: rnd(["Operations", "Sales", "R&D", "Finance", "HR"]),
        payGroup: "Biweekly",
        payNumber: String(1000 + i),
        checkNumber: String(500000 + i * 7 + idx),
        payDate: addDays(end, 5),
        periodStart: start,
        periodEnd: end,
        earnings: [
          { code: "REG", desc: "Regular", hours: 80, rate: dollars(20, 42), amount: gross * 0.85 },
          { code: "OT", desc: "Overtime", hours: Math.floor(Math.random() * 6), rate: dollars(30, 60), amount: gross * 0.15 },
        ],
        taxes: [
          { code: "FIT", desc: "Federal Income Tax", amount: taxes * 0.55 },
          { code: "SST", desc: "Social Security", amount: taxes * 0.25 },
          { code: "MED", desc: "Medicare", amount: taxes * 0.2 },
        ],
        deductions: [
          { code: "MEDP", desc: "Medical Pre-tax", amount: ded * 0.5 },
          { code: "401K", desc: "401(k) Pre-tax", amount: ded * 0.5 },
        ],
        memos: Math.random() > 0.7 ? ["Spot bonus", "Shift diff"] : [],
        ytd: {
          gross: Math.round((gross * 18) * 100) / 100,
          taxes: Math.round((taxes * 18) * 100) / 100,
          deductions: Math.round((ded * 18) * 100) / 100,
          net: Math.round((net * 18) * 100) / 100,
        },
      });
    }
  });
  return rows;
})();

const MOCK_W2S: W2Row[] = (() => {
  const rows: W2Row[] = [];
  [2023, 2024].forEach((yr) => {
    names.forEach(([id, nm]) => {
      const wages = dollars(48000, 98000);
      const fed = Math.round(wages * 0.14 * 100) / 100;
      rows.push({
        employeeId: id,
        employeeName: nm,
        ssnMasked: "XXX-XX-" + String(1000 + Math.floor(Math.random() * 8999)),
        year: yr,
        wages,
        fedWithheld: fed,
        socialWages: wages,
        socialTax: Math.round(wages * 0.062 * 100) / 100,
        medicareWages: wages,
        medicareTax: Math.round(wages * 0.0145 * 100) / 100,
        state: "CA",
        stateWages: wages,
        stateTax: Math.round(wages * 0.05 * 100) / 100,
      });
    });
  });
  return rows;
})();

const MOCK_TIMECARDS: TimecardRow[] = (() => {
  const rows: TimecardRow[] = [];
  names.forEach(([id, nm], i) => {
    const end = "2024-12-07";
    const start = addDays(end, -13);
    const punches: TimecardRow["punches"] = [];
    for (let d = 0; d < 10; d++) {
      const date = addDays(start, d);
      const hours = rnd([8, 8, 8, 9, 7.5, 6]);
      punches.push({
        date,
        in: "08:30",
        out: (hours === 9 ? "18:00" : "17:00"),
        hours: typeof hours === "number" ? hours : 8,
        dept: rnd(["Ops", "Sales", "R&D", "Finance"]),
        code: rnd(["REG", "REG", "REG", "OT", "PTO"]),
      });
    }
    const reg = punches.filter(p => p.code !== "OT" && p.code !== "PTO").reduce((a, b) => a + b.hours, 0);
    const ot = punches.filter(p => p.code === "OT").reduce((a, b) => a + b.hours, 0);
    const pto = punches.filter(p => p.code === "PTO").reduce((a, b) => a + b.hours, 0);
    rows.push({
      employeeId: id,
      employeeName: nm,
      periodStart: start,
      periodEnd: end,
      punches,
      totals: { reg, ot, pto },
    });
  });
  return rows;
})();

export function getMockRows(slug: string, filters?: Record<string, any>) {
  if (slug === "check-detail-history") {
    let rows = [...MOCK_PAYSTUBS];
    if (filters?.q) {
      rows = rows.filter(r => r.employeeName.toLowerCase().includes(String(filters.q).toLowerCase()));
    }
    if (filters?.from) rows = rows.filter(r => r.payDate >= filters.from);
    if (filters?.to) rows = rows.filter(r => r.payDate <= filters.to);
    return rows;
  }
  if (slug === "w2-statements") {
    let rows = [...MOCK_W2S];
    if (filters?.year) rows = rows.filter(r => r.year === Number(filters.year));
    if (filters?.q) rows = rows.filter(r => r.employeeName.toLowerCase().includes(String(filters.q).toLowerCase()));
    return rows;
  }
  if (slug === "timecard-detail-history") {
    let rows = [...MOCK_TIMECARDS];
    if (filters?.q) rows = rows.filter(r => r.employeeName.toLowerCase().includes(String(filters.q).toLowerCase()));
    if (filters?.from) rows = rows.filter(r => r.periodStart >= filters.from);
    if (filters?.to) rows = rows.filter(r => r.periodEnd <= filters.to);
    return rows;
  }
  // simple placeholder table mocks for non-facsimile reports
  return Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1),
    employeeId: rnd(names as unknown as any)[0],
    employeeName: rnd(names as unknown as any)[1],
    effectiveDate: addDays("2024-09-01", -i * 30),
    value: dollars(1000, 5000),
    notes: Math.random() > 0.7 ? "Manager adjustment" : "",
  }));
}
