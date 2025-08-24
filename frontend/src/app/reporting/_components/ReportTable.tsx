"use client";

import React, { useMemo, useState } from "react";
import { Download, Search, Star, BarChart3 } from "lucide-react";
import type { ReportType } from "../_data";

export function ReportTable({
  items,
  onSelect,
}: {
  items: ReportType[];
  onSelect: (r: ReportType) => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "fields" | "estimatedRecords">("title");
  const [asc, setAsc] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const a = !q
      ? items
      : items.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        );
    const s = [...a].sort((x, y) => {
      const val =
        sortKey === "title"
          ? x.title.localeCompare(y.title)
          : (x[sortKey] as number) - (y[sortKey] as number);
      return asc ? val : -val;
    });
    return s;
  }, [items, query, sortKey, asc]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports…"
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">Sort</label>
          <select
            className="rounded-lg border border-gray-300 p-2"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
          >
            <option value="title">Title</option>
            <option value="fields">Fields</option>
            <option value="estimatedRecords">Rows</option>
          </select>
          <button
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onClick={() => setAsc((a) => !a)}
            aria-label="Toggle sort direction"
          >
            {asc ? "Asc" : "Desc"}
          </button>
        </div>
      </div>

      {/* Allow horizontal scroll so nothing clips on the right */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[40%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
          </colgroup>
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
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                  No reports in this view yet.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.description}</div>
                </td>
                <td className="px-4 py-3 capitalize">{r.category}</td>
                <td className="px-4 py-3 tabular-nums">{r.fields}</td>
                <td className="px-4 py-3 tabular-nums">
                  {r.estimatedRecords.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      onClick={() => onSelect(r)}
                    >
                      <BarChart3 className="h-3.5 w-3.5" /> Configure
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      onClick={() => alert(`Export queued (stub): ${r.id}`)}
                    >
                      <Download className="h-3.5 w-3.5" /> Export
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      title="Favorite (stub)"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
