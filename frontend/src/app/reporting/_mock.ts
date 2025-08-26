// Pure client/server-safe mock data utilities

type ReportLike = { id?: string; title?: string; group?: string };

// Heuristic mapping from report id/title/group to a normalized "kind".
export function inferReportKind(report: ReportLike | string): string {
  const id = typeof report === "string" ? report : (report.id || "");
  const title =
    typeof report === "string" ? report : (report.title || "");
  const group =
    typeof report === "string" ? "" : (report.group || "");

  const hay = `${id} ${title} ${group}`.toLowerCase();

  if (/(^|[^a-z])w[\-\s]?2([^a-z]|$)/.test(hay)) return "w2";
  if (hay.includes("timecard") || hay.includes("time sheet") || hay.includes("timesheet"))
    return "timecard";
  if (hay.includes("department") || hay.includes("dept analysis"))
    return "dept";
  if (hay.includes("job history") || hay.includes("job change"))
    return "job-history";
  if (hay.includes("position history") || hay.includes("position"))
    return "position-history";
  if (hay.includes("check") || hay.includes("pay") || hay.includes("stub"))
    return "pay";

  // fallback by group names seen in your app
  if (hay.includes("checks")) return "pay";
  if (hay.includes("salary")) return "pay";
  if (hay.includes("employee")) return "job-history";
  if (hay.includes("jobs")) return "job-history";
  if (hay.includes("timecards")) return "timecard";

  return "pay";
}

// ── helpers ──────────────────────────────────────────────────────────────────
const names = [
  ["E001", "Alex Johnson"],
  ["E002", "Sam Carter"],
  ["E003", "Taylor Nguyen"],
  ["E004", "Jordan Lee"],
  ["E005", "Priya Patel"],
  ["E006", "Chris Evans"],
  ["E007", "Morgan Kim"],
  ["E008", "Jamie Fox"],
  ["E009", "Riley Brooks"],
  ["E010", "Casey Young"],
] as const;

function rndInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rndInt(0, arr.length - 1)];
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function maskSSN(ssn: string) {
  return `***-**-${ssn.slice(-4)}`;
}
function dateAdd(baseISO: string, days: number) {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function toPeriod(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── row generators ───────────────────────────────────────────────────────────
function genPayRows(): any[] {
  const rows: any[] = [];
  for (let i = 0; i < 60; i++) {
    const [empId, employee] = names[i % names.length];
    const gross = round2(rndInt(1200, 3600) + Math.random());
    const fed = round2(gross * 0.14);
    const ss = round2(gross * 0.062);
    const med = round2(gross * 0.0145);
    const state = round2(gross * 0.045);
    const taxTotal = round2(fed + ss + med + state);
    const dental = 18;
    const medical = 75;
    const k401 = round2(gross * 0.04);
    const deductions = round2(dental + medical + k401);
    const netPay = round2(gross - taxTotal - deductions);
    const checkDate = dateAdd("2024-01-05", i * 14);

    rows.push({
      checkNumber: 100100 + i,
      checkDate,
      employeeId: empId,
      employee,
      grossPay: gross,
      taxes: taxTotal,
      deductions,
      netPay,
      dept: ["Sales", "Ops", "HR", "Eng"][i % 4],
      periodStart: dateAdd(checkDate, -13),
      periodEnd: checkDate,
      ytdGross: round2(gross + i * 100),
      ytdNet: round2(netPay + i * 80),
    });
  }
  return rows;
}

function genW2Rows(): any[] {
  const years = [2022, 2023, 2024];
  const rows: any[] = [];
  for (let i = 0; i < names.length * years.length; i++) {
    const [empId, employee] = names[i % names.length];
    const year = years[Math.floor(i / names.length)];
    const wages = round2(rndInt(52000, 128000) + Math.random());
    const federalTax = round2(wages * 0.18);
    const state = pick(["CA", "NY", "TX", "FL", "WA"]);
    const stateWages = round2(wages * 0.98);
    const ssn = (100000000 + rndInt(0, 89999999)).toString();

    rows.push({
      year,
      employeeId: empId,
      employee,
      ssnMasked: maskSSN(ssn),
      wages,
      federalTax,
      state,
      stateWages,
      employer: "Acme Holdings LLC",
      ein: "12-3456789",
    });
  }
  return rows;
}

function genTimecardRows(): any[] {
  const rows: any[] = [];
  for (let i = 0; i < 50; i++) {
    const [empId, employee] = names[i % names.length];
    const start = dateAdd("2024-01-01", i * 14);
    const end = dateAdd(start, 13);
    const reg = round2(80 + rndInt(-4, 2));
    const ot = round2(rndInt(0, 8));
    rows.push({
      periodStart: start,
      periodEnd: end,
      employeeId: empId,
      employee,
      regHours: reg,
      otHours: ot,
      totalHours: round2(reg + ot),
      dept: ["Sales", "Ops", "HR", "Eng"][i % 4],
      supervisor: pick(["Lopez", "Chen", "Davis", "Miller"]),
    });
  }
  return rows;
}

function genDeptRows(): any[] {
  const depts = ["Sales", "Operations", "HR", "Engineering", "Finance"];
  const rows: any[] = [];
  for (let m = 1; m <= 12; m++) {
    for (const d of depts) {
      const headcount = rndInt(3, 22);
      const gross = round2(rndInt(25000, 210000));
      const erTaxes = round2(gross * 0.078);
      const benefits = round2(gross * 0.12);
      rows.push({
        period: `2024-${String(m).padStart(2, "0")}`,
        department: d,
        headcount,
        grossWages: gross,
        employerTaxes: erTaxes,
        benefitsCost: benefits,
        totalLaborCost: round2(gross + erTaxes + benefits),
      });
    }
  }
  return rows;
}

function genJobHistoryRows(): any[] {
  const titles = ["Analyst", "Sr Analyst", "Manager", "Director"];
  const rows: any[] = [];
  for (let i = 0; i < 40; i++) {
    const [empId, employee] = names[i % names.length];
    const start = dateAdd("2021-01-01", rndInt(0, 900));
    const end = Math.random() < 0.5 ? "" : dateAdd(start, rndInt(90, 720));
    rows.push({
      employeeId: empId,
      employee,
      jobTitle: pick(titles),
      department: ["Sales", "Ops", "HR", "Eng"][i % 4],
      effectiveStart: start,
      effectiveEnd: end || null,
      status: end ? "Former" : "Active",
    });
  }
  return rows;
}

function genPositionHistoryRows(): any[] {
  const positions = ["POS-1001", "POS-1002", "POS-2050", "POS-3007"];
  const titles = ["Sales Rep I", "Ops Coordinator", "HRBP", "SWE II"];
  const rows: any[] = [];
  for (let i = 0; i < 36; i++) {
    const pid = positions[i % positions.length];
    const posTitle = titles[i % titles.length];
    const dept = ["Sales", "Operations", "HR", "Engineering"][i % 4];
    const [empId, empName] = names[i % names.length];
    const start = dateAdd("2022-02-01", rndInt(0, 600));
    const end = Math.random() < 0.35 ? dateAdd(start, rndInt(60, 420)) : null;
    rows.push({
      positionId: pid,
      positionTitle: posTitle,
      department: dept,
      incumbent: `${empName} (${empId})`,
      effectiveStart: start,
      effectiveEnd: end,
      status: end ? "Closed" : "Open",
    });
  }
  return rows;
}

// Public API: sync so both client & server calls are easy.
// (If some code does `await getMockRows(id)`, that still works at runtime.)
export function getMockRows(reportId: string): any[] {
  const kind = inferReportKind(reportId);
  switch (kind) {
    case "w2":
      return genW2Rows();
    case "timecard":
      return genTimecardRows();
    case "dept":
      return genDeptRows();
    case "job-history":
      return genJobHistoryRows();
    case "position-history":
      return genPositionHistoryRows();
    case "pay":
    default:
      return genPayRows();
  }
}
