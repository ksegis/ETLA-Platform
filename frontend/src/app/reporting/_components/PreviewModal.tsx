"use client";

import React from "react";
import type { ReportType, Column } from "../_data";
import { getMockRows, type Dict } from "../_mock";

type Props = {
  open: boolean;
  report: ReportType | null;
  onClose: () => void;
};

const toCSV = (rows: Dict[], cols: Column[]) => {
  const header = cols.map((c) => `"${(c.label ?? c.key).replace(/"/g, '""')}"`).join(",");
  const body = rows
    .map((r) =>
      cols
        .map((c) => {
          const v = r[c.key];
          const s =
            v == null
              ? ""
              : typeof v === "string"
              ? v
              : typeof v === "number"
              ? String(v)
              : JSON.stringify(v);
          return `"${String(s).replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
};

export default function PreviewModal({ open, report, onClose }: Props) {
  const [rows, setRows] = React.useState<Dict[]>([]);
  const [filter, setFilter] = React.useState("");
  const limit = 60;

  const cols: Column[] = React.useMemo(() => {
    if (!report) return [];
    return Array.isArray(report.fields) ? report.fields : [];
  }, [report]);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      if (!report) return;
      const data = await getMockRows(report.id, {}, limit);
      if (!ignore) setRows(data);
    })();
    return () => {
      ignore = true;
    };
  }, [report]);

  const filtered = React.useMemo(() => {
    if (!filter) return rows;
    const term = filter.toLowerCase();
    return rows.filter((r) =>
      cols.some((c) => String(r[c.key] ?? "").toLowerCase().includes(term)),
    );
  }, [rows, filter, cols]);

  if (!open || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4">
      <div className="w-full max-w-6xl rounded-md bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">{report.title}</h2>
          <div className="flex items-center gap-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="rounded border px-2 py-1 text-sm"
            />
            <button
              onClick={() => {
                const csv = toCSV(filtered, cols);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${report.id}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
            >
              Export CSV
            </button>
            <button onClick={onClose} className="rounded border px-2 py-1 text-sm hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {cols.map((c) => (
                  <th key={c.key} className="px-3 py-2 text-left font-medium">
                    {c.label ?? c.key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-t">
                  {cols.map((c) => (
                    <td key={c.key} className="px-3 py-2 text-gray-800">
                      {r[c.key] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-3 py-8 text-center text-gray-500" colSpan={cols.length}>
                    No matching rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 text-xs text-gray-500">
          Showing {filtered.length} of {rows.length} rows
        </div>
      </div>
    </div>
  );
}
