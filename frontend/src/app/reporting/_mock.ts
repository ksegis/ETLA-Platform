// frontend/src/app/reporting/_mock.ts
import { getReportById } from "./_data";

const EMPLOYEES = [
  { id: "E001", name: "Aeryn Sun", dept: "SALES", cost: 4000, loc: "HQ" },
  { id: "E002", name: "John Crichton", dept: "SRV/HUB", cost: 4100, loc: "DC-East" },
  { id: "E003", name: "D. Peacekeeper", dept: "TEACH", cost: 4200, loc: "HQ" },
  { id: "E004", name: "Claudia Black", dept: "OPS", cost: 4300, loc: "Remote" },
  { id: "E005", name: "Chiana Nebari", dept: "ENG", cost: 4400, loc: "HQ" },
  { id: "E006", name: "Ka D'Argo", dept: "SALES", cost: 4000, loc: "HQ" },
  { id: "E007", name: "Pilot Levi", dept: "OPS", cost: 4300, loc: "Remote" },
];

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
function weekLabel(d: Date) {
  // Simple ISO-ish week label
  const first = new Date(d.getFullYear(), 0, 1);
  const diff = Math.floor((d.getTime() - first.getTime()) / 86400000);
  const week = Math.floor(diff / 7) + 1;
  const w = String(week).padStart(2, "0");
  return `${d.getFullYear()}-W${w}`;
}

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

/** ============ Per-report generators ============ */

function genChecks(count = 180) {
  const rnd = seeded(42);
  const base = new Date("2025-01-03T00:00:00Z");
  return range(count).map((i) => {
    const emp = EMPLOYEES[i % EMPLOYEES.length];
    const payNumber = (i % 26) + 16; // matches screenshots
    const payDate = new Date(base.getTime() + i * 14 * 86400000);
    const gross = Math.round((1450 + rnd() * 500) * 100) / 100;
    const taxes = Math.round((gross * (0.18 + rnd() * 0.05)) * 100) / 100;
    const deductions = Math.round((110 + rnd() * 120) * 100) / 100;
    const net = Math.round((gross - taxes - deductions) * 100) / 100;

    return {
      employeeid: emp.id,
      employeename: emp.name,
      department: emp.dept,
      costcenter: emp.cost,
      location: emp.loc,
      paygroup: "Biweekly",
      paydate: payDate.toISOString().slice(0, 10),
      payweek: weekLabel(payDate),
      paynumber: payNumber,
      checknumber: 100100 + i,
      gross,
      taxes,
      deductions,
      netpay: net,
      memo: i % 9 === 0 ? "New position" : "",
    };
  });
}

function genBenefitGroupAnalysis() {
  return [
    { benefit_group: "Medical PPO", enrolled: 62, employer_cost: 38250.0, employee_cost: 12450.0 },
    { benefit_group: "Medical HDHP", enrolled: 41, employer_cost: 18900.0, employee_cost: 7300.0 },
    { benefit_group: "Dental", enrolled: 95, employer_cost: 6250.0, employee_cost: 2100.0 },
    { benefit_group: "Vision", enrolled: 88, employer_cost: 2100.0, employee_cost: 950.0 },
    { benefit_group: "FSA", enrolled: 30, employer_cost: 0.0, employee_cost: 11500.0 },
  ];
}

function genPayPeriodAnalysis() {
  const periods = range(12).map((m) => new Date(2025, m, 15));
  return periods.map((d, i) => ({
    period: d.toISOString().slice(0, 10),
    regular_hours: 80,
    ot_hours: (i % 4) * 2,
    bonus: (i % 3) * 300,
    gross: 1480 + (i % 4) * 80 + (i % 3) * 300,
    taxes: 266.4 + (i % 5) * 10,
    deductions: 155 + (i % 2) * 10,
    netpay: 1058.6 + (i % 5) * 15,
  }));
}

function genTaxInformation() {
  return EMPLOYEES.map((e, i) => ({
    employeeid: e.id,
    employeename: e.name,
    federal_status: "Single",
    federal_allowances: i % 3,
    state: "DC",
    state_status: "Single",
    state_allowances: (i + 1) % 3,
    locality: e.loc,
    addl_federal: 0,
    addl_state: 0,
  }));
}

function genW2Documents() {
  // Represent typical doc metadata; URL intentionally blank for preview
  return EMPLOYEES.map((e) => ({
    document_id: `${e.id}-2024`,
    employeeid: e.id,
    employeename: e.name,
    year: 2024,
    filename: `${e.name.replace(/\s+/g, "_")}_W2_2024.pdf`,
    size_kb: 423,
    url: "",
  }));
}

function genDepartmentAnalysis(rows = 180) {
  const rnd = seeded(7);
  const start = new Date("2025-07-01T00:00:00Z");
  return range(rows).map((i) => {
    const m = Math.floor(i / 15);
    const periodStart = new Date(start.getTime() + m * 31 * 86400000);
    const dept = ["SALES", "SRV/HUB", "TEACH", "WORSHIP"][i % 4];
    const costcenter = [4000, 4100, 4200, 4300][i % 4];
    const fte = 8 + (i % 6) + (i % 2 ? 0.5 : 0);
    const regularpay = Math.round((16000 + rnd() * 18000) * 100) / 100;
    const otpay = Math.round((300 + rnd() * 700) * 100) / 100;
    const bonus = Math.round((rnd() * 2500) * 100) / 100;

    return {
      periodstart: periodStart.toISOString().slice(0, 10),
      periodlabel: periodStart.toLocaleString("en-US", { month: "short", year: "numeric" }),
      department: dept,
      costcenter,
      location: i % 3 ? "HQ" : "Remote",
      paygroup: "Biweekly",
      headcount: Math.floor(7 + rnd() * 9),
      fte,
      regularpay,
      otpay,
      bonus,
    };
  });
}

function genJobHistory(rows = 120) {
  const titles = ["Analyst I", "Analyst II", "Engineer", "Sr Engineer", "Mgr", "Sr Mgr"];
  return range(rows).map((i) => {
    const e = EMPLOYEES[i % EMPLOYEES.length];
    return {
      employeeid: e.id,
      employeename: e.name,
      effective_date: `2025-${String((i % 12) + 1).padStart(2, "0")}-01`,
      action: i % 3 === 0 ? "Promotion" : i % 3 === 1 ? "Transfer" : "Pay Change",
      job_code: `J${100 + (i % 50)}`,
      job_title: titles[i % titles.length],
      department: e.dept,
      location: e.loc,
      manager: EMPLOYEES[(i + 2) % EMPLOYEES.length].name,
      pay_group: "Biweekly",
    };
  });
}

function genPositionHistory(rows = 120) {
  return range(rows).map((i) => {
    const e = EMPLOYEES[i % EMPLOYEES.length];
    return {
      position_id: `P${2000 + i}`,
      employeeid: e.id,
      employeename: e.name,
      effective_date: `2025-${String((i % 12) + 1).padStart(2, "0")}-15`,
      status: i % 5 === 0 ? "Vacant" : "Filled",
      department: e.dept,
      costcenter: e.cost,
      fte: 1,
      manager: EMPLOYEES[(i + 1) % EMPLOYEES.length].name,
    };
  });
}

function genEmployeeDirectory() {
  return EMPLOYEES.map((e, i) => ({
    employeeid: e.id,
    employeename: e.name,
    work_email: `${e.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    department: e.dept,
    location: e.loc,
    manager: EMPLOYEES[(i + 1) % EMPLOYEES.length].name,
    hire_date: `2022-${String((i % 12) + 1).padStart(2, "0")}-01`,
    status: "Active",
  }));
}

function genHeadcountSummary() {
  const byDept = ["SALES", "SRV/HUB", "TEACH", "OPS"].map((d, i) => ({
    department: d,
    headcount: 7 + i * 2,
    fte: 6.5 + i * 1.8,
    hires: 1 + (i % 2),
    terms: i % 3 ? 0 : 1,
  }));
  return byDept;
}

function genSalaryGradeDistribution() {
  const grades = ["G5", "G6", "G7", "G8", "G9"];
  return grades.map((g, i) => ({
    grade: g,
    population: 20 + i * 7,
    min: 55000 + i * 7000,
    mid: 65000 + i * 7000,
    max: 75000 + i * 7000,
    avg_salary: 64000 + i * 6000,
    avg_compa_ratio: Number(((64000 + i * 6000) / (65000 + i * 7000)).toFixed(2)),
  }));
}

function genCompaRatio() {
  return ["SALES", "SRV/HUB", "TEACH", "OPS"].map((d, i) => ({
    department: d,
    avg_salary: 64000 + i * 6000,
    avg_midpoint: 70000 + i * 5000,
    avg_compa_ratio: Number(((64000 + i * 6000) / (70000 + i * 5000)).toFixed(2)),
  }));
}

function genMeritForecast(rows = 80) {
  return range(rows).map((i) => {
    const e = EMPLOYEES[i % EMPLOYEES.length];
    const current = 65000 + (i % 8) * 2500;
    const merit = +(current * 0.03).toFixed(2);
    const market = +((i % 3) * 250).toFixed(2);
    const lump = +((i % 4) * 100).toFixed(2);
    const newSalary = +(current + merit + market + lump).toFixed(2);
    return {
      employeeid: e.id,
      employeename: e.name,
      department: e.dept,
      current_salary: current,
      merit_increase: merit,
      market_adjustment: market,
      lump_sum: lump,
      new_salary: newSalary,
      new_compa_ratio: Number((newSalary / 70000).toFixed(2)),
    };
  });
}

function genTimecardDetail(rows = 300) {
  const projects = ["CC100", "CC200", "CC300"];
  return range(rows).map((i) => {
    const e = EMPLOYEES[i % EMPLOYEES.length];
    const d = `2025-08-${String((i % 28) + 1).padStart(2, "0")}`;
    return {
      employeeid: e.id,
      employeename: e.name,
      date: d,
      project: projects[i % projects.length],
      in: "09:00",
      out: "17:30",
      hours: 8 + (i % 2 ? 0.5 : 0),
      approved_by: EMPLOYEES[(i + 1) % EMPLOYEES.length].name,
    };
  });
}

function genOvertimeAnalysis() {
  return EMPLOYEES.map((e, i) => ({
    employeeid: e.id,
    employeename: e.name,
    week: `2025-W${String(30 + i).padStart(2, "0")}`,
    ot_hours: (i % 4) * 2,
    ot_cost: 75 * ((i % 4) * 2),
  }));
}

function genAbsenceSummary() {
  return EMPLOYEES.map((e, i) => ({
    employeeid: e.id,
    employeename: e.name,
    plan: i % 3 === 0 ? "PTO" : "Vacation",
    ytd_taken: (i % 6) * 1.5,
    balance: 40 - (i % 6) * 1.5,
  }));
}

/** Main dispatcher */
export function getMockRows(id: string): Record<string, any>[] {
  switch (id) {
    /* Checks */
    case "check-detail-history":
      return genChecks();
    case "benefit-group-analysis":
      return genBenefitGroupAnalysis();
    case "pay-period-analysis":
      return genPayPeriodAnalysis();
    case "tax-information":
      return genTaxInformation();
    case "w2-documents":
      return genW2Documents();

    /* Jobs */
    case "department-analysis":
      return genDepartmentAnalysis();
    case "job-history":
      return genJobHistory();
    case "position-history":
      return genPositionHistory();

    /* Employee */
    case "employee-directory":
      return genEmployeeDirectory();
    case "headcount-summary":
      return genHeadcountSummary();

    /* Salary / Comp */
    case "salary-grade-distribution":
      return genSalaryGradeDistribution();
    case "compa-ratio":
      return genCompaRatio();
    case "merit-forecast":
      return genMeritForecast();

    /* Timecards */
    case "timecard-detail":
      return genTimecardDetail();
    case "overtime-analysis":
      return genOvertimeAnalysis();
    case "absence-summary":
      return genAbsenceSummary();
  }

  // Fallback: if id is unknown, return a simple informative row
  const r = getReportById(id);
  if (r) return [{ info: `No specific mock implemented for ${r.title}`, id }];
  return [];
}
