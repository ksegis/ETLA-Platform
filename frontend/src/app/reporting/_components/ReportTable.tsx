// frontend/src/app/reporting/_components/ReportTable.tsx
"use client";

import React from "react";
import { FileText, Eye, Download } from "lucide-react";
import type { ReportType } from "../_data";

type Props = {
  items: ReportType[];
  onPreview: (r: ReportType) => void;
  onExport?: (r: ReportType) => void;
};

export default function ReportTable({ items, onPreview, onExport }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
            <th className="sticky left-0 z-10 w-6 bg-gray-50 px-3 py-3"><span className="sr-only">Type</span></th>
            <th className="sticky left-6 z-10 bg-gray-50 px-3 py-3">Report</th>
            <th className="px-3 py-3">Category</th>
            <th className="px-3 py-3">Fields</th>
            <th className="px-3 py-3 w-24">Rows</th>
            <th className="px-3 py-3 w-36">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, idx) => (
            <tr
              key={r.id}
              className={idx % 2 ? "bg-white" : "bg-gray-50/40"}
            >
              <td className="sticky left-0 z-10 bg-inherit px-3 py-2">
                <FileText className="h-4 w-4 text-gray-500" />
              </td>
              <td className="sticky left-6 z-10 bg-inherit px-3 py-2">
                <button
                  onClick={() => onPreview(r)}
                  className="text-left text-sm font-medium text-indigo-600 hover:underline"
                >
                  {r.title}
                </button>
                {r.description && (
                  <div className="text-xs text-gray-500">{r.description}</div>
                )}
              </td>
              <td className="px-3 py-2 text-sm text-gray-700">{r.category ?? "-"}</td>
              <td className="px-3 py-2 text-sm text-gray-700">{r.fields ?? "-"}</td>
              <td className="px-3 py-2 text-sm text-gray-700">{r.approxRows ?? "—"}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                    onClick={() => onPreview(r)}
                    aria-label="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  {onExport && (
                    <button
                      className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                      onClick={() => onExport(r)}
                      aria-label="Export"
                    >
                      <Download className="h-3.5 w-3.5" /> Export
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
