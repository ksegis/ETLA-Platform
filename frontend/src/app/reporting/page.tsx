"use client";

import React, { useState } from "react";
import { getReportsByGroup, type ReportType } from "./_data";
import { ReportTable } from "./_components/ReportTable";
import { X, BarChart3, FileText } from "lucide-react";

function DocumentPreview({ report }: { report: ReportType }) {
  const sample = [
    { id: "doc-001", name: "Document 001.pdf", size: "221 KB" },
    { id: "doc-002", name: "Document 002.pdf", size: "198 KB" },
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
        {report.title} returns document metadata and download URLs ({report.docMime?.toUpperCase()}).
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[70%]" />
            <col className="w-[30%]" />
          </colgroup>
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">File</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {sample.map((d) => (
            <tr key={d.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">{d.name}</div>
                    <div className="text-xs text-gray-500">{d.size}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  className="mr-2 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                  onClick={() => alert(`Preview (stub): ${d.name}`)}
                >
                  Preview
                </button>
                <button
                  className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                  onClick={() => alert(`Download (stub): ${d.name}`)}
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AllReportsPage() {
  const [selected, setSelected] = useState<ReportType | null>(null);
  const reports = getReportsByGroup("all");

  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">All Reports</h2>
        <p className="text-sm text-gray-600">Search, sort, and run any report.</p>
      </section>

      <ReportTable items={reports} onSelect={(r) => setSelected(r)} />

      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-lg transform border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          selected ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!selected}
        role="dialog"
        aria-label="Report configuration"
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
          {selected?.docBased ? (
            <DocumentPreview report={selected} />
          ) : (
            <>
              <div>
                <label className="text-sm text-gray-700">Date range</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input type="date" className="rounded-lg border border-gray-300 p-2" />
                  <input type="date" className="rounded-lg border border-gray-300 p-2" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Filters</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                  placeholder="Search or add filters…"
                />
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                Estimated records:{" "}
                <span className="font-medium">
                  {selected?.estimatedRecords.toLocaleString() ?? 0}
                </span>
              </div>
              <button
                type="button"
                className="w-full rounded-xl bg-gray-900 px-4 py-2 font-medium text-white hover:bg-black"
                onClick={() => alert(`Export queued (stub): ${selected?.id}`)}
              >
                Export to Excel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
