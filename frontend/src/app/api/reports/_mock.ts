export type MockPayload = {
  columns: string[];
  rows: any[];
  docs?: Array<{ id: string; name: string; url?: string; size?: number }>;
};

/** ---------- Helpers ---------- */
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function dater(str: string) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}
function mm(y: number, m1to12: number, d = 1) {
  const mm = String(m1to12).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

/** Apply common filters for demo mode */
export function applyDemoFilters(
  rows: any[],
  opts: {
    from?: string | null;
    to?: string | null;
    filters?: Record<string, any> | null;
    limit?: number;
    offset?: number;
  }
) {
  const { from, to, filters, limit = 50, offset = 0 } = opts || {};
  let out = rows.slice();

  // Date range – try these common columns
  const dateKeys = ["PayDate", "EffectiveDate", "PeriodStart", "date", "paydate"];
  function pickDate(r: any) {
    for (const k of dateKeys) if (r[k]) return r[k];
    return null;
  }

  if (from) {
    const ts = dater(from);
    out = out.filter((r) => {
      const v = pickDate(r);
      return v ? dater(String(v)) >= ts : true;
    });
  }
  if (to) {
    const ts = dater(to);
    out = out.filter((r) => {
      const v = pickDate(r);
      return v ? dater(String(v)) <= ts : true;
    });
  }

  const f = filters || {};

  // Generic text search by name/term
  const nameTerm = (f.name ?? f.employee_name ?? "").toString().toLowerCase().trim();
  if (nameTerm) {
    out = out.filter((r) => {
      const hay = Object.values(r).join(" ").toLowerCase();
      return hay.includes(nameTerm);
    });
  }

  // Common keys across new reports
  const like = (key: string) =>
    f[key] ? (r: any) => String(r[key] ?? "").toLowerCase().includes(String(f[key]).toLowerCase()) : null;

  const eqNum = (key: string) =>
    f[key] != null ? (r: any) => Number(r[key]) === Number(f[key]) : null;

  const betweenNum = (minKey: string, maxKey: string, field: string) =>
    (r: any) => {
      const v = Number(r[field] ?? 0);
      if (f[minKey] != null && v < Number(f[minKey])) return false;
      if (f[maxKey] != null && v > Number(f[maxKey])) return false;
      return true;
    };

  const predicates: Array<(r: any) => boolean> = [];

  // Department Analysis filters
  if (f.department) predicates.push(like("Department")!);
  if (f.location) predicates.push(like("Location")!);
  if (f.cost_center) predicates.push(like("CostCenter")!);
  if (f.pay_group) predicates.push(like("PayGroup")!);
  if (f.min_total_cost != null || f.max_total_cost != null)
    predicates.push(betweenNum("min_total_cost", "max_total_cost", "TotalLaborCost"));

  // Job History filters
  if (f.employee_id) predicates.push(like("EmployeeID")!);
  if (f.employee_name) predicates.push(like("EmployeeName")!);
  if (f.department) predicates.push(like("Department")!);
  if (f.supervisor) predicates.push(like("Supervisor")!);
  if (f.job_code) predicates.push(like("JobCode")!);
  if (f.action) predicates.push(like("Action")!);
  if (f.reason_code) predicates.push(like("ReasonCode")!);
  if (f.location) predicates.push(like("Location")!);

  // Position History filters
  if (f.position_id) predicates.push(like("PositionID")!);
  if (f.position_title) predicates.push(like("PositionTitle")!);
  if (f.status) predicates.push(like("Status")!);
  if (f.fte_min != null || f.fte_max != null) predicates.push(betweenNum("fte_min", "fte_max", "FTE"));
  if (f.standard_hours) predicates.push(eqNum("StandardHours")!);

  if (predicates.length) {
    out = out.filter((r) => predicates.every((p) => (p ? p(r) : true)));
  }

  const total = out.length;
  const paged = out.slice(offset, offset + limit);

  const columns = paged[0] ? Object.keys(paged[0]) : Object.keys(rows[0] ?? {});
  return { columns, rows: paged, total };
}

/** ---------- Demo datasets ---------- */

// Checks detail (already used earlier)
function makeCheckDetailHistory(): MockPayload {
  const columns = [
    "EmployeeID",
    "EmployeeName",
    "Department",
    "PayGroup",
    "PayDate",
    "PayWeek",
    "PayNumber",
    "CheckNumber",
    "Gross",
    "Taxes",
    "Deductions",
    "NetPay",
    "Memo",
    "EarningType",
    "OTHours",
    "Garnishment",
  ];

  const employees = [
    { id: "E001", name: "Aeryn Sun", dept: "SALES" },
    { id: "E002", name: "John Crichton", dept: "SRV/HUB" },
    { id: "E003", name: "D. Peacekeeper", dept: "SALES" },
    { id: "E004", name: "Pa'u Zotoh Zhaan", dept: "TEACH" },
    { id: "E005", name: "Ka D'Argo", dept: "TEACH" },
    { id: "E006", name: "Chiana Nerri", dept: "WORSHIP" },
    { id: "E007", name: "Pilot (Leviathan)", dept: "SRV/HUB" },
    { id: "E008", name: "Bialar Crais", dept: "SALES" },
    { id: "E009", name: "Scorpius", dept: "SALES" },
    { id: "E010", name: "Sikozu Svala Shanti", dept: "SRV/HUB" },
  ];

  const payPeriods = [
    { payDate: "2025-08-15", week: "2025-W33", number: 16 },
    { payDate: "2025-08-29", week: "2025-W35", number: 17 },
    { payDate: "2025-09-12", week: "2025-W37", number: 18 },
    { payDate: "2025-09-26", week: "2025-W39", number: 19 },
    { payDate: "2025-10-10", week: "2025-W41", number: 20 },
    { payDate: "2025-10-24", week: "2025-W43", number: 21 },
    { payDate: "2025-11-07", week: "2025-W45", number: 22 },
    { payDate: "2025-11-21", week: "2025-W47", number: 23 },
  ];

  const rows: any[] = [];
  const baseCheck = 100100;

  employees.forEach((emp, ei) => {
    payPeriods.forEach((pp, pi) => {
      const hourly = (ei % 3) === 0;
      const otHours = (ei % 4 === 0 && pi % 2 === 1) ? 3 : 0;
      const baseGross = hourly ? 18.5 * 80 : 1500 + ei * 35 + pi * 20;
      const bonus = pi === 2 && ei % 2 === 0 ? 150 : 0;
      const gross = baseGross + otHours * 27 + bonus;

      const garn = ei % 5 === 0 ? 45 : 0;
      const taxes = round2(gross * (0.18 + (ei % 3) * 0.01));
      const otherDeductions = 110 + (pi % 3) * 10;
      const deductions = round2(otherDeductions + garn);
      const net = round2(gross - taxes - deductions);

      const memo = bonus ? "Bonus" : otHours ? "OT + shift diff" : pi === 5 ? "Retro adjustment" : "Regular";

      rows.push({
        EmployeeID: emp.id,
        EmployeeName: emp.name,
        Department: emp.dept,
        PayGroup: "Biweekly",
        PayDate: pp.payDate,
        PayWeek: pp.week,
        PayNumber: pp.number,
        CheckNumber: baseCheck + ei * 20 + pi,
        Gross: round2(gross),
        Taxes: taxes,
        Deductions: deductions,
        NetPay: net,
        Memo: memo,
        EarningType: hourly ? "Hourly" : "Salary",
        OTHours: otHours,
        Garnishment: garn,
      });
    });
  });

  return { columns, rows };
}

/** Department Analysis (best practice, per period per department) */
function makeDepartmentAnalysis(): MockPayload {
  const columns = [
    "PeriodStart",
    "PeriodLabel",
    "Department",
    "CostCenter",
    "Location",
    "PayGroup",
    "Headcount",
    "FTE",
    "RegularPay",
    "OTPay",
    "Bonus",
    "EmployerTaxes",
    "Benefits",
    "Burden",           // EmployerTaxes + Benefits
    "TotalLaborCost",   // Regular + OT + Bonus + Burden
    "AvgCompPerFTE",
  ];

  const departments = [
    { name: "SALES", cc: "4000", loc: "HQ" },
    { name: "SRV/HUB", cc: "4100", loc: "DC-East" },
    { name: "TEACH", cc: "4200", loc: "HQ" },
    { name: "WORSHIP", cc: "4300", loc: "Remote" },
  ];

  const rows: any[] = [];
  const months = [
    mm(2025, 7), mm(2025, 8), mm(2025, 9), mm(2025, 10), mm(2025, 11),
  ];

  months.forEach((start, idx) => {
    const label = new Date(start).toLocaleString(undefined, { month: "short", year: "numeric" });
    departments.forEach((d, di) => {
      const headcount = 8 + di * 2 + (idx % 2);
      const fte = headcount - (di % 2 ? 1 : 0) * 0.5;

      const regular = 52000 / 26 * headcount * (1 + di * 0.03);
      const ot = (di % 2 ? 800 : 300) * (1 + idx * 0.05);
      const bonus = idx === 2 && di % 2 === 0 ? 2500 : 0;

      const employerTaxes = (regular + ot + bonus) * 0.085;
      const benefits = headcount * 450;
      const burden = employerTaxes + benefits;
      const total = regular + ot + bonus + burden;
      const avgPerFte = total / Math.max(1, fte);

      rows.push({
        PeriodStart: start,
        PeriodLabel: label,
        Department: d.name,
        CostCenter: d.cc,
        Location: d.loc,
        PayGroup: "Biweekly",
        Headcount: headcount,
        FTE: round2(fte),
        RegularPay: round2(regular),
        OTPay: round2(ot),
        Bonus: round2(bonus),
        EmployerTaxes: round2(employerTaxes),
        Benefits: round2(benefits),
        Burden: round2(burden),
        TotalLaborCost: round2(total),
        AvgCompPerFTE: round2(avgPerFte),
      });
    });
  });

  return { columns, rows };
}

/** Job History (effective-dated changes per employee) */
function makeJobHistory(): MockPayload {
  const columns = [
    "EffectiveDate",
    "EmployeeID",
    "EmployeeName",
    "JobCode",
    "JobTitle",
    "Action",
    "ReasonCode",
    "Department",
    "Supervisor",
    "Location",
    "FLSA",
    "PayType",
    "PayRate",
    "PayGrade",
    "Memo",
  ];

  const emps = [
    { id: "E001", name: "Aeryn Sun" },
    { id: "E002", name: "John Crichton" },
    { id: "E003", name: "D. Peacekeeper" },
    { id: "E004", name: "Pa'u Zotoh Zhaan" },
  ];
  const actions = [
    { action: "Hire", reason: "New Hire" },
    { action: "Job Change", reason: "Promotion" },
    { action: "Job Change", reason: "Transfer" },
    { action: "Pay Change", reason: "Merit Increase" },
    { action: "Termination", reason: "Voluntary" },
  ];
  const jobs = [
    { code: "SALES", title: "Sales Associate", dept: "SALES", flsa: "Non-exempt", pg: "S1", payType: "Hourly", base: 18.5 },
    { code: "SRV/HUB", title: "Server - HUB", dept: "SRV/HUB", flsa: "Non-exempt", pg: "S2", payType: "Hourly", base: 20.0 },
    { code: "TEACH", title: "Teacher", dept: "TEACH", flsa: "Exempt", pg: "P3", payType: "Salary", base: 1550 },
  ];
  const supervisors = ["Copeland, Curtis", "Schnagel, Darren", "Lofthouse, Robert"];
  const locations = ["HQ", "Remote", "DC-East"];

  const rows: any[] = [];
  emps.forEach((e, ei) => {
    // hire
    const j0 = jobs[ei % jobs.length];
    rows.push({
      EffectiveDate: "2024-08-01",
      EmployeeID: e.id,
      EmployeeName: e.name,
      JobCode: j0.code,
      JobTitle: j0.title,
      Action: "Hire",
      ReasonCode: "New Hire",
      Department: j0.dept,
      Supervisor: supervisors[ei % supervisors.length],
      Location: locations[ei % locations.length],
      FLSA: j0.flsa,
      PayType: j0.payType,
      PayRate: j0.base,
      PayGrade: j0.pg,
      Memo: "Onboarded",
    });

    // promotion
    const j1 = jobs[(ei + 1) % jobs.length];
    rows.push({
      EffectiveDate: "2025-02-10",
      EmployeeID: e.id,
      EmployeeName: e.name,
      JobCode: j1.code,
      JobTitle: j1.title,
      Action: "Job Change",
      ReasonCode: "Promotion",
      Department: j1.dept,
      Supervisor: supervisors[(ei + 1) % supervisors.length],
      Location: locations[(ei + 1) % locations.length],
      FLSA: j1.flsa,
      PayType: j1.payType,
      PayRate: j1.base * 1.05,
      PayGrade: j1.pg,
      Memo: "Promoted",
    });

    // merit
    rows.push({
      EffectiveDate: "2025-07-01",
      EmployeeID: e.id,
      EmployeeName: e.name,
      JobCode: j1.code,
      JobTitle: j1.title,
      Action: "Pay Change",
      ReasonCode: "Merit Increase",
      Department: j1.dept,
      Supervisor: supervisors[(ei + 1) % supervisors.length],
      Location: locations[(ei + 1) % locations.length],
      FLSA: j1.flsa,
      PayType: j1.payType,
      PayRate: j1.base * 1.08,
      PayGrade: j1.pg,
      Memo: "Annual merit",
    });
  });

  return { columns, rows };
}

/** Position History (effective-dated position changes) */
function makePositionHistory(): MockPayload {
  const columns = [
    "PositionID",
    "PositionTitle",
    "Department",
    "Supervisor",
    "Status",           // Active / Closed
    "FTE",
    "StandardHours",
    "PayGrade",
    "CostCenter",
    "Location",
    "EffectiveStart",
    "EffectiveEnd",
    "ReasonCode",
    "FilledBy",         // employee name (if filled)
  ];

  const positions = [
    { id: "P-1001", title: "Sales Associate", dept: "SALES", grade: "S1", cc: "4000", loc: "HQ" },
    { id: "P-1002", title: "Server - HUB", dept: "SRV/HUB", grade: "S2", cc: "4100", loc: "DC-East" },
    { id: "P-1003", title: "Teacher", dept: "TEACH", grade: "P3", cc: "4200", loc: "HQ" },
  ];
  const supervisors = ["Copeland, Curtis", "Schnagel, Darren", "Lofthouse, Robert"];
  const names = ["Aeryn Sun", "John Crichton", "D. Peacekeeper", null];

  const rows: any[] = [];
  positions.forEach((p, i) => {
    rows.push({
      PositionID: p.id,
      PositionTitle: p.title,
      Department: p.dept,
      Supervisor: supervisors[i % supervisors.length],
      Status: "Active",
      FTE: i === 2 ? 0.8 : 1.0,
      StandardHours: i === 2 ? 32 : 40,
      PayGrade: p.grade,
      CostCenter: p.cc,
      Location: p.loc,
      EffectiveStart: "2024-07-01",
      EffectiveEnd: null,
      ReasonCode: "New Position",
      FilledBy: names[i % names.length],
    });

    // Example change
    rows.push({
      PositionID: p.id,
      PositionTitle: p.title,
      Department: p.dept,
      Supervisor: supervisors[(i + 1) % supervisors.length],
      Status: i === 1 ? "Closed" : "Active",
      FTE: i === 1 ? 1.0 : 0.9,
      StandardHours: i === 1 ? 40 : 36,
      PayGrade: p.grade,
      CostCenter: p.cc,
      Location: p.loc,
      EffectiveStart: "2025-04-01",
      EffectiveEnd: i === 1 ? "2025-10-01" : null,
      ReasonCode: i === 1 ? "Position Eliminated" : "Hours Adjustment",
      FilledBy: names[(i + 1) % names.length],
    });
  });

  return { columns, rows };
}

/** Main dispatcher for demo reports */
export function getMockReport(id: string): MockPayload | null {
  switch (id) {
    case "check_detail_history":
      return makeCheckDetailHistory();
    case "department_analysis":
      return makeDepartmentAnalysis();
    case "job_history":
      return makeJobHistory();
    case "position_history":
      return makePositionHistory();

    case "w2_documents":
      return {
        columns: ["id", "name", "url", "size"],
        rows: [
          { id: "w2-2024-001", name: "W2_AerynSun_2024.pdf", url: "/sample.pdf", size: 210000 },
          { id: "w2-2024-002", name: "W2_JohnCrichton_2024.pdf", url: "/sample.pdf", size: 205000 },
        ],
        docs: [
          { id: "w2-2024-001", name: "W2_AerynSun_2024.pdf", url: "/sample.pdf", size: 210000 },
          { id: "w2-2024-002", name: "W2_JohnCrichton_2024.pdf", url: "/sample.pdf", size: 205000 },
        ],
      };

    default:
      return {
        columns: ["Note"],
        rows: [{ Note: `Demo mode: no mock defined for '${id}' yet.` }],
      };
  }
}
