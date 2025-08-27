"use client";

import React from "react";
import { FileText, Eye, Download } from "lucide-react";
import type { Report } from "../_data";

type Props = {
  items: Report[];
  onPreview: (r: Report) => void;
  onExport?: (r: Report) => void;
};

export default function ReportTable({ items, onPreview, onExport }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Report</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Sample Columns</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Rows</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">
                {/* Make title a hyperlink to keep behavior consistent */}
                <a href={`/api/reports/${encodeURIComponent(r.id)}`} className="inline-flex items-center gap-2 text-indigo-600 hover:underline">
                  <FileText className="h-4 w-4" />
                  {r.title}
                </a>
                {r.description && (
                  <div className="text-xs text-gray-500">{r.description}</div>
                )}
              </td>
              <td className="px-3 py-2 text-gray-700">
                {Array.isArray(r.fields)
                  ? r.fields
                      .slice(0, 5)
                      .map((f) => (typeof f === "string" ? f : f.label ?? f.name ?? ""))
                      .filter(Boolean)
                      .join(", ")
                  : "-"}
              </td>
              <td className="px-3 py-2 text-gray-700">{r.approxRows ?? "-"}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreview(r)}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-white"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  {onExport && (
                    <button
                      onClick={() => onExport(r)}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-white"
                      title="Export CSV"
                    >
                      <Download className="h-4 w-4" />
                      CSV
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-gray-500" colSpan={4}>
                No reports in this group.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
