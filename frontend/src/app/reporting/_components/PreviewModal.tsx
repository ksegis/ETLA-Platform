"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";

type AnyRow = Record<string, any>;
type ReportMeta = { id: string; title: string; description?: string };

type Props = {
  open: boolean;
  report: ReportMeta | null;
  onClose: () => void;
};

/* --------------------- Demo rows used when “Demo data” is on --------------------- */
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const names = ["Aeryn Sun", "John Crichton", "D. Peacekeeper", "B. Stark", "C. Copeland", "R. Lofthouse"];
const depts = ["SALES", "SRV/HUB", "TEACH", "WORSHIP", "OPS", "HR"];
const locs = ["HQ", "Remote", "DC-East", "DC-West"];
const paygroups = ["Biweekly", "Weekly", "Monthly"];

function genDemo(reportId: string, n = 240): AnyRow[] {
  const rows: AnyRow[] = [];
  for (let i = 0; i < n; i++) {
    const m = i % 6;
    const periodstart = `2025-${String(m + 1).padStart(2, "0")}-01`;
    const periodlabel = `${months[m]} 2025`;
    const department = depts[i % depts.length];
    const location = locs[i % locs.length];
    const paygroup = paygroups[i % paygroups.length];
    const costcenter = 4000 + (i % 8) * 10;

    if (reportId === "department_analysis") {
      rows.push({
        periodstart, periodlabel, department, location, paygroup, costcenter,
        headcount: 8 + (i % 10),
        fte: 8 + (i % 10) - 0.5,
        regularpay: 16000 + (i % 10) * 900,
        otpay: [0, 300, 315, 330, 840, 880][i % 6],
        bonus: [0, 0, 0, 500, 1200, 2500][i % 6],
      });
    } else if (reportId === "job_history") {
      const titles = ["Sales Associate", "Server - HUB", "Teacher", "Worship Leader", "HR Generalist", "Operations Lead"];
      const actions = ["New Position", "Promotion", "Lateral Move", "Transfer", "Demotion"];
      const reasons = ["Reorg", "Backfill", "Merit", "Request", "Business need"];
      rows.push({
        effectivedate: periodstart,
        employee: names[i % names.length],
        employeeid: `E${String(1 + (i % 220)).padStart(3, "0")}`,
        title: titles[i % titles.length],
        department, location,
        action: actions[i % actions.length],
        reason: reasons[i % reasons.length],
        supervisor: ["Clay Hecocks", "Curtis Copeland", "Robert Lofthouse"][i % 3],
      });
    } else if (reportId === "position_history") {
      const positions = ["Associate", "Sr Associate", "Lead", "Manager", "Director"];
      const reasons = ["Backfill", "New role", "Temporary", "Restructure"];
      rows.push({
        effectivedate: periodstart,
        employee: names[i % names.length],
        employeeid: `E${String(1 + (i % 220)).padStart(3, "0")}`,
        position: positions[i % positions.length],
        department, location, paygroup, reason: reasons[i % reasons.length],
        costcenter,
      });
    }
  }
  return rows;
}

/* --------------------------- Chart data builders --------------------------- */
function buildSeries(reportId: string, rows: AnyRow[]) {
  const R = rows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), v]))
  );

  if (reportId === "department_analysis") {
    const byDept: Record<string, { department: string; Regular: number; OT: number; Bonus: number }> = {};
    for (const r of R) {
      const dept = String(r.department ?? "Unknown");
      byDept[dept] ??= { department: dept, Regular: 0, OT: 0, Bonus: 0 };
      byDept[dept].Regular += Number(r.regularpay ?? 0);
      byDept[dept].OT += Number(r.otpay ?? 0);
      byDept[dept].Bonus += Number(r.bonus ?? 0);
    }
    return Object.values(byDept);
  }

  if (reportId === "job_history") {
    const byTitle: Record<string, { title: string; Changes: number }> = {};
    for (const r of R) {
      const key = String(r.title ?? "Unknown");
      byTitle[key] ??= { title: key, Changes: 0 };
      byTitle[key].Changes += 1;
    }
    return Object.values(byTitle);
  }

  if (reportId === "position_history") {
    const byPos: Record<string, { position: string; Changes: number }> = {};
    for (const r of R) {
      const key = String(r.position ?? "Unknown");
      byPos[key] ??= { position: key, Changes: 0 };
      byPos[key].Changes += 1;
    }
    return Object.values(byPos);
  }

  return [];
}

function exportExcel(rows: AnyRow[], reportId: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  XLSX.writeFile(wb, `${reportId}-${stamp}.xlsx`);
}

/* -------------------------------- Component -------------------------------- */
export default function PreviewModal({ open, report, onClose }: Props) {
  const chartCapable =
    !!report &&
    ["department_analysis", "job_history", "position_history"].includes(report.id);

  const [useDemo, setUseDemo] = React.useState(true);
  const [view, setView] = React.useState<"table" | "chart">("chart");

  const [query, setQuery] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [payGroup, setPayGroup] = React.useState("");
  const [costCenter, setCostCenter] = React.useState("");

  const [rows, setRows] = React.useState<AnyRow[]>([]);

  React.useEffect(() => {
    if (!open || !report) return;
    // Always start with chart for chartable reports
    setView(chartCapable ? "chart" : "table");
    setRows(useDemo ? genDemo(report.id) : []);
  }, [open, report?.id, useDemo, chartCapable]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const dateKey = r.periodstart ?? r.effectivedate ?? r.paydate ?? r.date ?? null;
      const inQ = !q || Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q));
      const inFrom = !from || (dateKey && String(dateKey) >= from);
      const inTo = !to || (dateKey && String(dateKey) <= to);
      const inDept = !department || String(r.department ?? "").toLowerCase().includes(department.toLowerCase());
      const inLoc = !location || String(r.location ?? "").toLowerCase().includes(location.toLowerCase());
      const inPG = !payGroup || String(r.paygroup ?? "").toLowerCase().includes(payGroup.toLowerCase());
      const inCC = !costCenter || String(r.costcenter ?? "").includes(costCenter);
      return inQ && inFrom && inTo && inDept && inLoc && inPG && inCC;
    });
  }, [rows, query, from, to, department, location, payGroup, costCenter]);

  const columns = React.useMemo(() => {
    if (!report) return [];
    switch (report.id) {
      case "department_analysis":
        return ["periodstart","periodlabel","department","costcenter","location","paygroup","headcount","fte","regularpay","otpay","bonus"];
      case "job_history":
        return ["effectivedate","employee","employeeid","title","department","action","reason","supervisor","location"];
      case "position_history":
        return ["effectivedate","employee","employeeid","position","department","paygroup","reason","costcenter","location"];
      default:
        return Object.keys(filtered[0] ?? {});
    }
  }, [report, filtered]);

  const series = React.useMemo(() => {
    if (!report) return [];
    return buildSeries(report.id, filtered);
  }, [report, filtered]);

  if (!open || !report) return null;

  const xKey =
    report.id === "department_analysis"
      ? "department"
      : report.id === "job_history"
      ? "title"
      : "position";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-[1200px] rounded-xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{report.title}</h2>
            {report.description && (
              <p className="mt-0.5 text-xs text-gray-500">{report.description}</p>
            )}
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* filters */}
        <div className="grid grid-cols-1 gap-3 border-b px-4 py-4 sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
          <input className="rounded-md border px-3 py-2 text-sm" placeholder="Name / search" value={query} onChange={(e) => setQuery(e.target.value)} />
          <input type="date" className="rounded-md border px-3 py-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="rounded-md border px-3 py-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />

          <input className="rounded-md border px-3 py-2 text-sm" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <input className="rounded-md border px-3 py-2 text-sm" placeholder="Cost center" value={costCenter} onChange={(e) => setCostCenter(e.target.value)} />
          <input className="rounded-md border px-3 py-2 text-sm" placeholder="Pay group" value={payGroup} onChange={(e) => setPayGroup(e.target.value)} />
          <input className="rounded-md border px-3 py-2 text-sm" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />

          <div className="col-span-full flex flex-wrap items-center gap-3 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={useDemo} onChange={(e) => setUseDemo(e.target.checked)} />
              Demo data
            </label>

            {chartCapable && (
              <div className="ml-auto inline-flex overflow-hidden rounded-md border">
                <button
                  type="button"
                  onClick={() => setView("table")}
                  className={`px-3 py-1 text-xs ${view === "table" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setView("chart")}
                  className={`px-3 py-1 text-xs ${view === "chart" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  Chart
                </button>
              </div>
            )}

            <button
              onClick={() => exportExcel(filtered, report.id)}
              className="ml-auto rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black"
            >
              Export to Excel
            </button>
          </div>
        </div>

        {/* body */}
        <div className="px-4 pb-4 pt-3 sm:px-6">
          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-gray-500">
              No rows to display. Try enabling <b>Demo data</b> or adjust filters.
            </div>
          ) : view === "chart" && chartCapable ? (
            <>
              <div className="mb-2 text-xs text-gray-600">Showing <b>{filtered.length}</b> rows</div>
              <div className="h-[380px] w-full rounded-lg border bg-white p-3">
                <ResponsiveContainer width="100%" height="100%">
                  {report.id === "department_analysis" ? (
                    <BarChart data={series} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Regular" />
                      <Bar dataKey="OT" />
                      <Bar dataKey="Bonus" />
                    </BarChart>
                  ) : (
                    <BarChart data={series} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={xKey} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Changes" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th key={c} className="sticky top-0 z-10 border-b bg-white px-3 py-2 font-medium text-gray-700">
                        {c.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map((r, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      {columns.map((c) => (
                        <td key={c} className="px-3 py-2 text-gray-800">
                          {String(r[c] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 200 && (
                <div className="mt-2 text-xs text-gray-600">
                  Showing first 200 rows (export to Excel for all rows).
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
