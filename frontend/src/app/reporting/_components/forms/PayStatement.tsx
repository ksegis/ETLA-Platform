"use client";
import * as React from "react";

/** Robust number coerce (handles strings like "$1,234.56") */
function num(v: any, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).replace(/[^0-9.-]/g, "");
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}
/** USD formatter that never throws */
function money(v: any): string {
  return num(v).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function fmt(v: any): string {
  return String(v ?? "");
}

/**
 * Accepts extremely flexible row shapes coming from preview/mock data.
 * Tries a few common aliases used by major providers.
 */
function pick<T = any>(row: any, keys: string[], fallback?: T): T {
  for (const k of keys) {
    const v = row?.[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return fallback as T;
}

type Props = { data: any };

export default function PayStatement({ data }: Props) {
  // Header fields (robust aliases)
  const employeeName = pick<string>(data, ["employeeName", "employee", "name", "worker_name"], "");
  const employeeId = pick<string | number>(data, ["employeeId", "empId", "worker_id", "id"], "");
  const checkNumber = pick<string | number>(data, ["checkNumber", "check_no", "check", "num", "document_number"], "");
  const checkDate = pick<string>(data, ["checkDate", "date", "issue_date", "check_date"], "");
  const payPeriodStart = pick<string>(data, ["periodStart", "payPeriodStart", "period_start", "start"], "");
  const payPeriodEnd = pick<string>(data, ["periodEnd", "payPeriodEnd", "period_end", "end"], "");
  const department = pick<string>(data, ["department", "dept"], "");
  const location = pick<string>(data, ["location", "work_location"], "");
  const ssnLast4 = pick<string | number>(data, ["ssnLast4", "ssn_last4", "ssn_last_4", "ssn4"], "");

  // Totals
  const gross = num(pick(data, ["gross", "grossPay", "totalGross", "total_earnings", "earnings_total", "current_gross"], 0));
  const tax = num(pick(data, ["tax", "totalTax", "taxes", "withholding_total", "current_taxes"], 0));
  const deductions = num(pick(data, ["deductions", "totalDeductions", "benefits_total", "current_deductions"], 0));
  const net = num(
    pick(
      data,
      ["net", "netPay", "takeHome", "net_pay", "check_amount", "current_net"],
      // derive if not provided:
      gross - tax - deductions
    )
  );

  // Optional YTD
  const ytdGross = num(pick(data, ["ytdGross", "grossYTD", "ytd_gross", "ytd_total_earnings"], 0));
  const ytdTax = num(pick(data, ["ytdTax", "taxYTD", "ytd_taxes", "ytd_total_taxes"], 0));
  const ytdDed = num(pick(data, ["ytdDeductions", "ytd_deductions", "ytd_benefits"], 0));
  const ytdNet = num(pick(data, ["ytdNet", "netYTD", "ytd_net"], ytdGross - ytdTax - ytdDed));

  // Earnings lines (array tolerant)
  const earnings: Array<any> =
    (Array.isArray(data?.earnings) && data.earnings) ||
    (Array.isArray(data?.lines) && data.lines) ||
    [];

  // Taxes / Deductions arrays (optional)
  const taxes: Array<any> = (Array.isArray(data?.taxes) && data.taxes) || [];
  const benefits: Array<any> = (Array.isArray(data?.benefits) && data.benefits) || (Array.isArray(data?.deductions) && data.deductions) || [];

  return (
    <div className="mx-auto w-full max-w-[900px] rounded-md border bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Employee</div>
          <div className="font-medium">{fmt(employeeName)}</div>
          <div className="text-sm text-gray-600">ID: {fmt(employeeId)}</div>
          {department && <div className="text-sm text-gray-600">Dept: {fmt(department)}</div>}
          {location && <div className="text-sm text-gray-600">Location: {fmt(location)}</div>}
          {ssnLast4 && <div className="text-sm text-gray-600">SSN: ***-**-{fmt(ssnLast4)}</div>}
        </div>
        <div className="space-y-1 sm:text-right">
          <div className="text-xs text-gray-500">Pay Stub</div>
          <div className="text-sm text-gray-700">
            Check #{fmt(checkNumber)} {checkDate ? `• ${fmt(checkDate)}` : ""}
          </div>
          {(payPeriodStart || payPeriodEnd) && (
            <div className="text-sm text-gray-600">
              Period: {fmt(payPeriodStart)} {payPeriodEnd ? `– ${fmt(payPeriodEnd)}` : ""}
            </div>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Gross</div>
          <div className="font-semibold">{money(gross)}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Taxes</div>
          <div className="font-semibold">{money(tax)}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Deductions</div>
          <div className="font-semibold">{money(deductions)}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Net Pay</div>
          <div className="font-semibold">{money(net)}</div>
        </div>
      </div>

      {/* Earnings */}
      <div className="mb-5 overflow-x-auto rounded-md border">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="border-b px-3 py-2 text-left">Earning</th>
              <th className="border-b px-3 py-2 text-right">Rate</th>
              <th className="border-b px-3 py-2 text-right">Hours</th>
              <th className="border-b px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {earnings.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-center text-gray-500" colSpan={4}>
                  No earning lines
                </td>
              </tr>
            )}
            {earnings.map((e, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="border-b px-3 py-2">{fmt(pick(e, ["name", "code", "earning", "type"], ""))}</td>
                <td className="border-b px-3 py-2 text-right">{money(pick(e, ["rate", "hourly_rate", "amount_per"], 0))}</td>
                <td className="border-b px-3 py-2 text-right">{num(pick(e, ["hours", "qty", "quantity"], 0)).toLocaleString()}</td>
                <td className="border-b px-3 py-2 text-right">{money(pick(e, ["amount", "current", "pay"], 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Taxes & Deductions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="overflow-x-auto rounded-md border">
          <div className="border-b bg-gray-50 px-3 py-2 text-sm font-medium">Taxes</div>
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="border-b px-3 py-2 text-left">Tax</th>
                <th className="border-b px-3 py-2 text-right">Current</th>
                <th className="border-b px-3 py-2 text-right">YTD</th>
              </tr>
            </thead>
            <tbody>
              {taxes.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-center text-gray-500" colSpan={3}>
                    No taxes
                  </td>
                </tr>
              )}
              {taxes.map((t, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="border-b px-3 py-2">{fmt(pick(t, ["name", "code", "tax"], ""))}</td>
                  <td className="border-b px-3 py-2 text-right">{money(pick(t, ["current", "amount"], 0))}</td>
                  <td className="border-b px-3 py-2 text-right">{money(pick(t, ["ytd", "ytd_amount"], 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <div className="border-b bg-gray-50 px-3 py-2 text-sm font-medium">Deductions / Benefits</div>
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="border-b px-3 py-2 text-left">Deduction</th>
                <th className="border-b px-3 py-2 text-right">Current</th>
                <th className="border-b px-3 py-2 text-right">YTD</th>
              </tr>
            </thead>
            <tbody>
              {benefits.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-center text-gray-500" colSpan={3}>
                    No deductions
                  </td>
                </tr>
              )}
              {benefits.map((d, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="border-b px-3 py-2">{fmt(pick(d, ["name", "code", "deduction"], ""))}</td>
                  <td className="border-b px-3 py-2 text-right">{money(pick(d, ["current", "amount"], 0))}</td>
                  <td className="border-b px-3 py-2 text-right">{money(pick(d, ["ytd", "ytd_amount"], 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* YTD summary */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">YTD Gross</div>
          <div className="font-semibold">{money(ytdGross)}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">YTD Taxes</div>
          <div className="font-semibold">{money(ytdTax)}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">YTD Deductions</div>
          <div className="font-semibold">{money(ytdDed)}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">YTD Net</div>
          <div className="font-semibold">{money(ytdNet)}</div>
        </div>
      </div>
    </div>
  );
}
