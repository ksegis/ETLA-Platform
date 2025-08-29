"use client";

import { useState } from "react";
import ReportModal from "@/features/reports/ReportModal";
import type { Col } from "@/features/reports/GenericReportTable";

type ReportDef = {
  id: string;                 // e.g. "checks/pay-statements"
  title: string;              // card title
  description?: string;       // small blurb on the card
  columns: Col[];             // table columns
  hasFacsimile?: boolean;     // adds Display button per row
  keyField?: string;          // default "id"
  pageSize?: number;          // default 25
};

type Props = {
  customerId: string;
  reports: ReportDef[];
};

export default function ReportGrid({ customerId, reports }: Props) {
  const [active, setActive] = useState<ReportDef | null>(null);

  return (
    <div className="mt-6">
      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActive(r)}
            className="rounded-2xl border p-4 text-left hover:shadow focus:outline-none focus:ring"
          >
            <div className="text-base font-semibold">{r.title}</div>
            {r.description ? (
              <div className="mt-1 text-sm text-gray-600">{r.description}</div>
            ) : null}
          </button>
        ))}
      </div>

      {/* Modal (full width) */}
      {active && (
        <ReportModal
          open
          title={active.title}
          onClose={() => setActive(null)}
          reportId={active.id}
          customerId={customerId}
          columns={active.columns as Col[]}
          hasFacsimile={Boolean(active.hasFacsimile)}
        />
      )}
    </div>
  );
}
