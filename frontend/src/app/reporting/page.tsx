"use client";

import React, { useMemo, useState } from "react";
import { REPORTS, type ReportType } from "./_data";
import { ReportTable } from "./_components/ReportTable";
import { PreviewModal } from "./_components/PreviewModal";

export default function AllReportsPage() {
  const [selected, setSelected] = useState<ReportType | null>(null);
  const items = useMemo(() => REPORTS.slice(), []);

  function exportExcel(r: ReportType) {
    // Raw export (no modal filters). Use the modal for filtered exports.
    const url = new URL(`/api/reports/${r.id}/export`, window.location.origin);
    window.open(url.toString(), "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">All Reports</h2>
      </div>

      <ReportTable
        reports={items}
        onPreview={(r) => setSelected(r)}
        onExport={exportExcel}
      />

      <PreviewModal
        report={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
