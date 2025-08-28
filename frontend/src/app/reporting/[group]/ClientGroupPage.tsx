"use client";

import Link from "next/link";
import { useMemo } from "react";

type ReportRow = {
  id: string;
  name: string;
  kind: string;
  fields: string;
  description?: string;
};

export default function ClientGroupPage({
  params,
}: {
  params: { group: string };
}) {
  const group = (params?.group ?? "").toLowerCase();

  const rows: ReportRow[] = useMemo(() => {
    if (group !== "checks") return [];
    return [
      {
        id: "checks/pay-statements",
        name: "Pay Statements",
        kind: "pay",
        fields:
          "Check Number, Employee ID, Employee Name, Pay Date, Pay Period Start, Pay Period End, Net Pay, Deposit (last 4)",
        description: "Individual employee pay stubs (facsimile view).",
      },
      {
        id: "checks/check-register",
        name: "Check Register",
        kind: "table",
        fields:
          "Check Number, Employee ID, Employee Name, Pay Date, Gross Pay, Taxes, Deductions, Net Pay",
        description: "Issued checks and direct deposits.",
      },
      {
        id: "checks/direct-deposit-register",
        name: "Direct Deposit Register",
        kind: "table",
        fields:
          "Employee ID, Employee Name, Pay Date, Amount, Bank Name, Account Type, Account (last 4), Routing (masked)",
        description: "ACH distribution by account.",
      },
    ];
  }, [group]);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">
          {group === "checks" ? "Pay & Checks Reports" : "Reports"}
        </h1>
        <a href="/reporting" className="rounded px-3 py-1.5 border">
          ← Back
        </a>
      </div>

      {!rows.length ? (
        <div className="text-gray-500">No reports in this group.</div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left w-[36%]">Report</th>
              <th className="border p-2 text-left w-[10%]">Kind</th>
              <th className="border p-2 text-left">Fields</th>
              <th className="border p-2 text-left w-[180px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="border p-2">
                  <div className="font-medium">{r.name}</div>
                  {r.description && (
                    <div className="text-gray-500">{r.description}</div>
                  )}
                </td>
                <td className="border p-2">{r.kind}</td>
                <td className="border p-2">{r.fields}</td>
                <td className="border p-2">
                  <div className="flex gap-2">
                    {/* Preview → new page for Pay Statements */}
                    {r.id === "checks/pay-statements" ? (
                      <Link
                        href="/reporting/checks/pay-statements"
                        prefetch={false}
                        className="rounded px-2 py-1 border hover:bg-gray-50"
                      >
                        Preview
                      </Link>
                    ) : (
                      <span
                        className="rounded px-2 py-1 border text-gray-400"
                        title="Preview not implemented yet"
                      >
                        Preview
                      </span>
                    )}

                    {/* Export as direct link */}
                    <a
                      href={`/api/reports/${r.id}/export`}
                      className="rounded px-2 py-1 border hover:bg-gray-50"
                    >
                      Export
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
