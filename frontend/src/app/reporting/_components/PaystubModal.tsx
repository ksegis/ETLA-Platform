"use client";

import React, { useMemo } from "react";
import { X } from "lucide-react";

/** Small helpers */
function fmt(n: number | string, digits = 2) {
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num)) return "-";
  return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function asDate(s: string | Date | undefined) {
  try {
    const d = typeof s === "string" ? new Date(s) : (s ?? new Date());
    return d.toLocaleDateString();
  } catch {
    return String(s ?? "");
  }
}
function val<T = any>(row: any, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (k in row) return row[k];
    const lower = Object.keys(row).find((rk) => rk.toLowerCase() === k.toLowerCase());
    if (lower) return row[lower];
  }
  return undefined;
}

type Props = {
  /** The clicked row from the preview table */
  row: any;
  /** All rows currently loaded in the preview (for YTD math) */
  allRows: any[];
  open: boolean;
  onClose: () => void;
};

/**
 * A best-practice paystub layout:
 *  - Employer/Employee header
 *  - Pay details (period, date, check #)
 *  - Earnings (hours/rate/amount, current + YTD)
 *  - Taxes (breakdown)
 *  - Deductions (benefits/garnishment)
 *  - Summary (gross, taxes, deductions, net)
 *
 * NOTE: For demo data we derive a reasonable breakdown from the row.
 */
export default function PaystubModal({ row, allRows, open, onClose }: Props) {
  const computed = useMemo(() => {
    // Extract fields with graceful fallbacks
    const empId = String(val(row, "EmployeeID") ?? "");
    const empName = String(val(row, "EmployeeName") ?? "");
    const dept = String(val(row, "Department") ?? "");
    const payGroup = String(val(row, "PayGroup") ?? "Biweekly");
    const payDate = String(val(row, "PayDate") ?? "");
    const payWeek = String(val(row, "PayWeek") ?? "");
    const payNumber = Number(val(row, "PayNumber") ?? 0);
    const checkNumber = Number(val(row, "CheckNumber") ?? 0);
    const gross = Number(val(row, "Gross") ?? 0);
    const taxes = Number(val(row, "Taxes") ?? 0);
    const deductions = Number(val(row, "Deductions") ?? 0);
    const net = Number(val(row, "NetPay") ?? gross - taxes - deductions);
    const memo = String(val(row, "Memo") ?? "");
    const earningType = String(val(row, "EarningType") ?? "");
    const otHours = Number(val(row, "OTHours") ?? 0);
    const garnishment = Number(val(row, "Garnishment") ?? 0);

    // Demo assumptions for composition
    const assumedOtRate = 27; // matches demo generator
    const bonus = /bonus/i.test(memo) ? 150 : 0;
    const otPay = otHours * assumedOtRate;

    // Derive regular pay as the remainder
    let regularPay = Math.max(gross - (otPay + bonus), 0);

    // Derive taxes breakdown (approximate but consistent)
    const ficaSSCap = Math.min(gross * 0.062, taxes * 0.35);
    const ficaMed = Math.min(gross * 0.0145, taxes * 0.12);
    const remainingTax = Math.max(taxes - ficaSSCap - ficaMed, 0);
    const fedWH = remainingTax * 0.7;
    const stateWH = remainingTax * 0.3;

    // Deductions breakdown
    const benefits = Math.max(deductions - garnishment, 0);

    // Hours/rates for display
    const baseHours = 80;
    const regHours = baseHours - otHours;
    const regRate = regHours > 0 ? regularPay / regHours : 0;

    // YTD (based on loaded rows <= current pay date)
    const upTo = new Date(payDate).getTime();
    const sameEmp = allRows.filter((r) => String(val(r, "EmployeeID") ?? "") === empId);
    const ytd = sameEmp
      .filter((r) => {
        const d = String(val(r, "PayDate") ?? "");
        const ts = new Date(d).getTime();
        return Number.isFinite(ts) ? ts <= upTo : true;
      })
      .reduce(
        (acc, r) => {
          const g = Number(val(r, "Gross") ?? 0);
          const t = Number(val(r, "Taxes") ?? 0);
          const d = Number(val(r, "Deductions") ?? 0);
          const n = Number(val(r, "NetPay") ?? g - t - d);
          return {
            gross: acc.gross + g,
            taxes: acc.taxes + t,
            deductions: acc.deductions + d,
            net: acc.net + n,
          };
        },
        { gross: 0, taxes: 0, deductions: 0, net: 0 }
      );

    return {
      header: { empId, empName, dept, payGroup, payDate, payWeek, payNumber, checkNumber },
      earnings: {
        rows: [
          { label: "Regular", hours: regHours, rate: regRate, amount: regularPay },
          { label: "Overtime", hours: otHours, rate: assumedOtRate, amount: otPay },
          ...(bonus ? [{ label: "Bonus", hours: 0, rate: 0, amount: bonus }] : []),
        ],
        currentTotal: regularPay + otPay + bonus,
        ytdTotal: ytd.gross,
      },
      taxes: {
        rows: [
          { label: "Federal Withholding", amount: fedWH },
          { label: "State Withholding", amount: stateWH },
          { label: "Social Security (FICA)", amount: ficaSSCap },
          { label: "Medicare", amount: ficaMed },
        ],
        currentTotal: taxes,
        ytdTotal: ytd.taxes,
      },
      deductions: {
        rows: [
          { label: "Benefits", amount: benefits },
          ...(garnishment ? [{ label: "Garnishment", amount: garnishment }] : []),
        ],
        currentTotal: deductions,
        ytdTotal: ytd.deductions,
      },
      summary: {
        gross,
        taxes,
        deductions,
        net,
        ytdNet: ytd.net,
      },
    };
  }, [row, allRows]);

  if (!open) return null;

  const { header, earnings, taxes, deductions, summary } = computed;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto bg-black/50 p-4 print:bg-white print:p-0">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl print:max-w-none print:rounded-none print:shadow-none">
        {/* Toolbar (hidden in print) */}
        <div className="flex items-center justify-between border-b border-gray-200 p-3 print:hidden">
          <h3 className="text-base font-semibold text-gray-900">Paystub</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stub body */}
        <div className="p-6 print:p-8">
          {/* Header block */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">ETLA Demo Co.</div>
              <div className="text-xs text-gray-600">123 Payroll Way</div>
              <div className="text-xs text-gray-600">Anywhere, USA</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Employee</div>
              <div className="text-xs text-gray-600">{header.empName}</div>
              <div className="text-xs text-gray-600">ID: {header.empId}</div>
              <div className="text-xs text-gray-600">Dept: {header.dept}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Pay Details</div>
              <div className="text-xs text-gray-600">Pay Group: {header.payGroup}</div>
              <div className="text-xs text-gray-600">Pay Date: {asDate(header.payDate)}</div>
              <div className="text-xs text-gray-600">Pay Week: {header.payWeek}</div>
              <div className="text-xs text-gray-600">Pay #/Check #: {header.payNumber} / {header.checkNumber}</div>
            </div>
          </div>

          {/* Earnings / Taxes / Deductions */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Earnings */}
            <section className="rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold">Earnings</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Hours</th>
                    <th className="px-3 py-2 text-right">Rate</th>
                    <th className="px-3 py-2 text-right">Current</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {earnings.rows.map((r) => (
                    <tr key={r.label}>
                      <td className="px-3 py-2">{r.label}</td>
                      <td className="px-3 py-2 text-right">{fmt(r.hours, r.hours % 1 ? 2 : 0)}</td>
                      <td className="px-3 py-2 text-right">{r.rate ? fmt(r.rate) : "-"}</td>
                      <td className="px-3 py-2 text-right">{fmt(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 font-medium">
                    <td className="px-3 py-2" colSpan={3}>Total</td>
                    <td className="px-3 py-2 text-right">{fmt(earnings.currentTotal)}</td>
                  </tr>
                  <tr className="text-xs text-gray-500">
                    <td className="px-3 pb-3" colSpan={4}>YTD Earnings: {fmt(earnings.ytdTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </section>

            {/* Taxes */}
            <section className="rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold">Taxes</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Current</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {taxes.rows.map((t) => (
                    <tr key={t.label}>
                      <td className="px-3 py-2">{t.label}</td>
                      <td className="px-3 py-2 text-right">{fmt(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 font-medium">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{fmt(taxes.currentTotal)}</td>
                  </tr>
                  <tr className="text-xs text-gray-500">
                    <td className="px-3 pb-3" colSpan={2}>YTD Taxes: {fmt(taxes.ytdTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </section>

            {/* Deductions */}
            <section className="rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold">Deductions</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Current</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deductions.rows.map((d) => (
                    <tr key={d.label}>
                      <td className="px-3 py-2">{d.label}</td>
                      <td className="px-3 py-2 text-right">{fmt(d.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 font-medium">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{fmt(deductions.currentTotal)}</td>
                  </tr>
                  <tr className="text-xs text-gray-500">
                    <td className="px-3 pb-3" colSpan={2}>YTD Deductions: {fmt(deductions.ytdTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </section>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-sm font-semibold text-gray-900">Summary (Current)</div>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between"><dt>Gross</dt><dd>{fmt(summary.gross)}</dd></div>
                <div className="flex justify-between"><dt>Taxes</dt><dd>-{fmt(summary.taxes)}</dd></div>
                <div className="flex justify-between"><dt>Deductions</dt><dd>-{fmt(summary.deductions)}</dd></div>
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold">
                  <dt>Net Pay</dt><dd>{fmt(summary.net)}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-sm font-semibold text-gray-900">Summary (YTD)</div>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between"><dt>Gross</dt><dd>{fmt(earnings.ytdTotal)}</dd></div>
                <div className="flex justify-between"><dt>Taxes</dt><dd>{fmt(taxes.ytdTotal)}</dd></div>
                <div className="flex justify-between"><dt>Deductions</dt><dd>{fmt(deductions.ytdTotal)}</dd></div>
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold">
                  <dt>Net Pay</dt><dd>{fmt(summary.ytdNet)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 text-[11px] text-gray-500">
            This pay statement is a simulation for product preview. Amounts and allocations are derived from the selected row.
          </div>
        </div>
      </div>
    </div>
  );
}
