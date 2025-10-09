"use client";

import React, { useMemo, useState } from "react";
import { FileDown, Eye } from "lucide-react";
import type { ReportType } from "../_data";

type Props = {
  reports: ReportType[];
  onPreview: (report: ReportType) => void;
  // optional override (default uses /api/reports/[id]/export and passes through query)
  onExport?: (report: ReportType) => void;
};

type SortKey = "title" | "category" | "fields" | "estimatedRows";
type SortDir = "asc" | "desc";

export function ReportTable({ reports, onPreview, onExport }: Props) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const hay = q.trim().toLowerCase();
    const base = hay
      ? reports.filter(
          (r) =>
            r.title.toLowerCase().includes(hay) ||
            (r.description ?? "").toLowerCase().includes(hay) ||
            r.category.toLowerCase().includes(hay)
        )
      : reports;

    const sorted = base.slice().sort((a, b) => {
      const av = (a as any)[sortKey] ?? "";
      const bv = (b as any)[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });

    return sorted;
  }, [reports, q, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  function doExport(r: ReportType) {
    if (onExport) return onExport(r);
    const url = new URL(`/api/reports/${r.id}/export`, window.location.origin);
    // NOTE: filters are added by the preview modal; this table export is “raw”
    window.open(url.toString(), "_blank");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:w-80"
          placeholder="Search reports..."
        />
        <div className="text-xs text-gray-600">
          {filtered.length} {filtered.length === 1 ? "report" : "reports"}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2 cursor-pointer" onClick={() => toggleSort("title")}>
                Report
              </th>
              <th className="px-3 py-2 cursor-pointer" onClick={() => toggleSort("category")}>
                Category
              </th>
              <th className="px-3 py-2 w-20 cursor-pointer text-right" onClick={() => toggleSort("fields")}>
                Fields
              </th>
              <th className="px-3 py-2 w-24 cursor-pointer text-right" onClick={() => toggleSort("estimatedRows")}>
                ~ Rows
              </th>
              <th className="px-3 py-2 w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-3 py-3">
                  <div className="font-medium text-gray-900">{r.title}</div>
                  {r.description && <div className="text-[11px] text-gray-500">{r.description}</div>}
                </td>
                <td className="px-3 py-3">{r.category}</td>
                <td className="px-3 py-3 text-right">{r.fields ?? "—"}</td>
                <td className="px-3 py-3 text-right">{r.estimatedRows?.toLocaleString() ?? "—"}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      onClick={() => onPreview(r)}
                      aria-label={`Preview ${r.title}`}
                    >
                      <Eye className="h-4 w-4" /> Preview
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      onClick={() => doExport(r)}
                      aria-label={`Export ${r.title}`}
                    >
                      <FileDown className="h-4 w-4" /> Export
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-10 text-center text-gray-500" colSpan={5}>
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
