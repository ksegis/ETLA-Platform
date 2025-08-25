"use client";

import React from "react";
import { X } from "lucide-react";
import type { ReportType } from "../_data";

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className="text-sm text-gray-900">{value ?? "—"}</div>
    </div>
  );
}

export default function RowDetailModal({
  open,
  report,
  row,
  onClose,
}: {
  open: boolean;
  report: ReportType;
  row: any;
  onClose: () => void;
}) {
  if (!open || !row || !report) return null;

  const id = report.id;

  // Render “best practice” sections per report
  let header = report.title;
  let kpis: Array<{ label: string; value: React.ReactNode }> = [];
  let fields: Array<{ label: string; value: React.ReactNode }> = [];

  if (id === "department_analysis") {
    header = `Department: ${row.Department} — ${row.PeriodLabel}`;
    kpis = [
      { label: "Total Labor Cost", value: (Number(row.TotalLaborCost) || 0).toLocaleString(undefined, { style: "currency", currency: "USD" }) },
      { label: "Regular", value: (Number(row.RegularPay) || 0).toLocaleString(undefined, { style: "currency", currency: "USD" }) },
      { label: "OT", value: (Number(row.OTPay) || 0).toLocaleString(undefined, { style: "currency", currency: "USD" }) },
      { label: "Bonus", value: (Number(row.Bonus) || 0).toLocaleString(undefined, { style: "currency", currency: "USD" }) },
      { label: "Burden", value: (Number(row.Burden) || 0).toLocaleString(undefined, { style: "currency", currency: "USD" }) },
      { label: "Headcount", value: row.Headcount },
      { label: "FTE", value: row.FTE },
      { label: "Avg Comp / FTE", value: (Number(row.AvgCompPerFTE) || 0).toLocaleString(undefined, { style: "currency", currency: "USD" }) },
    ];
    fields = [
      { label: "Cost Center", value: row.CostCenter },
      { label: "Location", value: row.Location },
      { label: "Pay Group", value: row.PayGroup },
      { label: "Period Start", value: row.PeriodStart },
    ];
  } else if (id === "job_history") {
    header = `${row.EmployeeName} — ${row.JobTitle}`;
    kpis = [
      { label: "Action", value: row.Action },
      { label: "Reason", value: row.ReasonCode },
      { label: "Effective Date", value: row.EffectiveDate },
      { label: "Pay Rate", value: row.PayType === "Hourly" ? `$${Number(row.PayRate).toFixed(2)}/hr` : `$${Number(row.PayRate).toFixed(2)}` },
      { label: "Pay Type", value: row.PayType },
      { label: "Pay Grade", value: row.PayGrade },
    ];
    fields = [
      { label: "Employee ID", value: row.EmployeeID },
      { label: "Department", value: row.Department },
      { label: "Supervisor", value: row.Supervisor },
      { label: "Location", value: row.Location },
      { label: "FLSA", value: row.FLSA },
      { label: "Job Code", value: row.JobCode },
      { label: "Memo", value: row.Memo },
    ];
  } else if (id === "position_history") {
    header = `${row.PositionID} — ${row.PositionTitle}`;
    kpis = [
      { label: "Status", value: row.Status },
      { label: "FTE", value: row.FTE },
      { label: "Std Hours", value: row.StandardHours },
      { label: "Effective Start", value: row.EffectiveStart },
      { label: "Effective End", value: row.EffectiveEnd ?? "—" },
    ];
    fields = [
      { label: "Department", value: row.Department },
      { label: "Supervisor", value: row.Supervisor },
      { label: "Pay Grade", value: row.PayGrade },
      { label: "Cost Center", value: row.CostCenter },
      { label: "Location", value: row.Location },
      { label: "Reason", value: row.ReasonCode },
      { label: "Filled By", value: row.FilledBy ?? "Unfilled" },
    ];
  } else {
    // Fallback: generic key-value dump
    header = report.title;
    fields = Object.keys(row).map((k) => ({ label: k, value: String(row[k]) }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 sm:p-6">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900">{header}</h3>
          <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {kpis.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-xl border border-gray-200 p-3">
                  <div className="text-[11px] uppercase text-gray-500">{k.label}</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{k.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {fields.map((f) => (
              <KV key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
