
"use client";

import React from "react";
import { FileText, Eye, Download } from "lucide-react";
import type { Report } from "../_data";

type Props = {
  items: Report[];
  onPreview: (r: Report) => void;
  onExport: (r: Report) => void;
};

export default function ReportTable({ items, onPreview, onExport }: Props) {
  if (!items?.length) {
    return (
      <div className="rounded-md border p-6 text-sm text-gray-600">
        No reports found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Report
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Group
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Columns
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((r) => {
            const colCount = Array.isArray((r as any).columns)
              ? (r as any).columns.length
              : undefined;
            return (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {r.title}
                      </div>
                      {r.description ? (
                        <div className="text-xs text-gray-500">
                          {r.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">{r.group}</td>
                <td className="px-3 py-2 text-sm text-gray-700">
                  {colCount ?? "-"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPreview(r)}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => onExport(r)}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
