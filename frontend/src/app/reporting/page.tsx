"use client";

import * as React from "react";
import BackNav from "./_components/BackNav";
import ReportTable from "./_components/ReportTable"; // uses your existing table
import PreviewModal from "./_components/PreviewModal"; // existing modal
import { getAllReports, type ReportType } from "./_data";

export default function AllReportsPage() {
  const items: ReportType[] = getAllReports();

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  const handlePreview = (r: ReportType) => {
    setSelected(r);
    setOpen(true);
  };

  const handleExport = (r: ReportType) => {
    // keep the same export route you already have
    window.location.href = `/api/reports/${r.id}/export`;
  };

  return (
    <div className="p-6">
      {/* <- Back button */}
      <BackNav href="/" label="Back to app" />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">All Reports</h1>
      </div>

      <ReportTable items={items} onPreview={handlePreview} onExport={handleExport} />

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
