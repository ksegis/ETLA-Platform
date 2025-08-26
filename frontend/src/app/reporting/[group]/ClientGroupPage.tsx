// frontend/src/app/reporting/[group]/ClientGroupPage.tsx
"use client";

import * as React from "react";
import {
  GROUP_LABELS,
  getReportsByGroup,
  type GroupKey,
  type Report,
} from "../_data";
import ReportTable from "../_components/ReportTable";
import PreviewModal from "../_components/PreviewModal";

type Props = { params: { group: string } };

const GROUPS: GroupKey[] = ["employee", "checks", "timecards", "jobs", "salary"];
const isGroupKey = (v: string): v is GroupKey => GROUPS.includes(v as GroupKey);

export default function ClientGroupPage({ params }: Props) {
  const raw = params?.group ?? "employee";
  const group: GroupKey = isGroupKey(raw) ? (raw as GroupKey) : "employee";

  const label = GROUP_LABELS[group];
  const items: Report[] = getReportsByGroup(group);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Report | null>(null);

  const handlePreview = (r: Report) => {
    setSelected(r);
    setOpen(true);
  };

  const handleExport = (r: Report) => {
    // keep simple for now; server route handles CSV
    window.location.href = `/api/reports/${r.id}/export`;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{label} Reports</h1>
        <a
          href="/reporting"
          className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50"
        >
          ← Back
        </a>
      </div>

      <ReportTable items={items} onPreview={handlePreview} onExport={handleExport} />

      {open && (
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
