"use client";

import React from "react";
import { FileText, Eye, Download } from "lucide-react";
import type { Report } from "../_data";

type Props = {
  items: Report[];
  onPreview: (report: Report) => void;
  onExport: (report: Report) => void;
};

export default function ReportTable({ items, onPreview, onExport }: Props) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Report</th>
            <th className="px-3 py-2 text-left font-medium">Kind</th>
            <th className="px-3 py-2 text-left font-medium">Fields</th>
            <th className="px-3 py-2 text-left font-medium w-40">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  {/* Clickable hyperlink, but intercept to open Preview */}
                  <a
                    href={`/reporting/${r.group ?? "all"}?r=${encodeURIComponent(r.id)}`}
                    className="text-indigo-600 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      onPreview(r);
                    }}
                  >
                    {r.title}
                  </a>
                </div>
                {r.description && (
                  <div className="mt-1 text-xs text-gray-500">{r.description}</div>
                )}
              </td>

              {/* No more r.category — show kind instead (pay, w2, timecard, demographics, etc.) */}
              <td className="px-3 py-2 text-gray-700">
                {r.kind ?? "-"}
              </td>

              <td className="px-3 py-2 text-gray-700">
                {renderFields(r.fields)}
              </td>

              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreview(r)}
                    className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                  <button
                    onClick={() => onExport(r)}
                    className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-sm text-gray-500">
                No reports.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Render fields whether they’re:
 *  - string[]
 *  - Array<{ name?: string; label?: string }>
 *  - a single string/number
 */
function renderFields(fields: unknown): string {
  if (Array.isArray(fields)) {
    const parts = (fields as any[]).map((f) => {
      if (typeof f === "string") return f;
      if (f && typeof f === "object") {
        return (f as any).label || (f as any).name || "";
      }
      return "";
    });
    return parts.filter(Boolean).slice(0, 8).join(", ");
  }
  if (typeof fields === "string" || typeof fields === "number") {
    return String(fields);
  }
  return "-";
}
