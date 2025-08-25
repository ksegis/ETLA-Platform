"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import type { ReportType } from "../_data";

type Props = {
  reports: ReportType[];
  /** Optional: constrain to a group key (e.g., "checks", "jobs") */
  groupKey?: string | null;
  /** Called when user wants a preview */
  onPreview?: (r: ReportType) => void;
  /** Called when user wants an export */
  onExport?: (r: ReportType) => void;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function ReportTable({ reports, groupKey = null, onPreview, onExport }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "fields">("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = reports.filter((r) => (groupKey ? r.group === groupKey : true));
    if (q) {
      list = list.filter((r) => (r.title + " " + (r.description ?? "")).toLowerCase().includes(q));
    }
    list = list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = (a.fields ?? 0) - (b.fields ?? 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [reports, groupKey, query, sortKey, sortDir]);

  // pagination math
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageRows = filtered.slice(start, end);

  // reset to page 1 on filtering or page size change
  React.useEffect(() => {
    setPage(1);
  }, [query, groupKey, pageSize]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header (search + sort + page size) */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports…"
            className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-gray-600">Sort</label>
          <select
            className="rounded-md border border-gray-300 p-1.5 text-sm"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
          >
            <option value="title">Title</option>
            <option value="fields">Fields</option>
          </select>
          <select
            className="rounded-md border border-gray-300 p-1.5 text-sm"
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as any)}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>

          <label className="ml-3 text-xs text-gray-600">Rows / page</label>
          <select
            className="rounded-md border border-gray-300 p-1.5 text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Report</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Fields</th>
              <th className="px-3 py-2">~ Rows</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageRows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="font-medium text-gray-900 cursor-pointer hover:underline" onClick={() => onPreview?.(r)}>
                    {r.title}
                  </div>
                  {r.description && <div className="text-xs text-gray-500">{r.description}</div>}
                </td>
                <td className="px-3 py-2">{r.category}</td>
                <td className="px-3 py-2">{r.fields ?? "-"}</td>
                <td className="px-3 py-2">{r.estimatedRows ?? "-"}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      onClick={() => onPreview?.(r)}
                    >
                      Preview
                    </button>
                    <button
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      onClick={() => onExport?.(r)}
                    >
                      Export
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!pageRows.length && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-gray-500">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-3 text-sm">
        <div className="text-gray-600">
          {total ? (
            <>
              Showing <span className="font-medium">{start + 1}</span>–<span className="font-medium">{end}</span> of{" "}
              <span className="font-medium">{total.toLocaleString()}</span>
            </>
          ) : (
            <>No results</>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={currentPage <= 1}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-gray-700">
            Page <span className="font-medium">{currentPage}</span> / {totalPages}
          </span>
          <button
            className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
