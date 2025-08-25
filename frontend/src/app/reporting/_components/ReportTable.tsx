"use client";

import * as React from "react";
import { Eye, Download } from "lucide-react";

export type ReportType = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  approxRows?: number;
  fields?: number;
};

type Props = {
  items: ReportType[];
  onPreview: (r: ReportType) => void;
  onExport: (r: ReportType) => void;
};

export default function ReportTable({ items, onPreview, onExport }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            <th className="sticky top-0 z-10 border-b bg-white px-3 py-2 font-medium text-gray-700">
              Report
            </th>
            <th className="sticky top-0 z-10 border-b bg-white px-3 py-2 font-medium text-gray-700">
              Category
            </th>
            <th className="sticky top-0 z-10 border-b bg-white px-3 py-2 font-medium text-gray-700">
              Fields
            </th>
            <th className="sticky top-0 z-10 border-b bg-white px-3 py-2 font-medium text-gray-700">
              ~ Rows
            </th>
            <th className="sticky top-0 z-10 border-b bg-white px-3 py-2 font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="odd:bg-white even:bg-gray-50">
              <td className="px-3 py-2">
                <button
                  onClick={() => onPreview(r)}
                  className="max-w-[560px] truncate text-indigo-600 hover:underline"
                  title="Preview"
                >
                  {r.title}
                </button>
                {r.description ? (
                  <div className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                    {r.description}
                  </div>
                ) : null}
              </td>
              <td className="px-3 py-2 text-gray-700">{r.category ?? "-"}</td>
              <td className="px-3 py-2 text-gray-700">{r.fields ?? "-"}</td>
              <td className="px-3 py-2 text-gray-700">{r.approxRows ?? "-"}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreview(r)}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    title="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => onExport(r)}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    title="Export"
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="px-3 py-8 text-center text-sm text-gray-500" colSpan={5}>
                No reports found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
