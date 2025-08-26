// frontend/src/app/reporting/_components/PreviewModal.tsx
"use client";

import * as React from "react";
import type { ReportType } from "../_data";
import { getMockRows } from "../_mock";

type Props = {
  open: boolean;
  report: ReportType | null;
  onClose: () => void;
};

export default function PreviewModal({ open, report, onClose }: Props) {
  const [q, setQ] = React.useState("");

  const rows = React.useMemo(() => {
    if (!report) return [];
    return getMockRows(report.id);
  }, [report]);

  const columns = React.useMemo(() => report?.columns ?? [], [report]);

  const filtered = React.useMemo(() => {
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(needle)
    );
  }, [rows, q]);

  if (!open || !report) return null;

  function exportCSV() {
    if (!columns.length) return;
    const header = columns.map((c) => c.label).join(",");
    const lines = filtered.map((row) =>
      columns
        .map((c) => {
          const v = row[c.key];
          const s = v == null ? "" : String(v);
          // naive csv escaping
          return `"${s.replace(/"/g, '""')}"`
        })
        .join(",")
    );
    const csv = [header, ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.slug || report.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-6xl rounded-xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">{report.title}</h2>
            {report.description ? (
              <p className="text-sm text-gray-600">{report.description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter…"
              className="rounded-md border px-3 py-2 text-sm"
            />
            <button
              onClick={exportCSV}
              className="rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
            >
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>

        {/* table */}
        <div className="max-h-[70vh] overflow-auto px-4 py-3">
          {columns.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No column definition for this report.
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-sm">
                  {columns.map((c) => (
                    <th key={c.key} className="border-b px-3 py-2 font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-8 text-center text-sm text-gray-500"
                      colSpan={columns.length}
                    >
                      No rows match current filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50"
                      onClick={() => {
                        // Row click could open facsimile in future;
                        // for now, we just log to keep build simple & stable.
                        console.log("Row clicked", row);
                      }}
                    >
                      {columns.map((c) => (
                        <td key={c.key} className="border-b px-3 py-2 text-sm">
                          {String(
                            row[c.key] == null ? "" : row[c.key]
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
