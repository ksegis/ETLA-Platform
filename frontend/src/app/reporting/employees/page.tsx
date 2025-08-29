// src/features/reports/GenericReportTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

export type Col = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string | number;
  // Optional custom cell renderer (receives the entire row)
  render?: (row: any) => React.ReactNode;
};

type Filters = Record<string, string | number | boolean | undefined>;

type Props = {
  title: string;
  reportId: string;
  customerId: string;
  start?: string;
  end?: string;
  columns: Col[];
  /** Primary key field in each row (defaults to "id") */
  keyField?: string;
  /** Page size for preview pagination (defaults to 25) */
  pageSize?: number;
  /** Adds a rightmost “Display” action column if true */
  hasFacsimile?: boolean;
  /** Extra query filters forwarded to the API */
  filters?: Filters;
};

export default function GenericReportTable({
  title,
  reportId,
  customerId,
  start,
  end,
  columns,
  keyField = "id",
  pageSize = 25,
  hasFacsimile = false,
  filters = {},
}: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Build querystring for /preview
  const qs = useMemo(() => {
    const q = new URLSearchParams();
    q.set("customerId", customerId);
    if (start) q.set("start", start);
    if (end) q.set("end", end);
    // pagination
    q.set("page", String(page));
    q.set("pageSize", String(pageSize));

    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
    });
    return q.toString();
  }, [customerId, start, end, filters, page, pageSize]);

  useEffect(() => {
    let abort = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/reports/${reportId}/preview?${qs}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!abort) setRows(Array.isArray(data) ? data : data?.rows ?? []);
      } catch (e: any) {
        if (!abort) setErr(e?.message ?? "Failed to load");
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, [reportId, qs]);

  const canPrev = page > 1;
  const canNext = rows.length >= pageSize; // naive next check; if fewer than pageSize, assume last page

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm tabular-nums">Page {page}</span>
          <button
            type="button"
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Status / errors */}
      {loading && (
        <div className="py-6 text-sm text-slate-600">Loading…</div>
      )}
      {err && (
        <div className="py-3 text-sm text-red-600">
          Failed to load preview: {err}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-3 py-2 font-medium text-slate-700 ${
                    c.align === "right"
                      ? "text-right"
                      : c.align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.label}
                </th>
              ))}
              {hasFacsimile && (
                <th className="px-3 py-2 text-right font-medium text-slate-700">
                  Display
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={columns.length + (hasFacsimile ? 1 : 0)}
                >
                  No data
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={String(r?.[keyField] ?? `${i}`)}
                  className={i % 2 ? "bg-white" : "bg-slate-50/30"}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-2 ${
                        c.align === "right"
                          ? "text-right"
                          : c.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {c.render ? c.render(r) : safeCell(r?.[c.key])}
                    </td>
                  ))}
                  {hasFacsimile && (
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="px-2 py-1 border rounded"
                        onClick={() => {
                          const id = String(r?.[keyField] ?? "");
                          if (!id) return;
                          const url = new URL(
                            `/api/reports/${reportId}/display`,
                            window.location.origin
                          );
                          url.searchParams.set("customerId", customerId);
                          url.searchParams.set("id", id);
                          window.open(url.toString(), "_blank", "noreferrer");
                        }}
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function safeCell(v: any) {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}
