"use client";

import * as React from "react";

// Facsimile components (already in your repo)
import PayStatement from "./forms/PayStatement";
import W2Form from "./forms/W2Form";
import TimecardForm from "./forms/TimecardForm";

type PreviewModalProps = {
  open: boolean;
  report: any | null; // tolerate null; parent guards when opening
  onClose: () => void;
};

type PreviewPayload = {
  id: string;
  total: number;
  columns: string[];
  rows: Record<string, any>[];
};

function detectKind(report: any): "pay" | "w2" | "timecard" | "other" {
  const key = String(report?.id ?? report?.slug ?? report?.title ?? "")
    .toLowerCase();
  if (key.includes("w2")) return "w2";
  if (key.includes("timecard") || key.includes("timesheet")) return "timecard";
  if (key.includes("pay") || key.includes("stub") || key.includes("check")) return "pay";
  return "other";
}

export default function PreviewModal({ open, report, onClose }: PreviewModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<PreviewPayload | null>(null);
  const [selectedRow, setSelectedRow] = React.useState<Record<string, any> | null>(null);

  // Fetch preview rows when opened
  React.useEffect(() => {
    if (!open || !report?.id) {
      setData(null);
      setSelectedRow(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedRow(null);
        const res = await fetch(`/api/reports/${report.id}?limit=50`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const json = (await res.json()) as PreviewPayload;
        setData(json);
        setSelectedRow(json.rows?.[0] ?? null);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Failed to load preview");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [open, report?.id]);

  if (!open || !report) return null;

  const cols = data?.columns ?? [];
  const rows = data?.rows ?? [];
  const kind = detectKind(report);

  const filenameBase = String(report?.slug ?? report?.id ?? "report");

  const handleExport = async () => {
    try {
      const qs = new URLSearchParams();
      if (cols.length) qs.set("columns", cols.join(","));
      const url = `/api/reports/${report.id}/export?${qs.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `${filenameBase}.csv`;
      a.click();
      URL.revokeObjectURL(dlUrl);
    } catch (e: any) {
      alert(e?.message || "Export failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex h-[90vh] w-[95vw] max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">
              {report?.title ?? "Report Preview"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {loading ? "Loading…" : error ? `Error: ${error}` : `${rows.length} of ${data?.total ?? 0} rows`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={handleExport}
              disabled={loading || !rows.length}
              title="Export visible columns to CSV"
            >
              Export CSV
            </button>
            <button
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid flex-1 grid-cols-1 gap-0 md:grid-cols-2">
          {/* Left: table */}
          <div className="min-w-0 overflow-auto border-r">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  {cols.map((c) => (
                    <th
                      key={c}
                      className="border-b px-3 py-2 text-left font-medium text-gray-700"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && !rows.length && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-gray-500"
                      colSpan={Math.max(cols.length, 1)}
                    >
                      No rows to display
                    </td>
                  </tr>
                )}
                {rows.map((r, idx) => {
                  const isSel = selectedRow === r;
                  return (
                    <tr
                      key={idx}
                      className={`cursor-pointer ${isSel ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      onClick={() => setSelectedRow(r)}
                    >
                      {cols.map((c) => (
                        <td key={c} className="border-b px-3 py-2 text-gray-700">
                          {String(r?.[c] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right: facsimile */}
          <div className="min-w-0 overflow-auto p-4">
            {!selectedRow ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                Select a row to view the document facsimile
              </div>
            ) : (
              <div className="mx-auto max-w-[900px]">
                {/* Use the correct prop names for each facsimile */}
                {kind === "pay" && <PayStatement data={selectedRow} />}
                {kind === "w2" && <W2Form row={selectedRow} />}
                {kind === "timecard" && <TimecardForm row={selectedRow} />}
                {kind === "other" && (
                  <pre className="whitespace-pre-wrap rounded-md border bg-gray-50 p-3 text-xs">
                    {JSON.stringify(selectedRow, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
