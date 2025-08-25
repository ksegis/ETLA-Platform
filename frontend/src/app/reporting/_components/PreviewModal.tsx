"use client";

import * as React from "react";
import { ReportType } from "../_data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

type Props = {
  open: boolean;
  report: ReportType | null;
  onClose: () => void;
};

// ------- Mock data generators (deterministic) -------
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
  // newest first
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

function buildRows(reportId: string, seed = "demo") {
  switch (reportId) {
    case "dept-analysis":
      return mockDeptAnalysis(seed);
    case "job-history":
      return mockJobHistory(seed);
    case "position-history":
      return mockPositionHistory(seed);
    default:
      return [];
  }
}

// ------- CSV helper -------
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

// ------- Component -------
export default function PreviewModal({ open, report, onClose }: Props) {
  const [demo, setDemo] = React.useState(true);
  const [view, setView] = React.useState<"table" | "chart">("table");
  const [search, setSearch] = React.useState("");
  const [rows, setRows] = React.useState<any[]>([]);

  // regenerate rows on open / report / demo toggle
  React.useEffect(() => {
    if (!open || !report) return;
    // For now always use mock when demo is on or when no backend is wired
    const data = buildRows(report.id, report.id);
    setRows(data);
  }, [open, report, demo]);

  const filtered = React.useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(s))
    );
  }, [rows, search]);

  if (!open || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4">
      <div className="mt-6 w-[1100px] max-w-[95vw] rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
          <div>
            <div className="text-lg font-semibold">{report.title}</div>
            <div className="text-xs text-gray-500">{report.description}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csv = toCSV(filtered);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${report.slug}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
            >
              Export to CSV
            </button>
            <button
              onClick={onClose}
              className="rounded-md border px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-64 rounded-md border px-3 py-2 text-sm outline-none focus:ring"
          />
          <label className="inline-flex select-none items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={demo}
              onChange={(e) => setDemo(e.target.checked)}
            />
            Demo data
          </label>

          <div className="ml-auto flex items-center gap-1 rounded-md bg-gray-100 p-1">
            <button
              onClick={() => setView("table")}
              className={`rounded px-2 py-1 text-xs ${
                view === "table" ? "bg-white shadow" : "text-gray-600"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setView("chart")}
              className={`rounded px-2 py-1 text-xs ${
                view === "chart" ? "bg-white shadow" : "text-gray-600"
              }`}
            >
              Chart
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5">
          <div className="mb-2 text-xs text-gray-500">
            Showing <span className="font-medium">{filtered.length}</span> rows
          </div>

          {view === "table" ? (
            <div className="max-h-[55vh] overflow-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    {filtered[0] ? (
                      Object.keys(filtered[0]).map((k) => (
                        <th key={k} className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                          {k}
                        </th>
                      ))
                    ) : (
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                        No data
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 500).map((r, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      {Object.keys(filtered[0] ?? {}).map((k) => (
                        <td key={k} className="px-3 py-2 text-gray-800">
                          {String(r[k] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[55vh] w-full">
              {/* Simple sensible defaults per report */}
              {report.id === "dept-analysis" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={groupSum(filtered, "department", ["regularPay", "otPay", "bonus"])}
                    margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="regularPay" stackId="a" />
                    <Bar dataKey="otPay" stackId="a" />
                    <Bar dataKey="bonus" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {report.id === "job-history" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={byMonthCount(filtered, "effectiveDate")}
                    margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line dataKey="count" type="monotone" />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {report.id === "position-history" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={groupSum(filtered, "location", ["positions", "incumbents", "vacancies"])}
                    margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="positions" />
                    <Bar dataKey="incumbents" />
                    <Bar dataKey="vacancies" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------- tiny chart helpers -------
function groupSum<T extends Record<string, any>>(
  rows: T[],
  key: keyof T,
  measureKeys: (keyof T)[]
) {
  const m = new Map<string, any>();
  for (const r of rows) {
    const k = String(r[key]);
    if (!m.has(k)) m.set(k, { [String(key)]: k });
    const acc = m.get(k)!;
    for (const mk of measureKeys) {
      acc[String(mk)] = (acc[String(mk)] ?? 0) + (Number(r[mk]) || 0);
    }
  }
  return Array.from(m.values());
}

function byMonthCount<T extends Record<string, any>>(rows: T[], dateKey: keyof T) {
  const b = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(String(r[dateKey]));
    if (!isFinite(d.getTime())) continue;
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    b.set(label, (b.get(label) ?? 0) + 1);
  }
  return Array.from(b.entries())
    .sort(([a], [b2]) => (a < b2 ? -1 : 1))
    .map(([month, count]) => ({ month, count }));
}
