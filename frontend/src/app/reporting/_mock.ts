/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Mock data generators used by /api/reports/[id] and preview modals.
 * NOTE: We never use an identifier that starts with a number (e.g. "401k").
 *       When we need a "401k" output column, we put it as a quoted key:
 *       { ["401k"]: four01k }
 */

type Dict<T = any> = Record<string, T>;

const NAMES = [
  ["E001", "Ava Thompson"],
  ["E002", "Liam Johnson"],
  ["E003", "Mia Chen"],
  ["E004", "Noah Patel"],
  ["E005", "Olivia Garcia"],
  ["E006", "Ethan Rivera"],
  ["E007", "Sophia Lee"],
  ["E008", "Jackson Kim"],
  ["E009", "Amelia Davis"],
  ["E010", "Lucas Martin"],
];

const DEPTS = ["Finance", "Operations", "Engineering", "HR", "Sales", "Marketing", "Support"];
const LOCS = ["HQ", "Remote", "DC-East", "DC-West", "Austin", "NYC", "Raleigh"];
const GRADES = ["A1", "A2", "A3", "B1", "B2", "C1", "C2"];
const EARN_CODES = ["REG", "OT", "HOL", "SICK", "VAC"];

const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = <T>(arr: T[]): T => arr[rndInt(0, arr.length - 1)];
const dollars = (min = 1200, max = 3000) => round2(rndInt(min, max) + Math.random());
const round2 = (n: number) => Math.round(n * 100) / 100;
const addDays = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const toCSVSafe = (v: any) => (v ?? "").toString().replaceAll('"', '""');

/**
 * Basic text/date filter pass.
 */
function applyFilters(rows: Dict[], filters: Dict) {
  if (!filters) return rows;

  let out = rows;

  // simple q= search (case-insensitive across string props)
  if (filters.q && typeof filters.q === "string") {
    const q = filters.q.toLowerCase();
    out = out.filter((r) =>
      Object.values(r).some(
        (v) => typeof v === "string" && v.toLowerCase().includes(q)
      )
    );
  }

  // from/to date across known date-ish fields
  const from = filters.from as string | undefined;
  const to = filters.to as string | undefined;
  if (from || to) {
    const keys = ["payDate", "periodStart", "periodEnd", "effectiveDate", "date"];
    out = out.filter((r) => {
      const dKey = keys.find((k) => r[k]);
      if (!dKey) return true;
      const d = r[dKey] as string;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  return out;
}

/* ----------------------------- Generators ----------------------------- */

function genCheckDetail(limit = 180): Dict[] {
  const start = "2024-07-15";
  return Array.from({ length: limit }, (_, i) => {
    const [empId, employee] = choice(NAMES);
    const dept = choice(DEPTS);
    const payDate = addDays(start, i * 30 + rndInt(0, 2));

    const earnings = dollars(2100, 2600);
    const fed = round2(earnings * 0.11);
    const state = round2(earnings * 0.035);
    const fica = round2(earnings * 0.062);
    const medi = round2(earnings * 0.0145);
    const taxTotal = round2(fed + state + fica + medi);

    // Benefits & retirement deductions
    const dental = 18;
    const medical = 75;
    const four01k = round2(earnings * 0.04); // <-- variable OK
    const deductions = round2(dental + medical + four01k);

    const netPay = round2(earnings - taxTotal - deductions);

    return {
      checkNumber: 100100 + i,
      payDate,
      empId,
      employee,
      dept,
      earnings,
      taxes: taxTotal,
      deductions,
      netPay,
      // Detailed breakdown that facsimile views may use
      taxesFed: fed,
      taxesState: state,
      taxesFICA: fica,
      taxesMedicare: medi,
      dental,
      medical,
      ["401k"]: four01k, // <-- quoted key used for a column label
    };
  });
}

function genBenefitGroup(limit = 120): Dict[] {
  const groups = ["Medical", "Dental", "Vision", "401k", "FSA", "HSA", "STD", "LTD"];
  return Array.from({ length: limit }, (_, i) => ({
    benefit: choice(groups),
    costCenter: rndInt(4000, 4300),
    location: choice(LOCS),
    headcount: rndInt(5, 30),
    employerCost: dollars(1000, 5000),
    employeeCost: dollars(300, 2000),
  }));
}

function genPayPeriodSummary(limit = 500): Dict[] {
  const start = "2024-01-05";
  return Array.from({ length: limit }, (_, i) => ({
    periodStart: addDays(start, i * 14),
    periodEnd: addDays(start, i * 14 + 13),
    checks: rndInt(80, 120),
    gross: dollars(150000, 210000),
    taxes: dollars(35000, 55000),
    net: dollars(100000, 150000),
  }));
}

function genTaxInfo(limit = 1850): Dict[] {
  const states = ["DC", "VA", "MD", "CA", "NY", "TX", "WA"];
  return Array.from({ length: limit }, (_, i) => ({
    employeeId: NAMES[i % NAMES.length][0],
    employeeName: NAMES[i % NAMES.length][1],
    state: choice(states),
    jurisdiction: "State",
    status: choice(["S", "M", "H"]),
    allowances: rndInt(0, 3),
    additional: round2(rndInt(0, 50)),
    suiRate: round2(Math.random() * 0.08),
  }));
}

function genW2Docs(limit = 2100): Dict[] {
  const years = [2022, 2023, 2024];
  return Array.from({ length: limit }, (_, i) => {
    const [empId, employee] = choice(NAMES);
    return {
      id: `W2-${years[i % years.length]}-${empId}`,
      year: years[i % years.length],
      empId,
      employee,
      filename: `W2_${employee.replaceAll(" ", "_")}_${years[i % years.length]}.pdf`,
      sizeKB: rndInt(120, 320),
      url: "#",
    };
  });
}

function genDeptAnalysis(limit = 1200): Dict[] {
  const months = [
    "2024-07-01","2024-08-01","2024-09-01","2024-10-01","2024-11-01","2024-12-01",
    "2025-01-01","2025-02-01","2025-03-01","2025-04-01","2025-05-01","2025-06-01",
  ];
  return Array.from({ length: limit }, () => {
    const dept = choice(DEPTS);
    const location = choice(LOCS);
    const headcount = rndInt(6, 20);
    const fte = round2(headcount - Math.random());
    return {
      periodLabel: choice(months).slice(0, 7),
      department: dept,
      costCenter: rndInt(4000, 4300),
      location,
      payGroup: choice(["Biweekly", "Semi-monthly"]),
      headcount,
      fte,
      regularPay: dollars(15000, 34000),
      otPay: dollars(200, 1100),
      bonus: dollars(0, 2500),
    };
  });
}

function genJobHistory(limit = 3200): Dict[] {
  const titles = ["Analyst", "Sr Analyst", "Engineer I", "Engineer II", "Manager", "Director"];
  return Array.from({ length: limit }, (_, i) => {
    const [empId, employee] = choice(NAMES);
    return {
      effectiveDate: addDays("2024-03-01", rndInt(-120, 120)),
      empId,
      employee,
      jobCode: `J${rndInt(100, 999)}`,
      title: choice(titles),
      dept: choice(DEPTS),
      location: choice(LOCS),
      payGroup: choice(["Biweekly", "Semi-monthly"]),
      flsa: choice(["Non-Exempt", "Exempt"]),
      action: choice(["Hire", "Transfer", "Promotion", "Pay Change"]),
    };
  });
}

function genPositionHistory(limit = 2600): Dict[] {
  return Array.from({ length: limit }, () => ({
    positionId: `P${rndInt(1000, 9999)}`,
    effectiveDate: addDays("2024-01-01", rndInt(-120, 200)),
    manager: choice(NAMES)[1],
    dept: choice(DEPTS),
    costCenter: rndInt(4000, 4300),
    fte: round2(0.75 + Math.random() * 0.25),
    status: choice(["Active", "Frozen", "Backfill", "Closed"]),
  }));
}

function genEmployeeDirectory(limit = 1500): Dict[] {
  const domains = ["example.com", "corp.test", "etla.io"];
  return Array.from({ length: limit }, () => {
    const [empId, employee] = choice(NAMES);
    const [first, last] = employee.split(" ");
    return {
      empId,
      employee,
      dept: choice(DEPTS),
      location: choice(LOCS),
      manager: choice(NAMES)[1],
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${choice(domains)}`,
      phone: `(202) 555-${rndInt(1000, 9999)}`,
      hireDate: addDays("2022-01-01", rndInt(0, 700)),
    };
  });
}

function genHeadcountSummary(limit = 240): Dict[] {
  return Array.from({ length: limit }, () => ({
    department: choice(DEPTS),
    location: choice(LOCS),
    headcount: rndInt(4, 30),
    fte: round2(rndInt(4, 30) - Math.random()),
    hires: rndInt(0, 6),
    terms: rndInt(0, 4),
  }));
}

function genSalaryGradeDistribution(limit = 900): Dict[] {
  return Array.from({ length: limit }, () => ({
    grade: choice(GRADES),
    min: dollars(45000, 70000),
    mid: dollars(70000, 95000),
    max: dollars(95000, 130000),
    population: rndInt(3, 45),
    rangePenetration: round2(Math.random() * 1.4),
  }));
}

function genCompaRatioByDept(limit = 120): Dict[] {
  return Array.from({ length: limit }, () => ({
    department: choice(DEPTS),
    avgCompaRatio: round2(0.75 + Math.random() * 0.8),
    penetration: round2(Math.random() * 1.25),
    headcount: rndInt(3, 30),
  }));
}

function genMeritIncreaseForecast(limit = 450): Dict[] {
  return Array.from({ length: limit }, () => ({
    department: choice(DEPTS),
    population: rndInt(5, 60),
    proposedMeritPct: round2(2 + Math.random() * 3),
    proposedLumpSum: dollars(1000, 12000),
    proposedNewComp: dollars(50000, 125000),
  }));
}

function genTimecardDetail(limit = 8000): Dict[] {
  return Array.from({ length: limit }, () => {
    const [empId, employee] = choice(NAMES);
    const hours = round2(7 + Math.random() * 5);
    const rate = round2(20 + Math.random() * 35);
    return {
      date: addDays("2024-07-01", rndInt(0, 120)),
      empId,
      employee,
      earnCode: choice(EARN_CODES),
      hours,
      rate,
      amount: round2(hours * rate),
      dept: choice(DEPTS),
      location: choice(LOCS),
      job: `J${rndInt(100, 999)}`,
    };
  });
}

/* ------------------------------ Registry ------------------------------ */

const REGISTRY: Record<
  string,
  (limit?: number) => Dict[]
> = {
  // Checks
  "check-detail": genCheckDetail,
  "check detail": genCheckDetail,
  "check_detail_history": genCheckDetail,

  // Benefit groups
  "benefit-group": genBenefitGroup,
  "benefit group analysis": genBenefitGroup,

  // Pay period summary
  "pay-period": genPayPeriodSummary,
  "pay period analysis": genPayPeriodSummary,

  // Taxes / jurisdictions
  "tax-information": genTaxInfo,
  "tax information": genTaxInfo,

  // W2
  "w2-docs": genW2Docs,
  "w-2 documents": genW2Docs,

  // Jobs
  "department-analysis": genDeptAnalysis,
  "department analysis": genDeptAnalysis,
  "job-history": genJobHistory,
  "job history": genJobHistory,
  "position-history": genPositionHistory,
  "position history": genPositionHistory,

  // Employee
  "employee-directory": genEmployeeDirectory,
  "employee directory": genEmployeeDirectory,
  "headcount-summary": genHeadcountSummary,
  "headcount summary": genHeadcountSummary,

  // Salary
  "salary-grade-distribution": genSalaryGradeDistribution,
  "salary grade distribution": genSalaryGradeDistribution,
  "compa-ratio-by-department": genCompaRatioByDept,
  "compa-ratio by department": genCompaRatioByDept,
  "merit-increase-forecast": genMeritIncreaseForecast,
  "merit increase forecast": genMeritIncreaseForecast,

  // Timecards
  "timecard-detail": genTimecardDetail,
  "timecard detail": genTimecardDetail,
};

/* ------------------------------- Public ------------------------------- */

/**
 * Returns mock rows for a report id.
 * The id match is case-insensitive and tolerant (we normalize by trimming and lowercasing).
 */
export async function getMockRows(
  id: string,
  filters: Dict = {},
  limit = 200
): Promise<Dict[]> {
  const key = (id || "").trim().toLowerCase();
  const gen =
    REGISTRY[key] ||
    // fallback: try partial lookup (e.g., "checks/whatever" -> "check-detail")
    Object.entries(REGISTRY).find(([k]) => key.includes(k))?.[1] ||
    genCheckDetail;

  const rows = gen(limit);
  return applyFilters(rows, filters);
}

/**
 * Optional CSV helper (if your export route wants to use it).
 */
export function toCSV(rows: Dict[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const head = headers.map((h) => `"${toCSVSafe(h)}"`).join(",");
  const lines = rows.map((r) =>
    headers.map((h) => `"${toCSVSafe(r[h])}"`).join(",")
  );
  return [head, ...lines].join("\n");
}
