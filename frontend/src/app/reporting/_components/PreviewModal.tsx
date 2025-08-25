"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, FileText } from "lucide-react";
import type { ReportType } from "../_data";

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

const EXTRA_FILTERS: Record<string, ExtraFilterSpec[]> = {
  check_detail_history: [
    { type: "text", key: "employee_name", label: "Employee name" },
    { type: "number", key: "pay_number", label: "Pay number" },
  ],
  time_card_detail_history: [
    { type: "text", key: "employee_name", label: "Employee name" },
    { type: "text", key: "department", label: "Department" },
  ],
  salary_history: [{ type: "text", key: "reason_code", label: "Reason code" }],
  job_history: [{ type: "text", key: "reason_code", label: "Reason code" }],
  status_history: [
    {
      type: "select",
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "terminated", label: "Terminated" },
      ],
    },
  ],
};

function DataPreview({ data }: { data: PreviewData }) {
  if (!data.rows?.length) {
    return <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">No rows to display.</div>;
  }
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">Showing up to {Math.min(50, data.rows.length)} rows.</div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>{data.columns.map((c) => <th key={c} className="px-3 py-2">{c}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.slice(0, 50).map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {data.columns.map((c) => (
                  <td key={c} className="px-3 py-2 whitespace-pre-wrap">
                    {String(r[c] ?? r?.[data.columns.indexOf(c)] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.warning && <div className="rounded-md bg-yellow-50 p-2 text-xs text-yellow-800">Note: {data.warning}</div>}
      <div className="text-xs text-gray-500">Total rows (reported): {data.total.toLocaleString()}</div>
    </div>
  );
}

function DocumentPreview({ docs }: { docs: NonNullable<PreviewData["docs"]> }) {
  const [current, setCurrent] = useState(docs[0]);
  useEffect(() => { setCurrent(docs[0]); }, [docs]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        {current?.url ? (
          <iframe src={current.url} className="h-[60vh] w-full" />
        ) : (
          <div className="p-6 text-sm text-gray-600">No preview URL available.</div>
        )}
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
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">{d.name}</div>
                      {d.size ? <div className="text-xs text-gray-500">{(d.size / 1024).toFixed(0)} KB</div> : null}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button className="mr-2 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100" onClick={() => setCurrent(d)}>Preview</button>
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
  onExport,
}: {
  report: ReportType | null;
  open: boolean;
  onClose: () => void;
  onExport: (r: ReportType, demo?: boolean, filters?: Record<string, any>) => void;
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

  // for aborting stale fetches
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // initial load on open/report change
  useEffect(() => {
    if (!open || !report) return;
    setData(null);
    setError(null);
    setExtra({});
    setUseDemo(false);
    triggerLoad(0); // immediate first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, report]);

  // auto-run when filters change (debounced)
  useEffect(() => {
    if (!open || !report) return;
    triggerLoad(400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameTerm, from, to, useDemo, JSON.stringify(extra)]);

  function buildFilters() {
    const f: Record<string, any> = { name: nameTerm || undefined, ...extra };
    Object.keys(f).forEach((k) => (f[k] === "" || f[k] == null) && delete f[k]);
    return f;
  }

  function triggerLoad(delayMs: number) {
    if (!report) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runLoad();
    }, delayMs);
  }

  async function runLoad() {
    if (!report) return;

    // cancel prior request if any
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    try {
      const filters = buildFilters();
      const url = new URL(`/api/reports/${report.id}`, window.location.origin);
      url.searchParams.set("limit", "50");
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

  function exportExcel() {
    if (!report) return;
    const filters = buildFilters();
    const url = new URL(`/api/reports/${report.id}/export`, window.location.origin);
    if (from) url.searchParams.set("from", from);
    if (to) url.searchParams.set("to", to);
    if (Object.keys(filters).length) url.searchParams.set("filters", JSON.stringify(filters));
    if (useDemo) url.searchParams.set("demo", "1");
    window.location.href = url.toString();
  }

  if (!open || !report) return null;

  return (
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
                placeholder="Employee name, memo, etc."
                value={nameTerm}
                onChange={(e) => setNameTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">From</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">To</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            {extraSpec.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-700">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                    value={extra[f.key] ?? ""}
                    onChange={(e) => setExtra((prev) => ({ ...prev, [f.key]: e.target.value || undefined }))}
                  >
                    <option value="">Any</option>
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                    type={f.type === "number" ? "number" : "text"}
                    value={extra[f.key] ?? ""}
                    onChange={(e) => setExtra((prev) => ({ ...prev, [f.key]: e.target.value || undefined }))}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex select-none items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={useDemo}
                onChange={(e) => setUseDemo(e.target.checked)}
              />
              Demo data
            </label>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={exportExcel}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
              >
                Export to Excel
              </button>
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
            <DataPreview data={data} />
          ))}
        </div>
      </div>
    </div>
  );
}
