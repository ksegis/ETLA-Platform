"use client";

import * as React from "react";
import type { ReportType } from "../_data";

type Props = {
  open: boolean;
  report: ReportType | null;
  onClose: () => void;
};

export default function PreviewModal({ open, report, onClose }: Props) {
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let abort = false;

    async function load() {
      if (!open || !report?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reports/${encodeURIComponent(report.id)}?limit=50`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!abort) setRows(Array.isArray(json?.rows) ? json.rows : []);
      } catch (e: any) {
        if (!abort) setError(e?.message || "Failed to load preview.");
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, [open, report?.id]);

  const handleExport = React.useCallback(() => {
    if (!report?.id) return;
    const url = `/api/reports/${encodeURIComponent(report.id)}/export`;
    // trigger download in a new navigation (keeps modal open)
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [report?.id]);

  if (!open || !report) return null;

  const title = report.title || report.id || "Report";
  const hasData = rows && rows.length > 0;
  const columns = hasData ? Object.keys(rows[0]) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-5xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-lg font-semibold text-gray-900">{title} — Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-auto px-5 py-4">
          {loading && <div className="py-8 text-sm text-gray-500">Loading…</div>}
          {error && <div className="py-8 text-sm text-red-600">Error: {error}</div>}

          {!loading && !error && (
            <>
              {!hasData ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  No data found for this report preview.
                </div>
              ) : (
                <div className="overflow-auto rounded-lg border">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        {columns.map((c) => (
                          <th key={c} className="whitespace-nowrap border-b px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, idx) => (
                        <tr key={idx} className="odd:bg-white even:bg-gray-50">
                          {columns.map((c) => (
                            <td key={c} className="border-b px-3 py-2 text-sm text-gray-800">
                              {formatCell(r?.[c])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatCell(v: any) {
  if (v == null) return "";
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}
