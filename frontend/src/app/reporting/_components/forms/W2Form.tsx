"use client";
import * as React from "react";

function num(v: any, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).replace(/[^0-9.-]/g, "");
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}
function money(v: any): string {
  return num(v).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function pick<T = any>(row: any, keys: string[], fallback?: T): T {
  for (const k of keys) {
    const v = row?.[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return fallback as T;
}

type Props = { row: any };

export default function W2Form({ row }: Props) {
  const employee = pick<string>(row, ["employee", "employeeName", "name"], "");
  const ssn = pick<string>(row, ["ssn", "ssnLast4", "ssn_last4"], "");
  const year = pick<string | number>(row, ["year", "tax_year"], "");
  const wages = money(pick(row, ["wages", "box1", "w2_wages"], 0));
  const federalTax = money(pick(row, ["federalTax", "box2", "withheld_federal"], 0));
  const socialWages = money(pick(row, ["socialSecurityWages", "box3"], 0));
  const socialTax = money(pick(row, ["socialSecurityTax", "box4"], 0));
  const medicareWages = money(pick(row, ["medicareWages", "box5"], 0));
  const medicareTax = money(pick(row, ["medicareTax", "box6"], 0));

  return (
    <div className="mx-auto w-full max-w-[900px] rounded-md border bg-white p-5 shadow-sm">
      <div className="mb-3 text-lg font-semibold">Form W-2 (Facsimile)</div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="text-xs text-gray-500">Employee</div>
          <div className="font-medium">{employee}</div>
          {ssn && <div className="text-sm text-gray-600">SSN: {ssn}</div>}
        </div>
        <div className="sm:text-right">
          <div className="text-xs text-gray-500">Tax Year</div>
          <div className="font-medium">{year}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Wages, tips, other comp (Box 1)</div>
          <div className="font-semibold">{wages}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Federal income tax withheld (Box 2)</div>
          <div className="font-semibold">{federalTax}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Social security wages (Box 3)</div>
          <div className="font-semibold">{socialWages}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Social security tax withheld (Box 4)</div>
          <div className="font-semibold">{socialTax}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Medicare wages (Box 5)</div>
          <div className="font-semibold">{medicareWages}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Medicare tax withheld (Box 6)</div>
          <div className="font-semibold">{medicareTax}</div>
        </div>
      </div>
    </div>
  );
}
