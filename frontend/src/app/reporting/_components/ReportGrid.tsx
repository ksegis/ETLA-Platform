'use client';

import { useState } from 'react';
import type { Col } from '@/features/reports/GenericReportTable';
import ReportModal from '@/features/reports/ReportModal';

type ReportCard = {
  id: string;
  title: string;
  description?: string;
  columns: Col[];          // structure passed through to GenericReportTable
  hasFacsimile?: boolean;  // shows “Display” button in rows when true
};

type Props = {
  customerId: string;
  reports: ReportCard[];
};

export default function ReportGrid({ customerId, reports }: Props) {
  const [active, setActive] = useState<ReportCard | null>(null);

  // Defensive: if nothing is configured, show a clear message instead of blank space
  if (!reports || reports.length === 0) {
    return (
      <div className="mt-6 rounded-md border border-dashed p-6 text-sm text-gray-600">
        No reports configured for this group.
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActive(r)}
            className="group rounded-lg border bg-white p-4 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {r.title}
              </h3>
            </div>
            {r.description ? (
              <p className="mt-1 text-sm text-gray-600">{r.description}</p>
            ) : null}
            <div className="mt-3 inline-flex items-center text-sm text-indigo-600">
              Preview
              <svg
                className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10 10.293 6.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
                <path d="M3 10a1 1 0 011-1h10a1 1 0 010 2H4a1 1 0 01-1-1z" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <ReportModal
          open
          onClose={() => setActive(null)}
          title={active.title}
          reportId={active.id}
          customerId={customerId}
          columns={active.columns}
          hasFacsimile={!!active.hasFacsimile}
        />
      )}
    </>
  );
}
