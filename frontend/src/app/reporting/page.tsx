"use client";

import React, { useState } from "react";
import { getReportsByGroup, type ReportType } from "./_data";
import { ReportTable } from "./_components/ReportTable";
import { PreviewModal } from "./_components/PreviewModal";

export default function AllReportsPage() {
  const [selected, setSelected] = useState<ReportType | null>(null);
  const reports = getReportsByGroup("all");

  function exportExcel(r: ReportType) {
    const url = new URL(`/api/reports/${r.id}/export`, window.location.origin);
    window.location.href = url.toString();
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <section className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">All Reports</h2>
        <p className="text-sm text-gray-600">Search, filter, preview, and export any report.</p>
      </section>

      <ReportTable
        items={reports}
        onPreview={(r) => setSelected(r)}
        onExport={exportExcel}
      />

      <PreviewModal
        report={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onExport={(r) => exportExcel(r)}
      />
    </div>
  );
}
