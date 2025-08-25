"use client";

import * as React from "react";
import ReportTable from "./_components/ReportTable";
import PreviewModal from "./_components/PreviewModal";
import { getAllReports, type ReportType } from "./_data";

export default function AllReportsPage() {
  const items: ReportType[] = React.useMemo(() => getAllReports(), []);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">All Reports</h1>
        <p className="mt-0.5 text-sm text-gray-600">
          Click any report title to preview. Use Export to CSV for full extracts.
        </p>
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
