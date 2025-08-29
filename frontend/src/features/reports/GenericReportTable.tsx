"use client";

import React, { useEffect, useMemo, useState } from "react";

export type Col = {
  key: string;
  label: string;
  width?: number | string;
  align?: "left" | "center" | "right";
};

type Props = {
  title: string;
  reportId: string;         // e.g. "checks/w2-forms"
  customerId: string;
  start?: string;
  end?: string;
  columns: Col[];
  keyField?: string;        // defaults to "id" if omitted
  pageSize?: number;        // defaults to 25

  // Optional — passed by ReportModal / callers
  filters?: Record<string, any>;
  hasFacsimile?: boolean;   // if true, show a "Display" action
};

type ApiResponse = any[] | { rows?: any[]; total?: number };

export default function GenericReportTable({
  title,
  reportId,
  customerId,
  start,
  end,
  columns,
  keyField = "id",
  pageSize = 25,
  filters,
  hasFacsimile,
}: Props): JSX.Element {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("customerId", customerId);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined && v !== null && v !== "") {
          params.set(k, String(v));
        }
      }
    }
    return params.toString();
  }, [customerId, page, pageSize, start, end, filters]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // NOTE: your API route can be either `/api/reports/[...id]` or `/api/reports/[...id]/preview`.
        // If you only support one, keep it. The first should work with the consolidated route you’re using.
        const url = `/api/reports/${reportId}?${queryString}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: ApiResponse = await res.json();
        const nextRows = Array.isArray(data) ? data : data.rows ?? [];
        const nextTotal = Array.isArray(data) ? undefined : data.total;

        if (!cancelled) {
          setRows(nextRows);
          setTotal(nextTotal);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load report data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reportId, queryString]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => p + 1);

  const renderCell = (row: any, col: Col) => {
    const value = row?.[col.key];
    return value === undefined || value === null ? "" : String(value);
  };

  const handleFacsimile = (row: any) => {
    const rowId = row?.[keyField];
    if (!rowId) return;
    // Keep this generic; wire to whatever endpoint you expose server-side
    const facsimileUrl = `/api/reports/${reportId}/display?rowId=${encodeURIComponent(
      String(rowId)
    )}`;
    window.open(facsimileUrl, "_blank");
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="text-sm text-gray-500">
          {loading ? "Loading…" : error ? (
            <span className="text-red-600">Error: {error}</span>
          ) : (
            <>
              {rows.length} rows
              {typeof total === "number" ? ` / ${total} total` : ""}
            </>
          )}
        </div>
      </div>

      <div className="overflow-auto rounded border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b"
                  style={{ width: c.width }}
                >
                  {c.label}
                </th>
              ))}
              {hasFacsimile && (
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">
                  Display
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td
                  className="px-3 py-4 text-sm text-gray-500 border-b"
                  colSpan={columns.length + (hasFacsimile ? 1 : 0)}
                >
                  No data found.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row?.[keyField] ?? idx} className="odd:bg-white even:bg-gray-50">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className="px-3 py-2 text-sm text-gray-900 border-b align-top"
                      style={{ textAlign: c.align ?? "left" }}
                    >
                      {renderCell(row, c)}
                    </td>
                  ))}
                  {hasFacsimile && (
                    <td className="px-3 py-2 text-sm text-blue-600 border-b">
                      <button
                        className="underline hover:no-underline"
                        onClick={() => handleFacsimile(row)}
                        type="button"
                      >
                        Display
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          onClick={onPrev}
          disabled={page <= 1 || loading}
        >
          Previous
        </button>
        <span className="text-sm">Page {page}</span>
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          onClick={onNext}
          disabled={loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
