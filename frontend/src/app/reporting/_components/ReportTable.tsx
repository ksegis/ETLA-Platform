"use client";

import React from "react";
import { Eye, Download, FileText } from "lucide-react";
import type { Report } from "../_data"; // <-- use the SAME Report type as _data.ts

type Props = {
  items: Report[];
  onPreview: (r: Report) => void;
  onExport?: (r: Report) => void;
};

export default function ReportTable({ items, onPreview, onExport }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600">
            <th className="px-3 py-2 text-left font-medium">Report</th>
            <th className="px-3 py-2 text-left font-medium">Category</th>
            <th className="px-3 py-2 text-left font-medium">Fields</th>
            <th className="px-3 py-2 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">
                {/* Title as a link-like button */}
                <button
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                  onClick={() => onPreview(r)}
                  title="Preview"
                >
                  {r.title}
                </button>
                {r.description && (
                  <div className="mt-0.5 text-xs text-gray-500">{r.description}</div>
                )}
              </td>

              <td className="px-3 py-2 text-gray-700">{r.category ?? "-"}</td>

              <td className="px-3 py-2 text-gray-700">
                {renderFields(r.fields)}
              </td>

              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1 rounded border px-2 py-1 hover:bg-gray-50"
                    onClick={() => onPreview(r)}
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>

                  <button
                    className="inline-flex items-center gap-1 rounded border px-2 py-1 hover:bg-gray-50"
                    onClick={() => (onExport ? onExport(r) : onPreview(r))}
                    title="Export CSV"
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </button>

                  <span className="inline-flex items-center gap-1 rounded border px-2 py-1 text-gray-500">
                    <FileText className="h-4 w-4" />
                    {(r.kind ?? "").toString().toUpperCase() || "GEN"}
                  </span>
                </div>
              </td>
            </tr>
          ))}

          {!items.length && (
            <tr>
              <td className="px-3 py-8 text-center text-gray-500" colSpan={4}>
                No reports found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Normalize fields which can be string[] OR ({name|label}|string)[] */
function renderFields(
  fields?: Array<string | { name?: string; label?: string }>
) {
  if (!Array.isArray(fields) || fields.length === 0) return "-";
  const labels = fields
    .map((f) => (typeof f === "string" ? f : f.label ?? f.name ?? ""))
    .filter(Boolean);
  return labels.length ? labels.join(", ") : "-";
}
