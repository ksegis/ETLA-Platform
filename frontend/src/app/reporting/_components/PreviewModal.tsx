// frontend/src/app/reporting/_components/PreviewModal.tsx
"use client";

import React from "react";
import { X, Filter } from "lucide-react";
import type { ReportType } from "../_data";
import { getMockRows } from "../_data";
import PayStatement from "./forms/PayStatement";
import W2Form from "./forms/W2Form";
import TimecardForm from "./forms/TimecardForm";
import { getMockRows } from "../_mock";

type Props = {
  open: boolean;
  report: ReportType;
  onClose: () => void;
};

export default function PreviewModal({ open, report, onClose }: Props) {
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [rows, setRows] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any | null>(null);

  // load rows whenever report or filters change
  React.useEffect(() => {
    if (!open) return;
    const r = getMockRows(report.slug, filters);
    setRows(r);
    // auto-select first row for fast preview
    setSelected(r?.[0] ?? null);
  }, [open, report, filters]);

  if (!open) return null;

  const isFacsimile = report.kind === "paystub" || report.kind === "w2" || report.kind === "timecard";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 sm:p-6">
      <div className="relative grid w-full max-w-[1400px] grid-cols-12 gap-4 rounded-xl bg-white p-4 shadow-xl">
        {/* Header */}
        <div className="col-span-12 flex items-center justify-between border-b pb-2">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">Preview</div>
            <div className="text-lg font-semibold text-gray-900">{report.title}</div>
          </div>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="col-span-12">
          <div className="mb-2 flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" /> Filters
            </div>

            {/* Common text search */}
            <label className="ml-2 text-xs text-gray-600">
              Search
              <input
                className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
                placeholder="Employee name…"
                value={filters.q ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              />
            </label>

            {/* Date ranges for pay/timecard */}
            {(report.kind === "paystub" || report.kind === "timecard") && (
              <>
                <label className="text-xs text-gray-600">
                  From
                  <input
                    type="date"
                    className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
                    value={filters.from ?? ""}
                    onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                  />
                </label>
                <label className="text-xs text-gray-600">
                  To
                  <input
                    type="date"
                    className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
                    value={filters.to ?? ""}
                    onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                  />
                </label>
              </>
            )}

            {/* Year for W2 */}
            {report.kind === "w2" && (
              <label className="text-xs text-gray-600">
                Year
                <select
                  className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
                  value={filters.year ?? ""}
                  onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value ? Number(e.target.value) : undefined }))}
                >
                  <option value="">All</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </label>
            )}
          </div>
        </div>

        {/* List + Facsimile */}
        <div className="col-span-12 grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <div className="overflow-hidden rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Employee</th>
                    <th className="px-3 py-2 text-right">{report.kind === "w2" ? "Year" : "Date"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const key = report.kind === "w2" ? `${r.employeeId}-${r.year}` : `${r.employeeId}-${r.payDate ?? r.periodEnd}`;
                    const right = report.kind === "w2" ? r.year : (r.payDate ?? r.periodEnd);
                    const active = selected && key === (report.kind === "w2"
                      ? `${selected.employeeId}-${selected.year}`
                      : `${selected.employeeId}-${selected.payDate ?? selected.periodEnd}`);
                    return (
                      <tr
                        key={key + i}
                        className={`cursor-pointer ${active ? "bg-indigo-50" : i % 2 ? "bg-white" : "bg-gray-50/40"}`}
                        onClick={() => setSelected(r)}
                      >
                        <td className="px-3 py-2">{r.employeeName}</td>
                        <td className="px-3 py-2 text-right">{right}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-gray-500">{rows.length} result(s)</div>
          </div>

          <div className="col-span-8">
            {!isFacsimile && (
              <div className="rounded-lg border border-dashed p-6 text-sm text-gray-600">
                This report renders as a data table, not a form facsimile.
              </div>
            )}

            {isFacsimile && !selected && (
              <div className="rounded-lg border border-dashed p-6 text-sm text-gray-600">
                Select a row to preview the form.
              </div>
            )}

            {isFacsimile && selected && (
              <>
                {report.kind === "paystub" && <PayStatement row={selected} />}
                {report.kind === "w2" && <W2Form row={selected} />}
                {report.kind === "timecard" && <TimecardForm row={selected} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
