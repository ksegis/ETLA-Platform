"use client";

import * as React from "react";
import type { ReportType } from "../_data";
import { Eye, Download } from "lucide-react";
import clsx from "clsx";

type Props = {
  /** rows for the table */
  items: ReportType[];
  /** open preview modal for this report */
  onPreview: (r: ReportType) => void;
  /** export this report to Excel/CSV/etc */
  onExport: (r: ReportType) => void;
};

/**
 * Simple, accessible table used by All Reports and Group pages.
 * - Clicking the report title opens preview
 * - Actions column has "Preview" and "Export"
 */
export function ReportTable({ items, onPreview, onExport }: Props) {
  const [sortBy, setSortBy] = React.useState<"title" | "rows" | "fields">("title");
  const [asc, setAsc] = React.useState(true);

  const sorted = React.useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      if (sortBy === "title") {
        aVal = a.title?.toLowerCase?.() ?? "";
        bVal = b.title?.toLowerCase?.() ?? "";
        return asc ? (aVal > bVal ? 1 : aVal < bVal ? -1 : 0) : (aVal < bVal ? 1 : aVal > bVal ? -1 : 0);
      }
      if (sortBy === "fields") {
        aVal = Number((a as any).fields ?? 0);
        bVal = Number((b as any).fields ?? 0);
      } else {
        aVal = Number((a as any).rows ?? 0);
        bVal = Number((b as any).rows ?? 0);
      }
      return asc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return copy;
  }, [items, sortBy, asc]);

  const headerBtn = (key: "title" | "fields" | "rows", label: string) => (
    <button
      type="button"
      onClick={() => (setAsc(key === sortBy ? !asc : true), setSortBy(key))}
      className={clsx(
        "inline-flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900",
        sortBy === key && "text-gray-900"
      )}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <span className="text-xs">{sortBy === key ? (asc ? "▲" : "▼") : ""}</span>
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                {headerBtn("title", "Report")}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Category
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                {headerBtn("fields", "Fields")}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                {headerBtn("rows", "~ Rows")}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {sorted.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onPreview(r)}
                    className="text-left font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {r.title}
                  </button>
                  {r.description ? (
                    <div className="mt-0.5 text-xs text-gray-500 line-clamp-1">{r.description}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{(r as any).category ?? ""}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{(r as any).fields ?? ""}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{(r as any).rows ?? ""}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPreview(r)}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => onExport(r)}
                      className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-2.5 py-1.5 text-sm text-white hover:bg-gray-800"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
