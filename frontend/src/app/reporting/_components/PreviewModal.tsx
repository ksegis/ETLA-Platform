"use client";

import React from "react";
import PayStatement from "./forms/PayStatement";
import W2Form from "./forms/W2Form";
import TimecardForm from "./forms/TimecardForm";
import { getMockRows } from "../_mock"; // must exist; can return Array<Dict> OR { rows, columns?, total? }

type Dict = Record<string, any>;

type Report = {
  id: string;
  title: string;
  description?: string;
  kind?: "pay" | "w2" | "timecard" | string;
};

type Props = {
  open: boolean;
  report: Report | null;
  onClose: () => void;
};

type DataResult = Dict[] | { rows?: Dict[]; columns?: string[]; total?: number };

export default function PreviewModal({ open, report, onClose }: Props) {
  const [rows, setRows] = React.useState<Dict[]>([]);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [selectedRow, setSelectedRow] = React.useState<Dict | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!open || !report) {
        setRows([]); setColumns([]); setSelectedRow(null);
        return;
      }

      // Normalize whatever the data source returns
      const raw: DataResult = await Promise.resolve(getMockRows(report.id));
      const { rows: normRows, columns: normCols } = normalize(raw);

      if (!cancelled) {
        setRows(normRows);
        setColumns(normCols);
        setSelectedRow(normRows[0] ?? null);
      }
    })();

    return () => { cancelled = true; };
  }, [open, report]);

  if (!open || !report) return null;

  const handleDownloadCSV = () => {
    if (!rows.length) return;
    const cols = columns.length ? columns : Object.keys(rows[0] ?? {});
    const csv = toCSV(rows, cols);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = (report.title || report.id || "report").replace(/\s+/g, "_");
    a.href = url;
    a.download = `${base}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
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
        <div className="grid grid-cols-12">
          {/* Left: table */}
          <div className="col-span-5 border-r max-h-[80vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr>
                  {columns.map((c) => (
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
                      {columns.map((c) => (
                        <td key={c} className="px-3 py-2 text-gray-800">
                          {fmtCell(r?.[c])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td className="px-3 py-8 text-center text-gray-500" colSpan={Math.max(columns.length, 1)}>
                      No rows to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Right: facsimile or details */}
          <div className="col-span-7 max-h-[80vh] overflow-auto p-4">
            {!selectedRow && <div className="text-sm text-gray-500">Select a row to preview.</div>}

            {selectedRow && report.kind === "pay" && <PayStatement data={safeRow(selectedRow)} />}
            {selectedRow && report.kind === "w2" && <W2Form data={safeRow(selectedRow)} />}
            {selectedRow && report.kind === "timecard" && <TimecardForm data={safeRow(selectedRow)} />}

            {selectedRow && !["pay", "w2", "timecard"].includes(report.kind || "") && (
              <div className="space-y-2">
                {columns.map((k) => (
                  <div key={k} className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 text-sm font-medium text-gray-600">{k}</div>
                    <div className="col-span-2 text-sm text-gray-900">{fmtCell(selectedRow?.[k])}</div>
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

/* ---------------- helpers ---------------- */

function normalize(raw: DataResult): { rows: Dict[]; columns: string[] } {
  if (Array.isArray(raw)) {
    const rows = raw;
    const cols = rows.length ? Object.keys(rows[0]) : [];
    return { rows, columns: cols };
  }
  const rows = Array.isArray(raw?.rows) ? raw.rows! : [];
  const columns =
    Array.isArray(raw?.columns) && raw.columns.length
      ? raw.columns
      : rows.length
      ? Object.keys(rows[0])
      : [];
  return { rows, columns };
}

function toCSV(rows: Dict[], columns: string[]) {
  const header = columns.join(",");
  const body = rows
    .map((r) =>
      columns
        .map((k) => {
          const v = r?.[k];
          const s = v == null ? "" : typeof v === "string" ? v : String(v);
          const needsQuotes = s.includes(",") || s.includes('"') || s.includes("\n");
          return needsQuotes ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

function fmtCell(v: any) {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

// Avoid facsimile components crashing on missing numbers (toFixed guards)
function safeRow(r: Dict): Dict {
  const clone: Dict = { ...r };
  for (const k of Object.keys(clone)) {
    const v = clone[k];
    if (typeof v === "number" && !Number.isFinite(v)) clone[k] = 0;
    if (v == null) clone[k] = "";
  }
  return clone;
}
