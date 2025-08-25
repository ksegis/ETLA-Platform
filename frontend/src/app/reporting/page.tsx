'use client';

import * as React from 'react';
import ReportTable, { ReportType } from './_components/ReportTable';
import PreviewModal from './_components/PreviewModal';
import { getReportsByGroup, type GroupKey } from './_data';

const GROUPS: GroupKey[] = ['employee', 'checks', 'jobs', 'salary', 'timecards'];

export default function AllReportsPage() {
  // merge every group into a single list
  const items = React.useMemo(
    () => GROUPS.flatMap((g) => getReportsByGroup(g)),
    []
  );

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReportType | null>(null);

  const handlePreview = (r: ReportType) => {
    setSelected(r);
    setOpen(true);
  };

  const handleExport = (r: ReportType) => {
    // keep the same “open modal first” behavior for now
    setSelected(r);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">All Reports</h1>
        <p className="mt-0.5 text-sm text-gray-600">
          Click any report title to preview. Use Export to Excel for full extracts.
        </p>
      </div>

      <ReportTable items={items} onPreview={handlePreview} onExport={handleExport} />

      {selected && (
        <PreviewModal open={open} report={selected} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
