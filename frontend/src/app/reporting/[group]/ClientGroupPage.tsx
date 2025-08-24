"use client";

import React, { useState } from "react";
import type { GroupKey, ReportType } from "../_data";
import { getReportsByGroup, GROUP_LABELS } from "../_data";
import { ReportTable } from "../_components/ReportTable";
import { X, BarChart3 } from "lucide-react";

export default function ClientGroupPage({ group }: { group: GroupKey }) {
  const items = getReportsByGroup(group);
  const [selected, setSelected] = useState<ReportType | null>(null);

  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          {group === "all"
            ? "All Reports"
            : `${GROUP_LABELS[group as keyof typeof GROUP_LABELS] ?? "Reports"}`}
        </h2>
        <p className="text-sm text-gray-600">Reports filtered by {group}.</p>
      </section>

      <ReportTable items={items} onSelect={(r) => setSelected(r)} />

      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-lg transform border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          selected ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!selected}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">
              {selected?.title ?? "Configure Report"}
            </h3>
          </div>
          <button
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="text-sm text-gray-700">Date range</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <input type="date" className="rounded-lg border border-gray-300 p-2" />
              <input type="date" className="rounded-lg border border-gray-300 p-2" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-700">Filters</label>
            <input className="mt-1 w-full rounded-lg border border-gray-300 p-2" placeholder="Search or add filters…" />
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
            Estimated records: <span className="font-medium">{selected?.estimatedRecords.toLocaleString() ?? 0}</span>
          </div>
          <button
            className="w-full rounded-xl bg-gray-900 px-4 py-2 font-medium text-white hover:bg-black"
            onClick={() => alert(`Export queued (stub): ${selected?.id}`)}
          >
            Export to Excel
          </button>
        </div>
      </div>
    </div>
  );
}
