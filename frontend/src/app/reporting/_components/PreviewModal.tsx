"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { ReportType } from "../_data";
import PaystubModal from "./PaystubModal";

type PreviewData = {
  columns: string[];
  rows: any[];
  total: number;
  docs?: Array<{ id: string; name: string; url?: string; size?: number }>;
  warning?: string;
};

type ExtraFilterSpec =
  | { type: "select"; key: string; label: string; options: { value: string; label: string }[] }
  | { type: "text"; key: string; label: string }
  | { type: "number"; key: string; label: string };

const PAGE_SIZE_OPTIONS = [25, 50, 100];

// Best-practice filters per report
const EXTRA_FILTERS: Record<string, ExtraFilterSpec[]> = {
  // Checks (already implemented)
  check_detail_history: [
    { type: "text", key: "employee_name", label: "Employee name" },
    { type: "number", key: "pay_number", label: "Pay number" },
    { type: "text", key: "department", label: "Department" },
    { type: "number", key: "check_number", label: "Check number" },
    { type: "text", key: "memo", label: "Memo contains" },
    { type: "number", key: "min_gross", label: "Min gross" },
    { type: "number", key: "max_gross", label: "Max gross" },
  ],

  // NEW — Department Analysis
  department_analysis: [
    { type: "text", key: "department", label: "Department" },
    { type: "text", key: "cost_center", label: "Cost center" },
    { type: "text", key: "location", label: "Location" },
    { type: "text", key: "pay_group", label: "Pay group" },
    { type: "number", key: "min_total_cost", label: "Min total cost" },
    { type: "number", key: "max_total_cost", label: "Max total cost" },
  ],

  // NEW — Job History
  job_history: [
    { type: "text", key: "employee_id", label: "Employee ID" },
    { type: "text", key: "employee_name", label: "Employee name" },
    { type: "text", key: "job_code", label: "Job code" },
    { type: "text", key: "department", label: "Department" },
    { type: "text", key: "supervisor", label: "Supervisor" },
    { type: "text", key: "location", label: "Location" },
    { type: "text", key: "action", label: "Action" },
    { type: "text", key: "reason_code", label: "Reason code" },
  ],

  // NEW — Position History
  position_history: [
    { type: "text", key: "position_id", label: "Position ID" },
    { type: "text", key: "position_title", label: "Position title" },
    { type: "text", key: "department", label: "Department" },
    { type: "text", key: "supervisor", label: "Supervisor" },
    { type: "text", key: "status", label: "Status" },
    { type: "number", key: "fte_min", label: "Min FTE" },
    { type: "number", key: "fte_max", label: "Max FTE" },
    { type: "number", key: "standard_hours", label: "Standard hours" },
  ],
};

function DataPreview({
  data,
  onRowClick,
  page,
  pageSize,
  total,
  setPage,
  setPageSize,
}: {
  data: PreviewData;
  onRowClick?: (row: any) => void;
  page: number;
  pageSize: number;
  total: number;
  setPage: (p: number) => void;
  setPageSize: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>{data.columns.map((c) => <th key={c} className="px-3 py-2">{c}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.map((r, i) => (
              <tr
                key={i}
                className={`${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
                onClick={() => onRowClick?.(r)}
              >
                {data.columns.map((c) => (
                  <td key={c} className="px-3 py-2 whitespace-pre-wrap">
                    {String(r[c] ?? r?.[data.columns.indexOf(c)] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {!data.rows.length && (
              <tr>
                <td colSpan={data.columns.length} className="px-3 py-8 text-center text-gray-500">
                  No rows to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-gray-600">
          {total ? (
            <>
              Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> of{" "}
              <span className="font-medium">{total.toLocaleString()}</span>
            </>
          ) : (
            <>No results</>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Rows / page</label>
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

          <div className="ml-2 flex items-center gap-1">
            <button className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50" onClick={() => setPage(1)} disabled={page <= 1}><ChevronsLeft className="h-4 w-4" /></button>
            <button className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-2 text-gray-700">Page <span className="font-medium">{page}</span> / {totalPages}</span>
            <button className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}><ChevronRight className="h-4 w-4" /></button>
            <button className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50" onClick={() => setPage(totalPages)} disabled={page >= totalPages}><ChevronsRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {data.warning && <div className="rounded-md bg-yellow-50 p-2 text-xs text-yellow-800">Note: {data.warning}</div>}
      <div className="text-[11px] text-gray-500">Tip: Click a row to open details (checks show a paystub).</div>
    </div>
  );
}

function DocumentPreview({ docs }: { docs: NonNullable<PreviewData["docs"]> }) {
  const [current, setCurrent] = useState(docs[0]);
  useEffect(() => { setCurrent(docs[0]); }, [docs]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        {current?.url ? <iframe src={current.url} className="h-[60vh] w-full" /> : <div className="p-6 text-sm text-gray-600">No preview URL available.</div>}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full table-fixed">
          <colgroup><col className="w-[70%]" /><col className="w-[30%]" /></colgroup>
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr><th className="px-3 py-2">File</th><th className="px-3 py-2">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {docs.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-3 py-2"><div className="font-medium text-gray-900">{d.name}</div></td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {d.url && <a className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100" href={d.url} target="_blank" rel="noreferrer">Open</a>}
                </td>
              </tr>
            ))}
            {docs.length === 0 && <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={2}>No documents found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PreviewModal({
  report,
  open,
  onClose,
}: {
  report: ReportType | null;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [nameTerm, setNameTerm] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const extraSpec = useMemo<ExtraFilterSpec[]>(() => (report ? (EXTRA_FILTERS[report.id] ?? []) : []), [report]);
  const [extra, setExtra] = useState<Record<string, any>>({});
  const [useDemo, setUseDemo] = useState<boolean>(false);

  // Pagination (server-backed)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Paystub (checks only)
  const [paystubRow, setPaystubRow] = useState<any | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open || !report) return;
    setData(null);
    setError(null);
    setExtra({});
    setUseDemo(false);
    setPage(1);
    triggerLoad(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, report]);

  useEffect(() => {
    if (!open || !report) return;
    triggerLoad(400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameTerm, from, to, useDemo, JSON.stringify(extra), page, pageSize]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameTerm, from, to, useDemo, JSON.stringify(extra), pageSize]);

  function buildFilters() {
    const f: Record<string, any> = { name: nameTerm || undefined, ...extra };
    Object.keys(f).forEach((k) => (f[k] === "" || f[k] == null) && delete f[k]);
    return f;
  }

  function triggerLoad(delayMs: number) {
    if (!report) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void runLoad(), delayMs);
  }

  async function runLoad() {
    if (!report) return;
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    try {
      const filters = buildFilters();
      const url = new URL(`/api/reports/${report.id}`, window.location.origin);
      url.searchParams.set("limit", String(pageSize));
      url.searchParams.set("offset", String((page - 1) * pageSize));
      if (from) url.searchParams.set("from", from);
      if (to) url.searchParams.set("to", to);
      if (Object.keys(filters).length) url.searchParams.set("filters", JSON.stringify(filters));
      if (useDemo) url.searchParams.set("demo", "1");

      const res = await fetch(url.toString(), { cache: "no-store", signal: ac.signal });
      if (!res.ok && res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as PreviewData & { error?: string };
      if ((json as any).error) setError((json as any).error);
      setData(json);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message ?? "Failed to load preview.");
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }

  if (!open || !report) return null;

  const isChecks = report.id === "check_detail_history";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 sm:p-6">
        <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">{report.title}</h3>
            <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="border-b border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Name / search</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Employee name, department, etc."
                  value={nameTerm}
                  onChange={(e) => setNameTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">From</label>
                <input type="date" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">To</label>
                <input type="date" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>

              {EXTRA_FILTERS[report.id]?.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-700">{f.label}</label>
                  {f.type === "select" ? (
                    <select
                      className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={String((extra as any)[f.key] ?? "")}
                      onChange={(e) => setExtra((prev) => ({ ...prev, [f.key]: e.target.value || undefined }))}
                    >
                      <option value="">Any</option>
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                      type={f.type === "number" ? "number" : "text"}
                      value={String((extra as any)[f.key] ?? "")}
                      onChange={(e) => setExtra((prev) => ({ ...prev, [f.key]: e.target.value || undefined }))}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex select-none items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={useDemo} onChange={(e) => setUseDemo(e.target.checked)} />
                Demo data
              </label>

              <div className="ml-auto flex items-center gap-2">
                {/* Export handled by All Reports page's buttons; preview modal focuses on preview */}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            {loading && <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">Loading…</div>}
            {!loading && error && <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">Error: {error}</div>}
            {!loading && !error && data && (report.docBased ? (
              data.docs ? <DocumentPreview docs={data.docs} /> : <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">No documents.</div>
            ) : (
              <DataPreview
                data={data}
                onRowClick={isChecks ? (row) => setPaystubRow(row) : undefined}
                page={page}
                pageSize={pageSize}
                total={data.total ?? data.rows.length}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            ))}
          </div>
        </div>
      </div>

      {isChecks && paystubRow && data && (
        <PaystubModal open={!!paystubRow} row={paystubRow} allRows={data.rows} onClose={() => setPaystubRow(null)} />
      )}
    </>
  );
}
