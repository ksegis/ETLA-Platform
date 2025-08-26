// frontend/src/app/reporting/_components/forms/TimecardForm.tsx
"use client";

import React from "react";

export default function TimecardForm({ row }: { row: any }) {
  if (!row) return null;

  return (
    <div className="mx-auto w-full max-w-[1100px] rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <div className="text-lg font-semibold text-gray-900">Approved Timecard</div>
          <div className="text-sm text-gray-700">
            {row.employeeName} • {row.employeeId}
          </div>
        </div>
        <div className="text-sm text-gray-700">
          Period: <span className="font-medium">{row.periodStart} – {row.periodEnd}</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-4">
        <Summary label="Regular" value={row.totals?.reg ?? 0} />
        <Summary label="Overtime" value={row.totals?.ot ?? 0} />
        <Summary label="PTO" value={row.totals?.pto ?? 0} />
        <Summary label="Total" value={(row.totals?.reg ?? 0) + (row.totals?.ot ?? 0) + (row.totals?.pto ?? 0)} highlight />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">In</th>
              <th className="px-3 py-2">Out</th>
              <th className="px-3 py-2">Hours</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Department</th>
            </tr>
          </thead>
          <tbody>
            {row.punches?.map((p: any, i: number) => (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-3 py-2">{p.date}</td>
                <td className="px-3 py-2">{p.in}</td>
                <td className="px-3 py-2">{p.out}</td>
                <td className="px-3 py-2">{p.hours}</td>
                <td className="px-3 py-2">{p.code ?? "REG"}</td>
                <td className="px-3 py-2">{p.dept ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Approver: Supervisor on file • Source: Time Import • Final status: Approved
      </div>
    </div>
  );
}

function Summary({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-gray-50"}`}>
      <div className="text-xs font-semibold uppercase text-gray-600">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${highlight ? "text-indigo-800" : "text-gray-900"}`}>
        {typeof value === "number" ? value.toFixed(2) : value}
      </div>
    </div>
  );
}
