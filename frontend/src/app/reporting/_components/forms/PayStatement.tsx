// frontend/src/app/reporting/_components/forms/PayStatement.tsx
"use client";

import React from "react";

type Props = {
  row: any; // PayStubRow from _data; kept loose to avoid TS friction
  company?: { name?: string; ein?: string; address1?: string; address2?: string };
};

export default function PayStatement({ row, company }: Props) {
  if (!row) return null;
  const gross = row.earnings?.reduce((a: number, e: any) => a + (e.amount || 0), 0) || 0;
  const tax = row.taxes?.reduce((a: number, t: any) => a + (t.amount || 0), 0) || 0;
  const ded = row.deductions?.reduce((a: number, d: any) => a + (d.amount || 0), 0) || 0;
  const net = Math.round((gross - tax - ded) * 100) / 100;

  return (
    <div className="mx-auto w-full max-w-[1100px] rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <div className="text-lg font-semibold text-gray-900">{company?.name ?? "Demo Employer LLC"}</div>
          <div className="text-sm text-gray-700">{company?.address1 ?? "123 Payroll Ave"}</div>
          <div className="text-sm text-gray-700">{company?.address2 ?? "Springfield, US 00000"}</div>
          <div className="text-xs text-gray-500">EIN: {company?.ein ?? "12-3456789"}</div>
        </div>
        <div className="col-span-5">
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-xs font-semibold uppercase text-gray-600">Pay Statement</div>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-gray-600">Employee</dt>
              <dd className="font-medium text-gray-900">{row.employeeName}</dd>
              <dt className="text-gray-600">Employee ID</dt>
              <dd className="text-gray-900">{row.employeeId}</dd>
              <dt className="text-gray-600">Department</dt>
              <dd className="text-gray-900">{row.department ?? "—"}</dd>
              <dt className="text-gray-600">Pay Date</dt>
              <dd className="text-gray-900">{row.payDate}</dd>
              <dt className="text-gray-600">Period</dt>
              <dd className="text-gray-900">
                {row.periodStart} – {row.periodEnd}
              </dd>
              <dt className="text-gray-600">Check/Advice #</dt>
              <dd className="text-gray-900">{row.checkNumber ?? row.payNumber ?? "—"}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 grid grid-cols-4 gap-4">
        <SummaryCard label="Current Gross" value={gross} />
        <SummaryCard label="Taxes" value={tax} />
        <SummaryCard label="Deductions" value={ded} />
        <SummaryCard label="Net Pay" value={net} highlight />
      </div>

      {/* Detail */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <Section title="Earnings">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-600">
                <tr>
                  <th className="py-1 pr-2">Code</th>
                  <th className="py-1 pr-2">Description</th>
                  <th className="py-1 pr-2 text-right">Hours</th>
                  <th className="py-1 pr-2 text-right">Rate</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {row.earnings?.map((e: any, i: number) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1 pr-2">{e.code}</td>
                    <td className="py-1 pr-2">{e.desc}</td>
                    <td className="py-1 pr-2 text-right">{e.hours ?? "—"}</td>
                    <td className="py-1 pr-2 text-right">{e.rate ? `$${e.rate.toFixed(2)}` : "—"}</td>
                    <td className="py-1 text-right">${e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          <Section title="Memos">
            <div className="text-sm text-gray-800">
              {row.memos?.length ? row.memos.join("; ") : "None"}
            </div>
          </Section>
        </div>

        <div className="col-span-5">
          <Section title="Taxes">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-600">
                <tr>
                  <th className="py-1 pr-2">Code</th>
                  <th className="py-1 pr-2">Description</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {row.taxes?.map((t: any, i: number) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1 pr-2">{t.code}</td>
                    <td className="py-1 pr-2">{t.desc}</td>
                    <td className="py-1 text-right">${t.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          <Section title="Deductions">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-600">
                <tr>
                  <th className="py-1 pr-2">Code</th>
                  <th className="py-1 pr-2">Description</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {row.deductions?.map((d: any, i: number) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1 pr-2">{d.code}</td>
                    <td className="py-1 pr-2">{d.desc}</td>
                    <td className="py-1 text-right">${d.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          <Section title="Year-to-Date">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-gray-600">YTD Gross</dt>
              <dd className="text-right">${row.ytd?.gross?.toFixed?.(2) ?? "0.00"}</dd>
              <dt className="text-gray-600">YTD Taxes</dt>
              <dd className="text-right">${row.ytd?.taxes?.toFixed?.(2) ?? "0.00"}</dd>
              <dt className="text-gray-600">YTD Deductions</dt>
              <dd className="text-right">${row.ytd?.deductions?.toFixed?.(2) ?? "0.00"}</dd>
              <dt className="text-gray-600">YTD Net</dt>
              <dd className="text-right font-medium">${row.ytd?.net?.toFixed?.(2) ?? "0.00"}</dd>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">{title}</div>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-gray-50"}`}>
      <div className="text-xs font-semibold uppercase text-gray-600">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${highlight ? "text-indigo-800" : "text-gray-900"}`}>
        ${value.toFixed(2)}
      </div>
    </div>
  );
}
