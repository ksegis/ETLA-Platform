// frontend/src/app/reporting/_components/PreviewModal.tsx
"use client";

import * as React from "react";
import type { ReportType } from "../_data";
import { X, Download } from "lucide-react";

/** Very light slugify for filenames */
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ApiResponse =
  | { columns?: string[]; rows: any[] }
  | { data?: { columns?: string[]; rows: any[] } }
  | any;

type Props = {
  open: boolean;
  report: ReportType;
  onClose: () => void;
};

export default function PreviewModal({ open, report, onClose }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<any[]>([]);
  const [columns, setColumns] = React.useState<string[]>([]);

  // Filters
  const [q, setQ] = React.useState("");
  const [start, setStart] = React.useState<string>("");
  const [end, setEnd] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reports/${report.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse = await res.json();

        // Normalize shapes: accept {columns, rows} or {data:{columns,rows}} or array
        const payload =
          (json?.data && (json.data as any)) ||
          (Array.isArray(json) ? { rows: json } : json);

        const r: any[] = payload?.rows ?? [];
        const c: string[] =
          payload?.columns ??
          (r.length ? Object.keys(r[0]) : []);

        if (!cancelled) {
          setRows(r);
          setColumns(c);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [open, report.id]);

  // Generic date accessor — try common date-like fields
  function rowDate(r: any): Date | null {
    const candidates = [
      "pay_date",
      "payDate",
      "date",
      "check_date",
      "checkDate",
      "period_end",
      "periodEnd",
    ];
    for (const k of candidates) {
      if (r?.[k]) {
        const d = new Date(r[k]);
        if (!Number.isNaN(d.valueOf())) return d;
      }
    }
    return null;
  }

  const filtered = React.useMemo(() => {
    let out = rows;

    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter((r) =>
        Object.values(r).some((v) =>
          String(v ?? "").toLowerCase().includes(needle)
        )
      );
    }

    if (start) {
      const s = new Date(start);
      out = out.filter((r) => {
        const d = rowDate(r);
        return !d || d >= s;
      });
    }

    if (end) {
      // include end-of-day
      const eod = new Date(end);
      eod.setHours(23, 59, 59, 999);
      out = out.filter((r) => {
        const d = rowDate(r);
        return !d || d <= eod;
      });
    }

    return out;
  }, [rows, q, start, end]);

  function exportCSV() {
    if (!columns.length) return;

    const header = columns.join(",");
    const lines = filtered.map((r) =>
      columns
        .map((c) => {
          const val = r?.[c];
          // CSV-escape
          const s = String(val ?? "");
          const needsQuote = /[",\n]/.test(s);
          const quoted = `"${s.replace(/"/g, '""')}"`;
          return needsQuote ? quoted : s;
        })
        .join(",")
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const name = slugify(report.title || `report-${report.id}`) || "report";
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Report preview"
    >
      <div className="relative mt-8 w-[95vw] max-w-6xl rounded-xl bg-white shadow-xl ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {report.title}
            </h2>
            {report.description ? (
              <p className="mt-0.5 text-sm text-gray-600">
                {report.description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b px-4 pb-3 pt-3 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, memo, amount…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-sm text-gray-600">Start date</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-sm text-gray-600">End date</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-auto px-4 py-3 sm:px-6">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-600">
              Loading…
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-600">
              {error}
            </div>
          ) : !filtered.length ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No rows match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c}
                        className="border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr
                      key={i}
                      className="odd:bg-gray-50/50 hover:bg-indigo-50"
                    >
                      {columns.map((c) => (
                        <td
                          key={c}
                          className="whitespace-nowrap border-b border-gray-100 px-3 py-2 text-sm text-gray-800"
                        >
                          {formatCell(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatCell(v: any) {
  if (v == null) return "";
  // numbers: show 2 decimals if looks like currency
  if (typeof v === "number") {
    return Number.isInteger(v) ? v : v.toFixed(2);
  }
  // dates: pretty print if parseable
  const maybe = new Date(v);
  if (typeof v === "string" && !Number.isNaN(maybe.valueOf()) && /[-/]/.test(v)) {
    return maybe.toLocaleDateString();
  }
  return String(v);
}
