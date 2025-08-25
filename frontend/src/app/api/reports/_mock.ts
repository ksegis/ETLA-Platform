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
  // Expect YYYY-MM-DD
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
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

  // Date range: look for PayDate, date, or paydate
  if (from) {
    const ts = dater(from);
    out = out.filter((r) => {
      const v = r.PayDate ?? r.paydate ?? r.date;
      return v ? dater(String(v)) >= ts : true;
    });
  }
  if (to) {
    const ts = dater(to);
    out = out.filter((r) => {
      const v = r.PayDate ?? r.paydate ?? r.date;
      return v ? dater(String(v)) <= ts : true;
    });
  }

  const f = filters || {};
  const nameTerm = (f.name ?? f.employee_name ?? "").toString().toLowerCase().trim();
  if (nameTerm) {
    out = out.filter((r) => {
      const hay =
        `${r.EmployeeName ?? ""} ${r.Memo ?? ""} ${r.Department ?? ""} ${r.EarningType ?? ""}`.toLowerCase();
      return hay.includes(nameTerm);
    });
  }

  if (f.department) {
    const dep = String(f.department).toLowerCase();
    out = out.filter((r) => String(r.Department ?? "").toLowerCase().includes(dep));
  }

  if (f.pay_number) {
    const pn = Number(f.pay_number);
    out = out.filter((r) => Number(r.PayNumber) === pn);
  }

  if (f.check_number) {
    const cn = Number(f.check_number);
    out = out.filter((r) => Number(r.CheckNumber) === cn);
  }

  if (f.memo) {
    const m = String(f.memo).toLowerCase();
    out = out.filter((r) => String(r.Memo ?? "").toLowerCase().includes(m));
  }

  const minGross = f.min_gross != null ? Number(f.min_gross) : null;
  const maxGross = f.max_gross != null ? Number(f.max_gross) : null;
  if (minGross != null) out = out.filter((r) => Number(r.Gross) >= minGross);
  if (maxGross != null) out = out.filter((r) => Number(r.Gross) <= maxGross);

  const total = out.length;
  const paged = out.slice(offset, offset + limit);

  const columns = paged[0]
    ? Object.keys(paged[0])
    : [
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

  return { columns, rows: paged, total };
}

/** ---------- Demo datasets ---------- */

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
      // vary comp structure
      const hourly = (ei % 3) === 0;
      const otHours = (ei % 4 === 0 && pi % 2 === 1) ? 3 : 0;
      const baseGross = hourly ? 18.5 * 80 : 1500 + ei * 35 + pi * 20; // hourly vs salary-ish
      const bonus = pi === 2 && ei % 2 === 0 ? 150 : 0; // one cycle bonus
      const gross = baseGross + otHours * 27 + bonus;

      const garn = ei % 5 === 0 ? 45 : 0; // some have garnishment
      const taxes = round2(gross * (0.18 + (ei % 3) * 0.01)); // 18–20%
      const otherDeductions = 110 + (pi % 3) * 10; // benefits, etc.
      const deductions = round2(otherDeductions + garn);
      const net = round2(gross - taxes - deductions);

      const memo = bonus
        ? "Bonus"
        : otHours
        ? "OT + shift diff"
        : pi === 5
        ? "Retro adjustment"
        : "Regular";

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

  // Edge cases
  rows.push({
    EmployeeID: "E999",
    EmployeeName: "Manual Test Zero",
    Department: "TEST",
    PayGroup: "Biweekly",
    PayDate: "2025-10-24",
    PayWeek: "2025-W43",
    PayNumber: 21,
    CheckNumber: 109999,
    Gross: 1000,
    Taxes: 0,
    Deductions: 0,
    NetPay: 1000,
    Memo: "Zero tax/ded",
    EarningType: "Hourly",
    OTHours: 0,
    Garnishment: 0,
  });

  rows.push({
    EmployeeID: "E004",
    EmployeeName: "Pa'u Zotoh Zhaan",
    Department: "TEACH",
    PayGroup: "Biweekly",
    PayDate: "2025-09-12",
    PayWeek: "2025-W37",
    PayNumber: 18,
    CheckNumber: 108888,
    Gross: 0,
    Taxes: 0,
    Deductions: -25,
    NetPay: 25,
    Memo: "Retro reimbursement",
    EarningType: "Adjustment",
    OTHours: 0,
    Garnishment: 0,
  });

  return { columns, rows };
}

export function getMockReport(id: string): MockPayload | null {
  switch (id) {
    case "check_detail_history":
      return makeCheckDetailHistory();

    // You can keep your existing mocks for other reports;
    // here’s a tiny stub so those routes still work if opened.
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
