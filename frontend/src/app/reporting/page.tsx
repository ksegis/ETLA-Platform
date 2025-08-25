import * as React from "react";
import ReportTable, { ReportType } from "./_components/ReportTable";
import PreviewModal from "./_components/PreviewModal";
import { getReportsByGroup } from "./_data";

export default function AllReportsPage() {
  const items: ReportType[] = [
    ...getReportsByGroup("employee"),
    ...getReportsByGroup("checks"),
    ...getReportsByGroup("jobs"),
    ...getReportsByGroup("salary"),
    ...getReportsByGroup("timecards"),
  ];

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">All Reports</h1>
      <ReportTable
        items={items}
        onPreview={(r) => { setSelected(r); setOpen(true); }}
        onExport={(r) => { setSelected(r); setOpen(true); }}
      />
      {selected && (
        <PreviewModal
          open={open}
          report={selected}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
