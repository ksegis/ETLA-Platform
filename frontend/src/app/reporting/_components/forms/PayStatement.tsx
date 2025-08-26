// frontend/src/app/reporting/_components/forms/PayStatement.tsx
// Minimal, vendor-style paycheck stub layout.
// Accepts a flexible `data` object. Unknown fields are handled safely.

import React from "react";

type Money = number | string | null | undefined;

function fmt(n: Money) {
  if (n === null || n === undefined || n === "") return "-";
  const v = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(v)) return String(n);
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PayStatement({ data }: { data: any }) {
  // normalize a few common fields coming from your mock rows
  const employee = data?.employeeName ?? data?.employee ?? data?.name ?? "Employee";
  const empId = data?.empId ?? data?.employeeId ?? data?.emp_id ?? "";
  const checkNo = data?.checkNo ?? data?.checkNumber ?? data?.check_id ?? data?.check ?? "";
  const payDate = data?.payDate ?? data?.pay_date ?? data?.date ?? "";
  const dept = data?.dept ?? data?.department ?? "";
  const location = data?.location ?? "";
  const company = data?.company ?? "Your Company";
  const address = data?.companyAddress ?? data?.address ?? "";
  const payPeriod = data?.payPeriod ?? data?.period ?? "";

  const earnings: any[] = Array.isArray(data?.earningsLines) ? data.earningsLines : data?.earnings ?? [];
  const taxes: any[] = Array.isArray(data?.taxLines) ? data.taxLines : data?.taxes ?? [];
  const deductions: any[] = Array.isArray(data?.deductionLines) ? data.deductionLines : data?.deductions ?? [];

  const ytd: any = data?.ytd ?? {};
  const totals = {
    gross: data?.gross ?? data?.earningsTotal ?? earnings?.reduce((s, r) => s + (Number(r?.amount) || 0), 0),
    taxes: data?.taxesTotal ?? taxes?.reduce((s, r) => s + (Number(r?.amount) || 0), 0),
    deductions: data?.deductionsTotal ?? deductions?.reduce((s, r) => s + (Number(r?.amount) || 0), 0),
    net: data?.net ?? data?.netPay ?? data?.net_pay ?? 0,
  };

  return (
    <div className="w-[960px] bg-white text-gray-900 shadow-xl ring-1 ring-black/10">
      {/* Header */}
      <div className="flex items-start justify-between border-b p-6">
        <div>
          <div className="text-xl font-semibold">{company}</div>
          {address && <div className="text-sm text-gray-600">{address}</div>}
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">Pay Statement</div>
          <div className="text-sm text-gray-600">Check #{checkNo}</div>
          <div className="text-sm text-gray-600">Pay Date: {payDate}</div>
          {payPeriod && <div className="text-sm text-gray-600">Pay Period: {payPeriod}</div>}
        </div>
      </div>

      {/* Employee block */}
      <div className="grid grid-cols-2 gap-6 border-b p-6">
        <div>
          <div className="text-sm text-gray-600">Employee</div>
          <div className="font-medium">{employee}</div>
          <div className="text-sm text-gray-700">Employee ID: {empId}</div>
          {dept && <div className="text-sm text-gray-700">Department: {dept}</div>}
          {location && <div className="text-sm text-gray-700">Location: {location}</div>}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-gray-600">YTD Gross</div>
          <div className="text-right font-medium">${fmt(ytd.gross)}</div>
          <div className="text-gray-600">YTD Taxes</div>
          <div className="text-right font-medium">${fmt(ytd.taxes)}</div>
          <div className="text-gray-600">YTD Deductions</div>
          <div className="text-right font-medium">${fmt(ytd.deductions)}</div>
          <div className="text-gray-600">YTD Net</div>
          <div className="text-right font-medium">${fmt(ytd.net)}</div>
        </div>
      </div>

      {/* Lines */}
      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Earnings */}
        <div className="col-span-2">
          <div className="mb-2 text-sm font-semibold text-gray-700">Earnings</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-2">Description</th>
                <th className="py-2 pr-2 text-right">Hours/Units</th>
                <th className="py-2 pr-2 text-right">Rate</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {earnings?.length ? (
                earnings.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1 pr-2">{r?.desc ?? r?.description ?? r?.code ?? "-"}</td>
                    <td className="py-1 pr-2 text-right">{r?.hours ?? r?.units ?? "-"}</td>
                    <td className="py-1 pr-2 text-right">${fmt(r?.rate)}</td>
                    <td className="py-1 text-right">${fmt(r?.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No earning lines
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="col-span-1">
          <div className="mb-2 text-sm font-semibold text-gray-700">Totals</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Gross Pay</span>
              <span className="font-medium">${fmt(totals.gross)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span className="font-medium">${fmt(totals.taxes)}</span>
            </div>
            <div className="flex justify-between">
              <span>Deductions</span>
              <span className="font-medium">${fmt(totals.deductions)}</span>
            </div>
            <div className="mt-2 border-t pt-2 text-base font-semibold">
              <div className="flex justify-between">
                <span>Net Pay</span>
                <span>${fmt(totals.net)}</span>
              </div>
            </div>
          </div>

          {/* Taxes + Deductions lists */}
          <div className="mt-6">
            <div className="mb-1 text-sm font-semibold text-gray-700">Taxes</div>
            <ul className="space-y-1 text-sm">
              {taxes?.length
                ? taxes.map((t, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{t?.desc ?? t?.description ?? t?.code ?? "-"}</span>
                      <span>${fmt(t?.amount)}</span>
                    </li>
                  ))
                : <li className="text-gray-500">No taxes</li>}
            </ul>
          </div>

          <div className="mt-4">
            <div className="mb-1 text-sm font-semibold text-gray-700">Deductions</div>
            <ul className="space-y-1 text-sm">
              {deductions?.length
                ? deductions.map((d, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{d?.desc ?? d?.description ?? d?.code ?? "-"}</span>
                      <span>${fmt(d?.amount)}</span>
                    </li>
                  ))
                : <li className="text-gray-500">No deductions</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
