// frontend/src/app/reporting/_components/PreviewModal.tsx
"use client";

import React from "react";
import FacsimileModal from "./FacsimileModal";

type Report = {
  id?: string;
  slug?: string;
  title?: string;
  category?: string; // "Checks", "Timecards", ...
  fields?: Array<{ name?: string; label?: string } | string>;
};

export default function PreviewModal({
  open,
  report,
  rows,
  onClose,
  onExport,
}: {
  open: boolean;
  report: Report | null;
  rows: any[];
  onClose: () => void;
  onExport?: () => void;
}) {
  const [filter, setFilter] = React.useState("");
  const [facsimileOpen, setFacsimileOpen] = React.useState(false);
  const [facsimileKind, setFacsimileKind] = React.useState<"paystub" | "timecard" | "w2">("paystub");
  const [facsimileData, setFacsimileData] = React.useState<any>(null);

  if (!open || !report) return null;

  // headers from report.fields or from first row keys
  const headers =
    report?.fields?.length
      ? report.fields.map((f: any) => f?.label ?? f?.name ?? String(f))
      : Object.keys(rows?.[0] ?? {});

  const filteredRows = filter
    ? (rows ?? []).filter((r) =>
        Object.values(r ?? {}).some((v) =>
          String(v ?? "").toLowerCase().includes(filter.toLowerCase())
        )
      )
    : rows ?? [];

  // ---------- facsimile detection & transforms ----------

  function detectFacsimile(report: Report): "paystub" | "timecard" | "w2" | null {
    const cat = (report?.category ?? "").toLowerCase();
    const slugish = (report?.slug ?? report?.id ?? report?.title ?? "").toLowerCase();

    // W-2
    if (slugish.includes("w-2") || slugish.includes("w2")) return "w2";

    // Timecards
    if (cat === "timecards" || slugish.includes("timecard")) return "timecard";

    // Checks (default to paystub unless it's explicitly W-2)
    if (cat === "checks" || slugish.includes("check")) return "paystub";

    return null;
  }

  const kindForThisReport = detectFacsimile(report);

  // Normalize a paystub-ish row into a richer object the form can use.
  function toPaystubData(row: any) {
    const amountSum = (arr?: any[]) => (Array.isArray(arr) ? arr.reduce((s, x) => s + (Number(x?.amount) || 0), 0) : 0);

    const earningsLines = row?.earningsLines ?? row?.earnings_lines ?? [];
    const taxLines = row?.taxLines ?? row?.tax_lines ?? [];
    const deductionLines = row?.deductionLines ?? row?.deduction_lines ?? [];

    const gross = row?.gross ?? row?.earnings ?? amountSum(earningsLines);
    const taxesTotal = row?.taxes ?? amountSum(taxLines);
    const deductionsTotal = row?.deductions ?? amountSum(deductionLines);
    const net = row?.net ?? row?.netPay ?? row?.net_pay ?? (Number(gross) - Number(taxesTotal) - Number(deductionsTotal));

    return {
      // header
      employeeName: row?.employeeName ?? row?.employee ?? row?.name,
      empId: row?.empId ?? row?.employeeId ?? row?.emp_id,
      checkNo: row?.checkNo ?? row?.checkNumber ?? row?.check_id ?? row?.["CHECK #"],
      payDate: row?.payDate ?? row?.pay_date ?? row?.date,
      payPeriod: row?.payPeriod ?? row?.period,
      dept: row?.dept ?? row?.department,
      location: row?.location,
      company: row?.company ?? "Your Company",

      // lines
      earningsLines,
      taxLines,
      deductionLines,

      // totals (safe fallback math)
      gross,
      taxesTotal,
      deductionsTotal,
      net,

      // ytd (optional)
      ytd: row?.ytd ?? {
        gross: row?.ytd_gross,
        taxes: row?.ytd_taxes,
        deductions: row?.ytd_deductions,
        net: row?.ytd_net,
      },
    };
  }

  function openFacsimile(row: any) {
    if (!kindForThisReport) return;

    let data = row;
    let kind = kindForThisReport;

    if (kind === "paystub") data = toPaystubData(row);
    // timecard and w2: pass row as-is; forms are tolerant via props {data|row|record}

    setFacsimileKind(kind);
    setFacsimileData(data);
    setFacsimileOpen(true);
  }

  function cellValue(r: any, header: string) {
    const k = mapHeaderToKey(rows?.[0], header);
    return k ? r?.[k] : r?.[header];
  }

  // ---------- render ----------
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 p-6">
      <div className="relative w-[1200px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* header bar */}
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div className="text-lg font-semibold">
            {report?.title ?? report?.slug ?? "Report"}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter..."
              className="h-9 w-64 rounded-md border px-3 text-sm outline-none focus:ring"
            />
            {onExport && (
              <button
                onClick={onExport}
                className="h-9 rounded-md border px-3 text-sm hover:bg-gray-50"
              >
                Export CSV
              </button>
            )}
            <button
              onClick={onClose}
              className="h-9 rounded-md border px-3 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* data table */}
        <div className="max-h-[70vh] overflow-auto p-2">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b text-gray-600">
                {/* optional "View" column if facsimile is available */}
                {kindForThisReport && <th className="w-16 py-2 pr-3">View</th>}
                {headers.map((h: string, i: number) => (
                  <th key={i} className="py-2 pr-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r: any, idx: number) => (
                <tr
                  key={idx}
                  className={`border-b last:border-0 ${
                    kindForThisReport ? "cursor-pointer hover:bg-gray-50" : ""
                  }`}
                  onClick={() => kindForThisReport && openFacsimile(r)}
                >
                  {kindForThisReport && (
                    <td className="py-2 pr-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                        onClick={() => openFacsimile(r)}
                      >
                        View
                      </button>
                    </td>
                  )}
                  {headers.map((h: string, i: number) => (
                    <td key={i} className="py-2 pr-3">
                      {String(cellValue(r, h) ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
              {!filteredRows.length && (
                <tr>
                  <td className="py-6 text-center text-gray-500" colSpan={(headers.length + (kindForThisReport ? 1 : 0))}>
                    No rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* facsimile viewer */}
      {facsimileOpen && (
        <FacsimileModal
          open={facsimileOpen}
          kind={facsimileKind}
          data={facsimileData}
          title={
            facsimileKind === "paystub"
              ? "Pay Statement"
              : facsimileKind === "timecard"
              ? "Timecard"
              : "W-2"
          }
          onClose={() => setFacsimileOpen(false)}
        />
      )}
    </div>
  );
}

// Fuzzy header->key resolver (handles labels that differ from object keys)
function mapHeaderToKey(sample: any, header: string) {
  if (!sample) return header;
  const keys = Object.keys(sample);
  const lower = header.toLowerCase();
  return (
    keys.find((k) => k.toLowerCase() === lower) ??
    keys.find(
      (k) =>
        k.replace(/[\s_]+/g, "").toLowerCase() ===
        lower.replace(/[\s_]+/g, "")
    ) ??
    header
  );
}
