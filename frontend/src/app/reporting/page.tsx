"use client";

import * as React from "react";
import { REPORTS, type ReportType } from "./_data";
import ReportTable from "./_components/ReportTable";
import PreviewModal from "./_components/PreviewModal";

export default function ReportingHome() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">All Reports</h1>
      <p className="mt-1 text-sm text-gray-600">
        Click a report title to preview. Export uses whatever rows are on screen.
      </p>

      <ReportTable
        items={REPORTS}
        onPreview={(r) => {
          setSelected(r);
          setOpen(true);
        }}
      />

      <PreviewModal
        open={open}
        report={selected}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
      />
    </div>
  );
}
