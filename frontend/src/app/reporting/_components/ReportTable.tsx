"use client";
import React from "react";
import { FileText, Eye, Download } from "lucide-react";
import type { ReportType } from "../_data";

type Props = {
  items: ReportType[];
  onPreview: (r: ReportType) => void;
  onExport: (r: ReportType) => void;
};

export default function ReportTable({ items, onPreview, onExport }: Props) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Report</th>
            <th className="px-3 py-2 text-left font-medium">Category</th>
            <th className="px-3 py-2 text-left font-medium">Fields</th>
            <th className="px-3 py-2 text-left font-medium">~ Rows</th>
            <th className="px-3 py-2 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                No reports
              </td>
            </tr>
          )}

          {items.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2">
                {/* Title as hyperlink-styled button that opens preview */}
                <button
                  type="button"
                  onClick={() => onPreview(r)}
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  {r.title}
                </button>
              </td>
              <td className="px-3 py-2 text-gray-700">{r.category}</td>
              <td className="px-3 py-2 text-gray-700">
                {Array.isArray(r.fields) ? r.fields.length : r.fields ?? "-"}
              </td>
              <td className="px-3 py-2 text-gray-700">{r.approxRows ?? "-"}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreview(r)}
                    className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => onExport(r)}
                    className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
                    title="Export CSV"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
