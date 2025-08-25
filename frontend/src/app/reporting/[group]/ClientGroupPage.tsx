"use client";

import * as React from "react";
import ReportTable from "../_components/ReportTable";
import PreviewModal from "../_components/PreviewModal";
import { getReportsByGroup, GROUP_LABELS, type GroupKey, type ReportType } from "../_data";

type Props = { params: { group: GroupKey | string } };

export default function ClientGroupPage({ params }: Props) {
  const gRaw = params.group;

  const hasKey = (k: string): k is GroupKey =>
    ["employee", "checks", "jobs", "salary", "timecards"].includes(k as GroupKey);

  const safeKey: GroupKey = hasKey(gRaw) ? (gRaw as GroupKey) : "employee";
  const label = GROUP_LABELS[safeKey];
  const items: ReportType[] = getReportsByGroup(safeKey);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
          <p className="mt-0.5 text-sm text-gray-600">Click a report title to preview.</p>
        </div>
      </div>

      <ReportTable
        items={items}
        onPreview={(r) => { setSelected(r); setOpen(true); }}
        onExport={(r) => { setSelected(r); setOpen(true); }}
      />

      {selected && (
        <PreviewModal open={open} report={selected} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
