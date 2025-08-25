"use client";

import * as React from "react";
import ReportTable, { ReportType } from "../_components/ReportTable";
import PreviewModal from "../_components/PreviewModal";
import { getReportsByGroup, GROUP_LABELS, type GroupKey } from "../_data";

type Props = { params: { group: GroupKey } };

export default function ClientGroupPage({ params }: Props) {
  const group = params.group;
  const label = GROUP_LABELS[group] ?? "Reports";
  const items = getReportsByGroup(group);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  const handlePreview = (r: ReportType) => {
    setSelected(r);
    setOpen(true);
  };

  const handleExport = (r: ReportType) => {
    // Let the modal handle Excel export once opened; or wire server route here if needed.
    setSelected(r);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
          <p className="mt-0.5 text-sm text-gray-600">Click a report title to preview.</p>
        </div>
      </div>

      <ReportTable items={items} onPreview={handlePreview} onExport={handleExport} />

      {selected && (
        <PreviewModal
          open={open}
          report={selected}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
