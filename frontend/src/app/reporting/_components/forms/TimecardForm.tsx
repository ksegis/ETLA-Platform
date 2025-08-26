"use client";
import * as React from "react";

function num(v: any, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).replace(/[^0-9.-]/g, "");
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

function pick<T = any>(row: any, keys: string[], fallback?: T): T {
  for (const k of keys) {
    const v = row?.[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return fallback as T;
}

type Props = { row: any };

export default function TimecardForm({ row }: Props) {
  const employee = pick<string>(row, ["employee", "employeeName", "name"], "");
  const period = pick<string>(row, ["period", "periodLabel", "dateRange"], "");
  const entries: Array<any> = (Array.isArray(row?.entries) && row.entries) || (Array.isArray(row?.lines) && row.lines) || [];

  const totalHrs = entries.reduce((acc, e) => acc + num(pick(e, ["hours", "hrs"], 0)), 0);

  return (
    <div className="mx-auto w-full max-w-[900px] rounded-md border bg-white p-5 shadow-sm">
      <div className="mb-3 text-lg font-semibold">Timecard (Facsimile)</div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="text-xs text-gray-500">Employee</div>
          <div className="font-medium">{employee}</div>
        </div>
        <div className="sm:text-right">
          <div className="text-xs text-gray-500">Period</div>
          <div className="font-medium">{period}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="border-b px-3 py-2 text-left">Date</th>
              <th className="border-b px-3 py-2 text-left">Project / Task</th>
              <th className="border-b px-3 py-2 text-right">Hours</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-center text-gray-500" colSpan={3}>
                  No time entries
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="border-b px-3 py-2">{pick(e, ["date", "workDate"], "")}</td>
                <td className="border-b px-3 py-2">{pick(e, ["project", "task", "job"], "")}</td>
                <td className="border-b px-3 py-2 text-right">{num(pick(e, ["hours", "hrs"], 0)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="px-3 py-2 font-medium" colSpan={2}>
                Total
              </td>
              <td className="px-3 py-2 text-right font-semibold">{totalHrs.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
