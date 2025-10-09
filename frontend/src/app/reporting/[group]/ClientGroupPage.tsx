"use client";

import React, { useMemo, useState } from "react";
import type { GroupKey, ReportType } from "../_data";
import { getReportsByGroup, GROUP_LABELS } from "../_data";
import { ReportTable } from "../_components/ReportTable";
import { PreviewModal } from "../_components/PreviewModal";

export default function ClientGroupPage({ group }: { group: GroupKey }) {
  const [selected, setSelected] = useState<ReportType | null>(null);

  const items = useMemo(() => getReportsByGroup(group), [group]);
  const title =
    group !== "all" ? GROUP_LABELS[group as Exclude<GroupKey, "all">] ?? "Reports" : "All Reports";

  function exportExcel(r: ReportType) {
    // Raw export (no modal filters); filtered export is in the Preview modal
    const url = new URL(`/api/reports/${r.id}/export`, window.location.origin);
    window.open(url.toString(), "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
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
