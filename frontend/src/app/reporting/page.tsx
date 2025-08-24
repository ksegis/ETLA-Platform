"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getReportsByGroup, type ReportType } from "./_data";
import { ReportTable } from "./_components/ReportTable";
import { X, BarChart3, FileText } from "lucide-react";

/** ---------- Types for preview payload ---------- */
type PreviewData = {
  columns: string[];
  rows: any[];
  total: number;
  docs?: Array<{ id: string; name: string; url?: string; size?: number }>;
};

/** ---------- Tabular data preview ---------- */
function DataPreview({ data }: { data: PreviewData }) {
  if (!data.rows?.length) {
    return (
      <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
        No rows to display.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">
        Showing up to {Math.min(50, data.rows.length)} rows.
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              {data.columns.map((c) => (
                <th key={c} className="px-3 py-2">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.slice(0, 50).map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {data.columns.map((c) => (
                  <td key={c} className="px-3 py-2 whitespace-pre-wrap">
                    {String(r[c] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500">
        Total rows (reported): {data.total.toLocaleString()}
      </div>
    </div>
  );
}

/** ---------- Document preview (PDF/images) ---------- */
function DocumentPreview({
  docs,
}: {
  docs: NonNullable<PreviewData["docs"]>;
}) {
  const [current, setCurrent] = useState(docs[0]);

  useEffect(() => {
    setCurrent(docs[0]);
  }, [docs]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        {current?.url ? (
          <iframe src={current.url} className="h-[60vh] w-full" />
        ) : (
          <div className="p-6 text-sm text-gray-600">
            No preview URL available for this document.
          </div>
        )}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[70%]" />
            <col className="w-[30%]" />
          </colgroup>
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">File</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {docs.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">{d.name}</div>
                      {d.size ? (
                        <div className="text-xs text-gray-500">
                          {(d.size / 1024).toFixed(0)} KB
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    className="mr-2 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                    onClick={() => setCurrent(d)}
                  >
                    Preview
                  </button>
                  {d.url && (
                    <a
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={2}>
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** ---------- All Reports page ---------- */
export default function AllReportsPage() {
  const items = getReportsByGroup("all");
  const title = "All Reports";

  const [selected, setSelected] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);

  const header = useMemo(
    () => (
      <section className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">Search, sort, and run any report.</p>
      </section>
    ),
    []
  );

  async function loadPreview(r: ReportType) {
    setLoading(true);
    setPreview(null);
    try {
      const res = await fetch(`/api/reports/${r.id}?limit=50`, { cache: "no-store" });
      const json = (await res.json()) as PreviewData;
      setPreview(json);
    } catch {
      setPreview({ columns: [], rows: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  function exportExcel(r: ReportType) {
    // Trigger a download from the server route
    window.location.href = `/api/reports/${r.id}/export`;
  }

  return (
    <div className="mx-auto max-w-6xl">
      {header}

      <ReportTable
        items={items}
        onSelect={(r) => {
          setSelected(r);
          loadPreview(r);
        }}
      />

      {/* Slide-in panel with live preview + export */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-2xl transform border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          selected ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!selected}
        role="dialog"
        aria-label="Report configuration"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">
              {selected?.title ?? "Configure Report"}
            </h3>
          </div>
          <button
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {!selected ? null : loading ? (
            <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              Loading preview…
            </div>
          ) : selected.docBased ? (
            preview?.docs ? (
              <DocumentPreview docs={preview.docs} />
            ) : (
              <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                No documents.
              </div>
            )
          ) : preview ? (
            <DataPreview data={preview} />
          ) : (
            <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              No data.
            </div>
          )}

          {selected && (
            <button
              type="button"
              className="w-full rounded-xl bg-gray-900 px-4 py-2 font-medium text-white hover:bg-black"
              onClick={() => exportExcel(selected)}
            >
              Export to Excel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
