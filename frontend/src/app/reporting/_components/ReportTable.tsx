"use client";

import * as React from "react";
import { GROUP_LABELS, ReportType } from "../_data";

type Props = {
  items: ReportType[];
  onPreview: (r: ReportType) => void;
  onExport?: (r: ReportType) => void;
};

export default function ReportTable({ items, onPreview, onExport }: Props) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="px-3 py-2 font-medium">Report</th>
            <th className="px-3 py-2 font-medium">Category</th>
            <th className="px-3 py-2 font-medium">Fields</th>
            <th className="px-3 py-2 font-medium">~ Rows</th>
            <th className="px-3 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onPreview(r)}
                  className="text-indigo-600 hover:underline"
                >
                  {r.title}
                </button>
                <div className="text-xs text-gray-500">{r.description}</div>
              </td>
              <td className="px-3 py-2 text-gray-700">
                {GROUP_LABELS[r.group]}
              </td>
              <td className="px-3 py-2 text-gray-700">{r.fields ?? "-"}</td>
              <td className="px-3 py-2 text-gray-700">{r.approxRows ?? "-"}</td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onPreview(r)}
                    className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                  >
                    Preview
                  </button>
                  {onExport && (
                    <button
                      type="button"
                      onClick={() => onExport(r)}
                      className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                    >
                      Export
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                No reports
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
