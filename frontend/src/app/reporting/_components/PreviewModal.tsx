// frontend/src/app/reporting/_components/PreviewModal.tsx
"use client";

import * as React from "react";
import type { ReportType } from "../_data";

type Props = {
  open: boolean;
  report: ReportType | null;
  onClose: () => void;
};

type ApiRow = Record<string, unknown>;
type ApiResp = { report: ReportType; rows: ApiRow[] };

export default function PreviewModal({ open, report, onClose }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<ApiRow[]>([]);
  const [q, setQ] = React.useState("");

  // Fetch rows when modal opens and a report is present
  React.useEffect(() => {
    let abort = false;
    async function load() {
      if (!open || !report) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/${encodeURIComponent(report.id)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResp = await res.json();
        if (!abort) setRows(Array.isArray(data?.rows) ? data.rows : []);
      } catch {
        if (!abort) setRows([]);
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => {
      abort = true;
    };
  }, [open, report?.id]);

  // Filter (client-side)
  const filteredRows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(needle));
  }, [rows, q]);

  // Derive columns: prefer report.columns; otherwise from first row keys
  const columns = React.useMemo(() => {
    if (report?.columns?.length) return report.columns;
    const first = filteredRows[0];
    if (first && typeof first === "object") {
      return Object.keys(first).map((k) => ({ key: k, label: titleize(k) }));
    }
    return [] as { key: string; label: string }[];
  }, [report?.columns, filteredRows]);

  function titleize(s: string) {
    return s
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  async function handleExport() {
    if (!report) return; // guard fixes the TS error you saw
    try {
      const res = await fetch(
        `/api/reports/${encodeURIComponent(report.id)}/export`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(report as any).slug || report.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // no-op; you can toast here if you add a toaster
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-[min(1100px,95vw)] overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-900">
              {report?.title ?? "Report Preview"}
            </h2>
            {report?.description ? (
              <p className="truncate text-sm text-gray-500">{report.description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter…"
              className="w-56 rounded-md border px-3 py-1.5 text-sm outline-none focus:ring"
            />
            <button
              onClick={handleExport}
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
              disabled={!report || loading || columns.length === 0}
              title={!report ? "No report selected" : "Export CSV"}
            >
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-auto">
          {loading ? (
            <div className="px-5 py-8 text-sm text-gray-500">Loading…</div>
          ) : columns.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-500">
              No columns found for this report.
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-500">No data.</div>
          ) : (
            <table className="min-w-full border-t">
              <thead className="sticky top-0 bg-white">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="whitespace-nowrap border-b px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={idx} className="odd:bg-gray-50">
                    {columns.map((c) => (
                      <td key={c.key} className="px-3 py-2 text-sm text-gray-800">
                        {formatCell(row[c.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function formatCell(v: unknown) {
  if (v == null) return "";
  if (typeof v === "number") return Number.isFinite(v) ? v.toLocaleString() : String(v);
  return String(v);
}
