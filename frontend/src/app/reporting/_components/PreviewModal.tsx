"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import * as XLSX from "xlsx";

type AnyRow = Record<string, any>;

type PreviewModalProps = {
  open: boolean;
  report: { id: string; title: string; description?: string } | null;
  onClose: () => void;
  onRowClick?: (row: AnyRow) => void;
};

const PAGE_SIZES = [25, 50, 100, 250];
const DEFAULT_PAGE_SIZE = 50;

/* ------------------------------- Demo data ------------------------------ */

function genDemoRows(reportId: string, count = 360): AnyRow[] {
  const depts = ["SALES", "SRV/HUB", "TEACH", "WORSHIP", "OPS", "HR"];
  const locs = ["HQ", "Remote", "DC-East", "DC-West"];
  const paygroups = ["Biweekly", "Weekly", "Monthly"];
  const titles = [
    "Sales Associate",
    "Server - HUB",
    "Teacher",
    "Worship Leader",
    "HR Generalist",
    "Operations Lead",
  ];
  const names = ["Aeryn Sun", "John Crichton", "D. Peacekeeper", "B. Stark", "C. Copeland", "R. Lofthouse"];

  const rows: AnyRow[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(2025, i % 6, 1);
    const periodstart = d.toISOString().slice(0, 10);
    const periodlabel = d.toLocaleString("en-US", { month: "short", year: "numeric" });

    const dept = depts[i % depts.length];
    const loc = locs[i % locs.length];
    const pg = paygroups[i % paygroups.length];
    const cc = 4000 + (i % 8) * 10;

    if (reportId === "department_analysis") {
      const headcount = 8 + (i % 10);
      const fte = Number((headcount - 0.5 - (i % 2 ? 0.5 : 0)).toFixed(1));
      const regularpay = 16000 + (i % 10) * 900;
      const otpay = [0, 300, 315, 330, 840, 880][i % 6];
      const bonus = [0, 0, 0, 500, 1200, 2500][i % 6];

      rows.push({
        periodstart,
        periodlabel,
        department: dept,
        costcenter: cc,
        location: loc,
        paygroup: pg,
        headcount,
        fte,
        regularpay,
        otpay,
        bonus,
      });
    } else if (reportId === "job_history") {
      const actions = ["New Position", "Promotion", "Lateral Move", "Transfer", "Demotion"];
      const reasons = ["Reorg", "Backfill", "Merit", "Request", "Business need"];
      rows.push({
        effectivedate: periodstart,
        employee: names[i % names.length],
        employeeid: `E${String(1 + (i % 220)).padStart(3, "0")}`,
        title: titles[i % titles.length],
        department: dept,
        action: actions[i % actions.length],
        reason: reasons[i % reasons.length],
        supervisor: ["Clay Hecocks", "Curtis Copeland", "Robert Lofthouse"][i % 3],
        location: loc,
      });
    } else if (reportId === "position_history") {
      const positions = ["Associate", "Sr Associate", "Lead", "Manager", "Director"];
      const reasons = ["Backfill", "New role", "Temporary", "Restructure"];
      rows.push({
        effectivedate: periodstart,
        employee: names[i % names.length],
        employeeid: `E${String(1 + (i % 220)).padStart(3, "0")}`,
        position: positions[i % positions.length],
        department: dept,
        paygroup: pg,
        reason: reasons[i % reasons.length],
        costcenter: cc,
        location: loc,
      });
    } else {
      rows.push({ date: periodstart, employee: names[i % names.length], department: dept, location: loc });
    }
  }
  return rows;
}

/* ---------------------------- Chart preparation ------------------------- */

function buildChartSeries(reportId: string, rows: AnyRow[]) {
  const norm = (v: any) => (typeof v === "string" ? v.trim() : v);
  const R = rows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), v]))
  );

  if (reportId === "department_analysis") {
    const byDept: Record<string, { department: string; Regular: number; OT: number; Bonus: number }> = {};
    for (const r of R) {
      const dept = String(norm(r.department ?? "Unknown"));
      const regular = Number(r.regularpay ?? r.regular ?? 0);
      const ot = Number(r.otpay ?? r.overtime ?? 0);
      const bonus = Number(r.bonus ?? 0);
      if (!byDept[dept]) byDept[dept] = { department: dept, Regular: 0, OT: 0, Bonus: 0 };
      byDept[dept].Regular += regular;
      byDept[dept].OT += ot;
      byDept[dept].Bonus += bonus;
    }
    return Object.values(byDept);
  }

  if (reportId === "job_history") {
    const byTitle: Record<string, { title: string; Changes: number }> = {};
    for (const r of R) {
      const title = String(norm(r.title ?? "Unknown"));
      byTitle[title] ??= { title, Changes: 0 };
      byTitle[title].Changes += 1;
    }
    return Object.values(byTitle);
  }

  if (reportId === "position_history") {
    const byPos: Record<string, { position: string; Changes: number }> = {};
    for (const r of R) {
      const pos = String(norm(r.position ?? r.department ?? "Unknown"));
      byPos[pos] ??= { position: pos, Changes: 0 };
      byPos[pos].Changes += 1;
    }
    return Object.values(byPos);
  }

  return [];
}

function toExcelFilename(reportId: string) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${reportId}-${stamp}.xlsx`;
}

function exportExcel(rows: AnyRow[], reportId: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, toExcelFilename(reportId));
}

/* -------------------------------- Component ----------------------------- */

export default function PreviewModal({ open, report, onClose, onRowClick }: PreviewModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [useDemo, setUseDemo] = React.useState(true);

  const [rows, setRows] = React.useState<AnyRow[]>([]);
  const [query, setQuery] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const [department, setDepartment] = React.useState("");
  const [costCenter, setCostCenter] = React.useState("");
  const [payGroup, setPayGroup] = React.useState("");
  const [location, setLocation] = React.useState("");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);

  const [view, setView] = React.useState<"table" | "chart">("table");
  const chartCapable =
    !!report &&
    ["department_analysis", "job_history", "position_history"].includes(report.id);

  // Load data when opened or toggling demo.
  React.useEffect(() => {
    if (!open || !report) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 100));
      const data = useDemo ? genDemoRows(report.id) : [];
      if (!cancelled) {
        setRows(data);
        setLoading(false);
        setPage(1);
        // Switch to Chart *after* rows exist so ResponsiveContainer has width.
        setView(chartCapable ? "chart" : "table");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, report?.id, useDemo, chartCapable]);

  // Force a resize after open/data change so Recharts recalculates.
  React.useLayoutEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {}
    }, 50);
    return () => clearTimeout(t);
  }, [open, view, rows.length]);

  // Filtered view
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const dateKey = r.periodstart ?? r.effectivedate ?? r.paydate ?? r.date ?? null;
      const inQ = !q || Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q));
      const inFrom = !from || (dateKey && String(dateKey) >= from);
      const inTo = !to || (dateKey && String(dateKey) <= to);
      const inDept = !department || String(r.department ?? "").toLowerCase().includes(department.toLowerCase());
      const inLoc = !location || String(r.location ?? "").toLowerCase().includes(location.toLowerCase());
      const inCC = !costCenter || String(r.costcenter ?? "").includes(costCenter);
      const inPG = !payGroup || String(r.paygroup ?? "").toLowerCase().includes(payGroup.toLowerCase());
      return inQ && inFrom && inTo && inDept && inLoc && inCC && inPG;
    });
  }, [rows, query, from, to, department, location, costCenter, payGroup]);

  const pageRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const columns: string[] = React.useMemo(() => {
    if (!report) return [];
    switch (report.id) {
      case "department_analysis":
        return [
          "periodstart",
          "periodlabel",
          "department",
          "costcenter",
          "location",
          "paygroup",
          "headcount",
          "fte",
          "regularpay",
          "otpay",
          "bonus",
        ];
      case "job_history":
        return [
          "effectivedate",
          "employee",
          "employeeid",
          "title",
          "department",
          "action",
          "reason",
          "supervisor",
          "location",
        ];
      case "position_history":
        return [
          "effectivedate",
          "employee",
          "employeeid",
          "position",
          "department",
          "paygroup",
          "reason",
          "costcenter",
          "location",
        ];
      default:
        return Object.keys(pageRows[0] ?? {});
    }
  }, [report, pageRows]);

  const chartData = React.useMemo(() => {
    if (!report) return [];
    return buildChartSeries(report.id, filtered);
  }, [report, filtered]);

  const xKey =
    report?.id === "department_analysis"
      ? "department"
      : chartData.length && "title" in (chartData[0] as any)
      ? "title"
      : "position";

  if (!open || !report) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-[1200px] rounded-xl bg-white shadow-xl min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900">{report.title}</h2>
            {!!report.description && (
              <p className="mt-0.5 truncate text-xs text-gray-500">{report.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 border-b px-4 py-4 sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
          <input
            className="rounded-md border px-3 py-2 text-sm"
            placeholder="Name / search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2 text-sm"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2 text-sm"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />

          {chartCapable && (
            <>
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Cost center"
                value={costCenter}
                onChange={(e) => {
                  setCostCenter(e.target.value);
                  setPage(1);
                }}
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Pay group"
                value={payGroup}
                onChange={(e) => {
                  setPayGroup(e.target.value);
                  setPage(1);
                }}
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Location"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
              />
            </>
          )}

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
                  className={`px-3 py-1 text-xs ${
                    view === "table" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setView("chart")}
                  className={`px-3 py-1 text-xs ${
                    view === "chart" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
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

        {/* Body */}
        <div className="px-4 pb-4 pt-3 sm:px-6 min-w-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-gray-500">
              No rows to display. Try enabling <b>Demo data</b> or adjusting filters.
            </div>
          ) : view === "chart" && chartCapable ? (
            <div className="h-[380px] w-full min-w-0 rounded-lg border border-gray-200 bg-white p-3">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  No chartable data for the current filters.
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  debounce={100}
                  // Changing key on data length/view nudges Recharts to recompute
                  key={`${report.id}-${chartData.length}-${view}`}
                >
                  {report.id === "department_analysis" ? (
                    <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={xKey} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Regular" stackId="cost" />
                      <Bar dataKey="OT" stackId="cost" />
                      <Bar dataKey="Bonus" stackId="cost" />
                    </BarChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={xKey} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Changes" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <>
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
                    {pageRows.map((r, idx) => (
                      <tr
                        key={idx}
                        className="cursor-pointer odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                        onClick={() => onRowClick?.(r)}
                      >
                        {columns.map((c) => (
                          <td key={c} className="px-3 py-2 text-gray-800">
                            {String(r[c] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-gray-600">
                  Showing <b>{(page - 1) * pageSize + 1}</b>–
                  <b>{Math.min(page * pageSize, filtered.length)}</b> of <b>{filtered.length}</b> rows
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Rows per page</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-md border px-2 py-1 text-xs"
                  >
                    {PAGE_SIZES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <div className="ml-2 inline-flex overflow-hidden rounded-md border">
                    <button
                      className="px-2 py-1 text-xs disabled:opacity-40"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Prev
                    </button>
                    <div className="border-l px-3 py-1 text-xs">
                      Page {page} / {totalPages}
                    </div>
                    <button
                      className="border-l px-2 py-1 text-xs disabled:opacity-40"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
