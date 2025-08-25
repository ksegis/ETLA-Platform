import { getReportById } from "../../../../reporting/_data";

// reuse the same tiny helpers as the other route (duplicated for simplicity)
const seedRand = (seed: string) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

function monthsBack(n = 6) {
  const out: { start: string; label: string }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    const dd = new Date(d);
    dd.setMonth(d.getMonth() - i);
    out.unshift({
      start: dd.toISOString().slice(0, 10),
      label: dd.toLocaleString("en-US", { month: "short", year: "numeric" }),
    });
  }
  return out;
}

function mockDeptAnalysis(seed = "dept") {
  const rnd = seedRand(seed);
  const depts = ["SALES", "SRV/HUB", "TEACH", "WORSHIP", "OPS", "RD"];
  const periods = monthsBack(6);
  const rows: any[] = [];
  for (const p of periods) {
    for (const d of depts) {
      const headcount = Math.floor(rnd() * 15) + 6;
      const fte = +(headcount - rnd() * 2).toFixed(1);
      const regular = +(headcount * (900 + rnd() * 500)).toFixed(2);
      const ot = +((headcount * (rnd() * 80)) as number).toFixed(2);
      const bonus = +((headcount * (rnd() * 60)) as number).toFixed(2);
      const taxes = +((regular + ot) * 0.18).toFixed(2);
      const benefits = +((regular + ot) * 0.12).toFixed(2);
      const burden = +(taxes + benefits).toFixed(2);
      const avgComp = +((regular + ot + bonus + burden) / headcount).toFixed(2);
      rows.push({
        periodStart: p.start,
        periodLabel: p.label,
        department: d,
        headcount,
        fte,
        regularPay: regular,
        otPay: ot,
        bonus,
        taxes,
        benefits,
        burden,
        avgComp,
      });
    }
  }
  return rows;
}

function mockJobHistory(seed = "job") {
  const rnd = seedRand(seed);
  const people = ["Aeryn Sun", "John Crichton", "D. Peacekeeper", "Zhan", "Rygel", "Chiana"];
  const changes = ["Promotion", "Transfer", "Lateral Move", "Demotion", "Pay Change", "Manager Change"];
  const rows: any[] = [];
  for (let i = 0; i < 180; i++) {
    const dt = new Date();
    dt.setDate(dt.getDate() - Math.floor(rnd() * 365));
    rows.push({
      employee: people[Math.floor(rnd() * people.length)],
      effectiveDate: dt.toISOString().slice(0, 10),
      changeType: changes[Math.floor(rnd() * changes.length)],
      fromDept: ["SALES", "OPS", "SRV/HUB", "TEACH"][Math.floor(rnd() * 4)],
      toDept: ["SALES", "OPS", "SRV/HUB", "TEACH"][Math.floor(rnd() * 4)],
      location: ["HQ", "DC-East", "Remote"][Math.floor(rnd() * 3)],
    });
  }
  rows.sort((a, b) => (a.effectiveDate < b.effectiveDate ? 1 : -1));
  return rows;
}

function mockPositionHistory(seed = "pos") {
  const rnd = seedRand(seed);
  const locations = ["HQ", "DC-East", "Remote"];
  const costCenters = [4000, 4100, 4200, 4300];
  const periods = monthsBack(6);
  const rows: any[] = [];
  for (const p of periods) {
    for (const cc of costCenters) {
      rows.push({
        periodStart: p.start,
        periodLabel: p.label,
        location: locations[Math.floor(rnd() * locations.length)],
        costCenter: cc,
        positions: Math.floor(rnd() * 25) + 5,
        incumbents: Math.floor(rnd() * 22) + 4,
        vacancies: Math.floor(rnd() * 6),
        fte: +(rnd() * 20 + 5).toFixed(1),
      });
    }
  }
  return rows;
}

function buildRows(reportId: string) {
  switch (reportId) {
    case "dept-analysis":
      return mockDeptAnalysis(reportId);
    case "job-history":
      return mockJobHistory(reportId);
    case "position-history":
      return mockPositionHistory(reportId);
    default:
      return [];
  }
}

function toCSV(rows: any[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: any) =>
    v == null
      ? ""
      : String(v).includes(",") || String(v).includes('"')
      ? `"${String(v).replace(/"/g, '""')}"`
      : String(v);
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\r\n");
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const report = getReportById(params.id);
  if (!report) {
    return new Response("Report not found", { status: 404 });
  }
  const rows = buildRows(report.id);
  const csv = toCSV(rows);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv;charset=utf-8",
      "content-disposition": `attachment; filename="${report.slug}.csv"`,
    },
  });
}
