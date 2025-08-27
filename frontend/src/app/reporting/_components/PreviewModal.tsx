"use client";

import React from "react";
import type { Report } from "../_data";
import { getMockRows } from "../_mock";

import PayStatement from "./forms/PayStatement";
import W2Form from "./forms/W2Form";
import TimecardForm from "./forms/TimecardForm";

type Dict = Record<string, any>;

type Props = {
  open: boolean;
  report: Report | null;
  onClose: () => void;
};

export default function PreviewModal({ open, report, onClose }: Props) {
  const [rows, setRows] = React.useState<Dict[]>([]);
  const [selectedRow, setSelectedRow] = React.useState<Dict | null>(null);

  // Load mock rows whenever the modal opens for a report
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!open || !report) {
        setRows([]);
        setSelectedRow(null);
        return;
      }
      // Support both sync/async implementations of getMockRows
      const result = await Promise.resolve(getMockRows(report.id));
      if (cancelled) return;
      const arr = Array.isArray(result) ? result : [];
      setRows(arr);
      setSelectedRow(arr[0] ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, report]);

  if (!open || !report) return null;

  // Derive columns from first row; fall back to report.fields labels
  const columnKeys =
    rows.length > 0
      ? Object.keys(rows[0])
      : (report.fields ?? [])
          .map((f) => (typeof f === "string" ? f : f.name ?? f.label ?? ""))
          .filter(Boolean);

  const handleDownloadCSV = () => {
    if (!rows.length) return;
    const cols = columnKeys.length ? columnKeys : Object.keys(rows[0] ?? {});
    const header = cols.join(",");
    const body = rows
      .map((r) =>
        cols
          .map((k) => {
            const v = r?.[k];
            const s =
              v === null || v === undefined
                ? ""
                : typeof v === "string"
                ? v
                : String(v);
            const needsQuotes = s.includes(",") || s.includes('"') || s.includes("\n");
            return needsQuotes ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      )
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const base = report.title?.replace(/\s+/g, "_") || report.id;
    a.download = `${base}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{report.title}</h2>
            {report.description ? (
              <p className="truncate text-sm text-gray-500">{report.description}</p>
            ) : null}
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-2">
            <button
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={handleDownloadCSV}
            >
              Download CSV
            </button>
            <button
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 gap-0">
          {/* Left: list */}
          <div className="col-span-5 border-r max-h-[80vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr>
                  {columnKeys.map((c) => (
                    <th key={c} className="px-3 py-2 text-left font-medium text-gray-600">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const selected = r === selectedRow;
                  return (
                    <tr
                      key={idx}
                      className={`cursor-pointer ${selected ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                      onClick={() => setSelectedRow(r)}
                    >
                      {columnKeys.map((c) => (
                        <td key={c} className="px-3 py-2 text-gray-800">
                          {formatCell(r?.[c])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td className="px-3 py-8 text-center text-gray-500" colSpan={columnKeys.length || 1}>
                      No rows to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Right: facsimile panel */}
          <div className="col-span-7 max-h-[80vh] overflow-auto p-4">
            {!selectedRow && (
              <div className="text-sm text-gray-500">Select a row to preview.</div>
            )}

            {selectedRow && report.kind === "pay" && <PayStatement data={selectedRow} />}
            {selectedRow && report.kind === "w2" && <W2Form data={selectedRow} />}
            {selectedRow && report.kind === "timecard" && <TimecardForm data={selectedRow} />}

            {/* Default: simple details panel when no special kind */}
            {selectedRow && !report.kind && (
              <div className="space-y-2">
                {Object.entries(selectedRow).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 text-sm font-medium text-gray-600">{k}</div>
                    <div className="col-span-2 text-sm text-gray-900">{formatCell(v)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCell(v: any) {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return Number.isFinite(v) ? v.toString() : "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}
