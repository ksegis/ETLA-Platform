"use client";

import React, { useMemo, useState } from "react";
import type { ReportType } from "../_data";
import { Eye, Download } from "lucide-react";

export function ReportTable({
  items,
  onPreview,
  onExport,
}: {
  items: ReportType[];
  onPreview: (r: ReportType) => void;
  onExport?: (r: ReportType) => void;
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "rows">("title");
  const [asc, setAsc] = useState(true);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = needle
      ? items.filter(
          (r) =>
            r.title.toLowerCase().includes(needle) ||
            r.description.toLowerCase().includes(needle)
        )
      : items.slice();

    base.sort((a, b) => {
      let da: string | number = sortKey === "title" ? a.title : a.estimatedRecords;
      let db: string | number = sortKey === "title" ? b.title : b.estimatedRecords;
      if (typeof da === "string" && typeof db === "string") {
        return asc ? da.localeCompare(db) : db.localeCompare(da);
      }
      return asc ? (Number(da) - Number(db)) : (Number(db) - Number(da));
    });
    return base;
  }, [items, q, sortKey, asc]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reports..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-3 text-sm"
          />
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-600">Sort</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="rounded-md border border-gray-300 px-2 py-1"
          >
            <option value="title">Title</option>
            <option value="rows">~ Rows</option>
          </select>
          <button
            onClick={() => setAsc((p) => !p)}
            className="rounded-md border border-gray-300 px-2 py-1"
          >
            {asc ? "Asc" : "Desc"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Report</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Fields</th>
              <th className="px-4 py-3">~ Rows</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button
                    onClick={() => onPreview(r)}
                    className="text-left font-medium text-gray-900 hover:underline"
                  >
                    {r.title}
                  </button>
                  <div className="text-xs text-gray-500">{r.description}</div>
                </td>
                <td className="px-4 py-3 capitalize">{r.category}</td>
                <td className="px-4 py-3">{r.fields}</td>
                <td className="px-4 py-3">{r.estimatedRecords.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPreview(r)}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    {onExport && (
                      <button
                        onClick={() => onExport(r)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                  No reports match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
