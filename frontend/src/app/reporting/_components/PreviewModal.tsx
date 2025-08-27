"use client";

import React from "react";
import PayStatement from "./forms/PayStatement";
import W2Form from "./forms/W2Form";
import TimecardForm from "./forms/TimecardForm";
import { getMockRows } from "../_mock"; // may return Array<Dict> OR { rows, columns?, total? }
import type { Report } from "../_data";

type Dict = Record<string, any>;

type Props = {
  open: boolean;
  report: Report | null;
  onClose: () => void;
};

export default function PreviewModal({ open, report, onClose }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Dict[]>([]);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [total, setTotal] = React.useState<number | undefined>(undefined);
  const [selectedRow, setSelectedRow] = React.useState<Dict | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!open || !report) return;
      setLoading(true);
      setError(null);
      setSelectedRow(null);

      try {
        const raw = await (getMockRows as any)(report.id);
        const { rows, columns, total } = normalizeRows(raw);
        if (cancelled) return;
        setRows(rows);
        setColumns(columns);
        setTotal(total);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, report]);

  if (!open || !report) return null;

  // Make facsimile components accept any props (row/data) without TS squawks.
  const PayAny = PayStatement as unknown as React.ComponentType<any>;
  const W2Any = W2Form as unknown as React.ComponentType<any>;
  const TimeAny = TimecardForm as unknown as React.ComponentType<any>;

  const showFacsimile =
    !!selectedRow &&
    (report.kind === "pay" || report.kind === "w2" || report.kind === "timecard");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-[min(1100px,95vw)] max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{report.title}</h3>
            {report.description && (
              <p className="mt-0.5 text-xs text-gray-500">{report.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(rows, columns, report.id)}
              className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
            >
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-12">
          {/* Left: table */}
          <div className={`col-span-12 ${showFacsimile ? "md:col-span-6" : ""} overflow-auto`}>
            {loading && <div className="p-6 text-sm text-gray-500">Loading preview…</div>}
            {error && <div className="p-6 text-sm text-red-600">{error}</div>}
            {!loading && !error && rows.length === 0 && (
              <div className="p-6 text-sm text-gray-500">No data.</div>
            )}

            {!loading && !error && rows.length > 0 && (
              <div className="overflow-x-auto p-3">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      {columns.map((c) => (
                        <th key={c} className="px-3 py-2 text-left font-medium">
                          {humanize(c)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => (
                      <tr
                        key={idx}
                        className={`border-t hover:bg-indigo-50 ${
                          selectedRow === r ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedRow(r)}
                        style={{ cursor: "pointer" }}
                      >
                        {columns.map((c) => (
                          <td key={c} className="px-3 py-1.5 text-gray-800">
                            {formatCell(r[c])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {typeof total === "number" && (
                  <div className="px-1 py-2 text-[11px] text-gray-500">
                    Showing {rows.length} of {total}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: facsimile */}
          {showFacsimile && (
            <div className="hidden border-l md:col-span-6 md:block">
              <div className="h-full overflow-auto p-3">
                {report.kind === "pay" && (
                  <PayAny row={selectedRow} data={selectedRow} />
                )}
                {report.kind === "w2" && (
                  <W2Any row={selectedRow} data={selectedRow} />
                )}
                {report.kind === "timecard" && (
                  <TimeAny row={selectedRow} data={selectedRow} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------- helpers -------------- */

function normalizeRows(
  input: Dict[] | { rows: Dict[]; columns?: string[]; total?: number }
): { rows: Dict[]; columns: string[]; total?: number } {
  if (Array.isArray(input)) {
    const cols = inferColumns(input);
    return { rows: input, columns: cols, total: input.length };
  }
  const rows = Array.isArray(input.rows) ? input.rows : [];
  const columns =
    input.columns && input.columns.length > 0 ? input.columns : inferColumns(rows);
  return { rows, columns, total: input.total };
}

function inferColumns(rows: Dict[]): string[] {
  if (!rows || rows.length === 0) return [];
  return Object.keys(rows[0]);
}

function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatCell(v: any): string {
  if (v == null) return "";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function toCSV(rows: Dict[], columns: string[]): string {
  const esc = (s: any) => {
    const t = s == null ? "" : String(s);
    if (/[",\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
    return t;
  };
  const header = columns.map(esc).join(",");
  const data = rows.map((r) => columns.map((c) => esc(r[c])).join(",")).join("\n");
  return [header, data].filter(Boolean).join("\n");
}

function exportCSV(rows: Dict[], columns: string[], id: string) {
  const csv = toCSV(rows, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
