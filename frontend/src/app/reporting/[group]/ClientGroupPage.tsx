// frontend/src/app/reporting/[group]/ClientGroupPage.tsx
"use client";

import * as React from "react";
import {
  getReportsByGroup,
  GROUP_LABELS,
  type GroupKey,
  type ReportType,
} from "../_data";
import ReportTable from "../_components/ReportTable";
import PreviewModal from "../_components/PreviewModal";

type Props = { params: { group?: string } };

// Narrow "GroupKey" to exclude "all" for labeling/UI
type RealGroup = Exclude<GroupKey, "all">;
const VALID_GROUPS: RealGroup[] = ["employee", "checks", "jobs", "salary", "timecards"];

export default function ClientGroupPage({ params }: Props) {
  const raw = params?.group ?? "employee";
  const group: RealGroup = (VALID_GROUPS.includes(raw as RealGroup)
    ? (raw as RealGroup)
    : "employee");

  // Safe key for GROUP_LABELS (does not include "all")
  const label = GROUP_LABELS[group];
  const items: ReportType[] = getReportsByGroup(group);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  const onPreview = (r: ReportType) => {
    setSelected(r);
    setOpen(true);
  };

  const onExport = (r: ReportType) => {
    // simple client-side download via our CSV route
    window.location.href = `/api/reports/${r.id}/export`;
  };

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">{label}</div>

      <ReportTable items={items} onPreview={onPreview} onExport={onExport} />

      {open && selected && (
        <PreviewModal
          open={open}
          report={selected}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
