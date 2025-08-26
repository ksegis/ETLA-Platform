// frontend/src/app/reporting/_components/forms/W2Form.tsx
"use client";

import React from "react";

export default function W2Form({ row }: { row: any }) {
  if (!row) return null;
  return (
    <div className="mx-auto w-full max-w-[950px] rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-gray-900">W-2 Wage and Tax Statement (Facsimile)</h2>
        <div className="text-sm text-gray-700">Tax Year: <span className="font-medium">{row.year}</span></div>
      </div>

      <div className="grid grid-cols-12 gap-3 text-sm">
        <Box label="a. Employee SSN" className="col-span-4">{row.ssnMasked}</Box>
        <Box label="b. Employer EIN" className="col-span-4">12-3456789</Box>
        <Box label="c. Employer name & address" className="col-span-4">
          Demo Employer LLC<br/>123 Payroll Ave<br/>Springfield, US 00000
        </Box>

        <Box label="d. Control number" className="col-span-4">CN-{row.employeeId}-{row.year}</Box>
        <Box label="e. Employee name" className="col-span-4">{row.employeeName}</Box>
        <Box label="f. Employee address" className="col-span-4">On file</Box>

        <Box label="1. Wages, tips, other comp." className="col-span-4" value>${row.wages.toFixed(2)}</Box>
        <Box label="2. Federal income tax withheld" className="col-span-4" value>${row.fedWithheld.toFixed(2)}</Box>
        <Box label="3. Social security wages" className="col-span-4" value>${row.socialWages.toFixed(2)}</Box>

        <Box label="4. Social security tax withheld" className="col-span-4" value>${row.socialTax.toFixed(2)}</Box>
        <Box label="5. Medicare wages and tips" className="col-span-4" value>${row.medicareWages.toFixed(2)}</Box>
        <Box label="6. Medicare tax withheld" className="col-span-4" value>${row.medicareTax.toFixed(2)}</Box>

        <Box label="15. State" className="col-span-2">{row.state ?? "—"}</Box>
        <Box label="16. State wages" className="col-span-5" value>${(row.stateWages ?? 0).toFixed(2)}</Box>
        <Box label="17. State income tax" className="col-span-5" value>${(row.stateTax ?? 0).toFixed(2)}</Box>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        This is a system-generated facsimile for review purposes only.
      </div>
    </div>
  );
}

function Box({
  label,
  children,
  className,
  value,
}: {
  label: string;
  children?: React.ReactNode;
  className?: string;
  value?: React.ReactNode;
}) {
  return (
    <div className={`rounded border border-gray-300 p-2 ${className ?? ""}`}>
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-600">{label}</div>
      <div className="min-h-[28px] whitespace-pre-wrap text-gray-900">{value ?? children ?? "—"}</div>
    </div>
  );
}
