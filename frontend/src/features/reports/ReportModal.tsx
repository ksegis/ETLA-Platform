'use client';

import { useEffect } from 'react';
import GenericReportTable from '@/features/reports/GenericReportTable';

export type Col = { key: string; label: string };
export type ReportDef = {
  id: string;
  title: string;
  columns: Col[];
  hasFacsimile?: boolean;
};

type PropsShapeA = {
  open: boolean;
  onClose: () => void;
  customerId: string;
  report: ReportDef;
  initialFilters?: Record<string, any>;
};

type PropsShapeB = {
  open: boolean;
  onClose: () => void;
  customerId: string;
  title: string;
  reportId: string;
  columns: Col[];
  hasFacsimile?: boolean;
  initialFilters?: Record<string, any>;
};

// allow either shape; ignore unknown props safely
type Props = PropsShapeA | PropsShapeB;

export default function ReportModal(props: Props) {
  if (!props.open) return null;

  // normalize into a single report object + filters
  const report: ReportDef =
    'report' in props
      ? props.report
      : {
          id: props.reportId,
          title: props.title,
          columns: props.columns,
          hasFacsimile: props.hasFacsimile,
        };

  const customerId = props.customerId;
  const filters = (props as any).initialFilters ?? { customerId };

  // trap ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && props.onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-[98vw] h-[92vh] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-base sm:text-lg font-semibold">{report.title}</h3>
          <button
            type="button"
            onClick={props.onClose}
            className="px-2 py-1 text-sm rounded hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* body: full-bleed, scrollable */}
        <div className="w-full h-[calc(92vh-56px)] overflow-auto p-3">
          <GenericReportTable
            title={report.title}
            reportId={report.id}
            customerId={customerId}
            columns={report.columns}
            keyField={report.columns[0]?.key ?? 'id'}
            pageSize={25}
            filters={filters}
            hasFacsimile={!!report.hasFacsimile}
          />
        </div>
      </div>
    </div>
  );
}
