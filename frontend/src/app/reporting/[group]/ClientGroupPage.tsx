"use client";

import React, { useMemo, useState } from "react";
import type { GroupKey, ReportType } from "../_data";
import { getReportsByGroup, GROUP_LABELS } from "../_data";
import { ReportTable } from "../_components/ReportTable";
import { PreviewModal } from "../_components/PreviewModal";

export default function ClientGroupPage({ group }: { group: GroupKey }) {
  const items = getReportsByGroup(group);
  const [selected, setSelected] = useState<ReportType | null>(null);

  const title = useMemo(
    () => (group === "all" ? "All Reports" : GROUP_LABELS[group as keyof typeof GROUP_LABELS]),
    [group]
  );

  function exportExcel(r: ReportType) {
    const url = new URL(`/api/reports/${r.id}/export`, window.location.origin);
    window.location.href = url.toString();
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <section className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">Reports filtered by {group}.</p>
      </section>

      <ReportTable
        items={items}
        onPreview={(r) => setSelected(r)}
        onExport={exportExcel}
      />

      <PreviewModal
        report={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onExport={(r, _demo, _filters) => exportExcel(r)}
      />
    </div>
  );
}
