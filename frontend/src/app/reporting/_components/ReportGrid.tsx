'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Type kept light to avoid coupling to table internals.
export type Col = { key: string; label: string };

export type ReportDef = {
  id: string;                // e.g. "checks/pay-statements"
  title: string;             // Card title
  description?: string;      // Card subtitle
  columns: Col[];            // Columns for the table modal
  hasFacsimile?: boolean;    // Show "Display" button per row
};

type Props = {
  reports: ReportDef[];
  customerId: string;        // Tenant/customer to filter results
  groupTitle?: string;       // Optional section title shown above grid
};

// We load the modal lazily and keep it typed as "any" to avoid TS friction
// with whatever props your existing ReportModal currently exports.
const ReportModal = dynamic<any>(
  () => import('@/features/reports/ReportModal').then((m) => m.default),
  { ssr: false }
);

export default function ReportGrid({ reports, customerId, groupTitle }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const activeReport = useMemo(
    () => reports.find((r) => r.id === openId) ?? null,
    [openId, reports]
  );

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="w-full">
      {groupTitle && (
        <h2 className="text-lg font-semibold mb-3">{groupTitle}</h2>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setOpenId(r.id)}
            className="text-left rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition p-4 bg-white"
          >
            <div className="font-medium">{r.title}</div>
            {r.description && (
              <div className="text-sm text-gray-500 mt-1">{r.description}</div>
            )}
            <div className="text-xs text-gray-400 mt-3">
              {r.columns.map((c) => c.label).join(', ')}
            </div>
          </button>
        ))}
      </div>

      {/* Full-width modal with the selected report */}
      {activeReport && (
        <ReportModal
          open={true}
          onClose={() => setOpenId(null)}
          report={activeReport}
          customerId={customerId}
          // If your ReportModal supports it, it will pass filters + pagination
          // down to your API. If not, the prop is ignored harmlessly.
          initialFilters={{ customerId }}
        />
      )}
    </div>
  );
}
