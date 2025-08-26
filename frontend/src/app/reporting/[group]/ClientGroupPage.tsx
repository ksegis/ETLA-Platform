"use client";

import * as React from "react";
import ReportTable from "../_components/ReportTable";
import PreviewModal from "../_components/PreviewModal";
import BackNav from "../_components/BackNav";
import {
  getReportsByGroup,
  GROUP_LABELS,
  type GroupKey,
  type ReportType,
} from "../_data";

type Props = { params: { group: string } };

/** All accepted route keys, including "all" */
const GROUP_KEYS = [
  "employee",
  "checks",
  "jobs",
  "salary",
  "timecards",
  "all",
] as const;

/** Narrow a string to GroupKey safely */
function isGroupKey(v: string): v is GroupKey {
  return (GROUP_KEYS as readonly string[]).includes(v);
}

export default function ClientGroupPage({ params }: Props) {
  const raw = params?.group ?? "employee";
  const key: GroupKey = isGroupKey(raw) ? raw : "employee";

  // Tolerate missing label keys (e.g., if "all" is not in GROUP_LABELS yet)
  const label =
    (GROUP_LABELS as Record<string, string>)[key] ?? "Reports";

  const items: ReportType[] = getReportsByGroup(key);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back to previous page + crumb to All Reports */}
      <BackNav label="All Reports" href="/reporting" />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{label}</h1>
      </div>

      <ReportTable
        items={items}
        onPreview={(r) => {
          setSelected(r);
          setOpen(true);
        }}
        onExport={async (r) => {
          try {
            const res = await fetch(`/api/reports/${r.id}/export`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const name = (r.title || `report-${r.id}`)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            a.href = url;
            a.download = `${name}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          } catch (e) {
            console.error(e);
            alert("Export failed. Please try again.");
          }
        }}
      />

      {open && selected && (
        <PreviewModal
          open={open}
          report={selected}
          onClose={() => {
            setOpen(false);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
