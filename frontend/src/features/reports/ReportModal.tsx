"use client";

import { useMemo, useState } from "react";
import { REPORTS, ReportDef, Col } from "./reportCatalog";
import GenericReportTable from "@/features/reports/GenericReportTable";

type Props = {
  open: boolean;
  onClose: () => void;
  report: ReportDef | null;
  customerId: string;
};

function FilterBar({
  report,
  value,
  onChange,
}: {
  report: ReportDef;
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  return (
    <div className="w-full border-b bg-white sticky top-0 z-10">
      <div className="flex flex-wrap gap-3 p-3">
        {report.filters.map((f) => {
          if (f.type === "search") {
            return (
              <input
                key={f.key}
                type="text"
                className="input input-bordered h-9"
                placeholder={f.placeholder || ""}
                value={value[f.key] ?? ""}
                onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
              />
            );
          }
          if (f.type === "date") {
            return (
              <div key={f.key} className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{f.label}</span>
                <input
                  type="date"
                  className="input input-bordered h-9"
                  value={value[f.key] ?? ""}
                  onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
                />
              </div>
            );
          }
          // select
          return (
            <div key={f.key} className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{f.label}</span>
              <select
                className="select select-bordered h-9"
                value={value[f.key] ?? ""}
                onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
              >
                <option value="">All</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          );
        })}
        <div className="flex-1" />
        <a
          href={`/api/reports/${report.id}/export?${new URLSearchParams(value).toString()}`}
          className="btn btn-sm btn-primary"
          rel="noopener noreferrer"
        >
          Export CSV
        </a>
      </div>
    </div>
  );
}

export default function ReportModal({ open, onClose, report, customerId }: Props) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const table = useMemo(() => {
    if (!report) return null;

    // Always include customer_id; GenericReportTable forwards to /api/reports/[...id]/preview
    const query = { ...filters, customerId };

    return (
      <div className="w-full h-full overflow-auto">
        <FilterBar report={report} value={filters} onChange={setFilters} />
        <div className="p-3">
          <GenericReportTable
            title={report.title}
            reportId={report.id}
            customerId={customerId}
            columns={report.columns as Col[]}
            filters={query}
            // If your GenericReportTable exposes these props already, they’ll be forwarded
            // to your API and handle pagination server-side.
            // Otherwise GenericReportTable can ignore unknown props safely.
            hasFacsimile={!!report.hasFacsimile}
          />
        </div>
      </div>
    );
  }, [report, filters, customerId]);

  if (!open || !report) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 h-12 border-b bg-white">
          <div className="font-medium">{report.title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
        {table}
      </div>
    </div>
  );
}
