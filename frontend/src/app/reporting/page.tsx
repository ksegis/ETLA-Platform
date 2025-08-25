"use client";

import * as React from "react";
import ReportTable from "./_components/ReportTable";     // default import ✅
import PreviewModal from "./_components/PreviewModal";   // default import ✅
import { getReportsByGroup, GROUP_LABELS } from "./_data";

export default function AllReportsPage() {
  // combine every group's reports
  const allItems = React.useMemo(
    () =>
      Object.keys(GROUP_LABELS).flatMap((g) => getReportsByGroup(g)),
    []
  );

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
        <h1 className="text-lg font-semibold text-gray-900">All Reports</h1>
        <p className="text-sm text-gray-600">
          Click a report title to preview, toggle to charts inside the modal, or export directly.
        </p>
      </div>

      <ReportTable items={allItems} onPreview={handlePreview} onExport={handleExport} />

      {open && (
        <PreviewModal
          open={open}
          report={selected}
          onClose={() => setOpen(false)}
          onRowClick={() => { /* optional detail drill-down */ }}
        />
      )}
    </div>
  );
}
