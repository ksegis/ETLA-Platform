"use client";

import * as React from "react";
import { getMockRows, inferReportKind } from "../_mock";

// If you have these facsimile components, the imports below will wire them in.
// If any don't exist yet, you can comment out the missing ones temporarily.
import PayStatement from "./forms/PayStatement";
import W2Form from "./forms/W2Form";
import TimecardForm from "./forms/TimecardForm";

type Report = {
  id: string;
  title: string;
  group?: string;
  slug?: string;
};

type Props = {
  open: boolean;
  report: Report | null;
  onClose: () => void;
};

type Column = { key: string; label: string; format?: (v: any) => string };

function fmtCurrency(n: any) {
  const v = typeof n === "number" ? n : Number(n ?? 0);
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function fmtDate(s: any) {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toLocaleDateString();
}

function columnsForKind(kind: string): Column[] {
  switch (kind) {
    case "w2":
      return [
        { key: "year", label: "Year" },
        { key: "employeeId", label: "Employee ID" },
        { key: "employee", label: "Employee" },
        { key: "ssnMasked", label: "SSN" },
        { key: "wages", label: "Wages", format: fmtCurrency },
        { key: "federalTax", label: "Federal Tax", format: fmtCurrency },
        { key: "state", label: "State" },
        { key: "stateWages", label: "State Wages", format: fmtCurrency },
      ];
    case "timecard":
      return [
        { key: "periodStart", label: "Start", format: fmtDate },
        { key: "periodEnd", label: "End", format: fmtDate },
        { key: "employeeId", label: "Employee ID" },
        { key: "employee", label: "Employee" },
        { key: "regHours", label: "Regular Hrs" },
        { key: "otHours", label: "OT Hrs" },
        { key: "totalHours", label: "Total Hrs" },
      ];
    case "dept":
      return [
        { key: "period", label: "Period" },
        { key: "department", label: "Department" },
        { key: "headcount", label: "Headcount" },
        { key: "grossWages", label: "Gross Wages", format: fmtCurrency },
        { key: "employerTaxes", label: "Er Taxes", format: fmtCurrency },
        { key: "benefitsCost", label: "Benefits", format: fmtCurrency },
        { key: "totalLaborCost", label: "Total Labor", format: fmtCurrency },
      ];
    case "job-history":
      return [
        { key: "employeeId", label: "Employee ID" },
        { key: "employee", label: "Employee" },
        { key: "jobTitle", label: "Job Title" },
        { key: "department", label: "Department" },
        { key: "effectiveStart", label: "Start", format: fmtDate },
        { key: "effectiveEnd", label: "End", format: fmtDate },
        { key: "status", label: "Status" },
      ];
    case "position-history":
      return [
        { key: "positionId", label: "Position ID" },
        { key: "positionTitle", label: "Position" },
        { key: "department", label: "Department" },
        { key: "incumbent", label: "Incumbent" },
        { key: "effectiveStart", label: "Start", format: fmtDate },
        { key: "effectiveEnd", label: "End", format: fmtDate },
        { key: "status", label: "Status" },
      ];
    case "pay":
    default:
      return [
        { key: "checkNumber", label: "Check #" },
        { key: "checkDate", label: "Check Date", format: fmtDate },
        { key: "employeeId", label: "Employee ID" },
        { key: "employee", label: "Employee" },
        { key: "netPay", label: "Net Pay", format: fmtCurrency },
      ];
  }
}

function toCSV(rows: any[], cols: Column[]) {
  const header = cols.map((c) => c.label);
  const lines = rows.map((r) =>
    cols
      .map((c) => {
        const raw = r[c.key];
        const val = c.format ? c.format(raw) : raw ?? "";
        const s = String(val);
        // Simple CSV escaping
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      })
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export default function PreviewModal({ open, report, onClose }: Props) {
  const [mode, setMode] = React.useState<"table" | "facsimile">("table");
  const [selectedRow, setSelectedRow] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (!open) {
      setMode("table");
      setSelectedRow(null);
    }
  }, [open]);

  if (!open || !report) return null;

  const kind = inferReportKind(report);
  const cols = columnsForKind(kind);
  const rows = getMockRows(report.id);

  const showFacsimile =
    kind === "pay" || kind === "w2" || kind === "timecard";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-6xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold">{report.title}</h3>
            <p className="text-xs text-gray-500">
              Preview · {rows.length.toLocaleString()} rows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => {
                const csv = toCSV(rows, cols);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                // fallbacks: use report.id in filename
                a.download = `${(report.slug || report.id || "report")}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export CSV
            </button>
            <button
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-auto p-4">
          {mode === "table" && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    {cols.map((c) => (
                      <th key={c.key} className="border-b px-3 py-2">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr
                      key={idx}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        if (showFacsimile) {
                          setSelectedRow(r);
                          setMode("facsimile");
                        }
                      }}
                    >
                      {cols.map((c) => {
                        const raw = r[c.key];
                        const val = c.format ? c.format(raw) : raw ?? "";
                        return (
                          <td key={c.key} className="border-b px-3 py-2">
                            {String(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!showFacsimile && (
                <p className="mt-3 text-xs text-gray-500">
                  (Row click facsimile is not applicable for this report.)
                </p>
              )}
            </div>
          )}

          {mode === "facsimile" && selectedRow && (
            <div className="space-y-3">
              <button
                className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                onClick={() => setMode("table")}
              >
                ← Back to list
              </button>

              {/* Render the right facsimile component */}
              {kind === "pay" && <PayStatement data={selectedRow} />}
              {kind === "w2" && <W2Form data={selectedRow} />}
              {kind === "timecard" && <TimecardForm data={selectedRow} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
