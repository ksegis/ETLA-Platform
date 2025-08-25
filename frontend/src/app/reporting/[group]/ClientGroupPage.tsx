"use client";

import * as React from "react";
import ReportTable from "../_components/ReportTable";      // default import ✅
import PreviewModal from "../_components/PreviewModal";    // default import ✅
import { getReportsByGroup, GROUP_LABELS } from "../_data";

type Props = {
  params: { group: string };
};

export default function ClientGroupPage({ params }: Props) {
  const group = params.group as string;
  const label = GROUP_LABELS[group] ?? "Reports";
  const items = getReportsByGroup(group);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<any | null>(null);

  const handlePreview = (r: any) => {
    setSelected(r);
    setOpen(true);
  };

  const handleExport = (r: any) => {
    // If you have an API route for export, keep this; otherwise this is harmless.
    try {
      window.open(`/api/reports/${r.id}/export`, "_blank");
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{label}</h1>
        <p className="text-sm text-gray-600">Click a report title to preview, or export directly.</p>
      </div>

      <ReportTable items={items} onPreview={handlePreview} onExport={handleExport} />

      {open && (
        <PreviewModal
          open={open}
          report={selected}
          onClose={() => setOpen(false)}
          onRowClick={() => { /* keep for drill-downs (e.g., paystub) */ }}
        />
      )}
    </div>
  );
}
