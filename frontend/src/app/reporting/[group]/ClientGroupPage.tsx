"use client";

import * as React from "react";
import { ReportTable } from "../_components/ReportTable"; // ✅ named import
import PreviewModal from "../_components/PreviewModal";    // ✅ default import
import { getReportsByGroup, GROUP_LABELS } from "../_data";

type Props = {
  params: { group: string };
};

export default function ClientGroupPage({ params }: Props) {
  const group = params.group as string;

  // GROUP_LABELS is_ a typed Record<...>; index with a safe key
  const label =
    GROUP_LABELS[group as keyof typeof GROUP_LABELS] ?? "Reports";

  // If getReportsByGroup is typed to a union, cast the param to that key type
  const items = getReportsByGroup(group as keyof typeof GROUP_LABELS);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<any | null>(null);

  const handlePreview = (r: any) => {
    setSelected(r);
    setOpen(true);
  };

  const handleExport = (r: any) => {
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
        <p className="text-sm text-gray-600">
          Click a report title to preview, or export directly.
        </p>
      </div>

      <ReportTable items={items} onPreview={handlePreview} onExport={handleExport} />

      {open && (
        <PreviewModal
          open={open}
          report={selected}
          onClose={() => setOpen(false)}
          onRowClick={() => { /* keep for drill-downs */ }}
        />
      )}
    </div>
  );
}
