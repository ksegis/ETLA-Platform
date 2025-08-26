// frontend/src/app/reporting/page.tsx
"use client";

import * as React from "react";
import ReportTable from "./_components/ReportTable";
import PreviewModal from "./_components/PreviewModal";
import { getAllReports, type ReportType } from "./_data";
import { Download } from "lucide-react";

export default function AllReportsPage() {
  const items = getAllReports();

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  function handlePreview(r: ReportType) {
    setSelected(r);
    setOpen(true);
  }

  async function handleExport(r: ReportType) {
    try {
      const res = await fetch(`/api/reports/${r.id}/export`, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      // filename from title
      const name = (r.title || `report-${r.id}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      a.href = url;
      a.download = `${name}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Export failed. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">All Reports</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Download className="h-4 w-4" />
          Export per report via the row menu
        </div>
      </div>

      <ReportTable items={items} onPreview={handlePreview} onExport={handleExport} />

      {/* Only render the modal when we actually have a selected report */}
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
