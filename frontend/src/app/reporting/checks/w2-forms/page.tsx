// src/app/reporting/checks/w2-forms/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";
export default async function Page({ searchParams }: { searchParams: SP }) {
  const { start, end, customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="W-2 Forms"
      reportId="checks/w2-forms"
      customerId={customerId} start={start} end={end}
      columns={[
        { key: "employeeName", label: "Employee" },
        { key: "taxYear", label: "Year" },
        { key: "ssnMasked", label: "SSN (masked)" },
        { key: "wages", label: "Wages", align: "right" },
        { key: "federalTaxWithheld", label: "Fed Tax", align: "right" },
        { key: "state", label: "State" },
        { key: "stateWages", label: "State Wages", align: "right" },
      ]}
    />
  );
}

// src/app/reporting/checks/garnishment-register/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";
export default async function Page({ searchParams }: { searchParams: SP }) {
  const { start, end, customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Garnishment Register"
      reportId="checks/garnishment-register"
      customerId={customerId} start={start} end={end}
      columns={[
        { key: "employeeName", label: "Employee" },
        { key: "orderType", label: "Order Type" },
        { key: "caseNumber", label: "Case #" },
        { key: "payDate", label: "Pay Date" },
        { key: "amount", label: "Amount", align: "right" },
        { key: "ytdAmount", label: "YTD", align: "right" },
      ]}
    />
  );
}

// src/app/reporting/checks/payroll-tax-liability/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";
export default async function Page({ searchParams }: { searchParams: SP }) {
  const { start, end, customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Payroll Tax Liability"
      reportId="checks/payroll-tax-liability"
      customerId={customerId} start={start} end={end}
      columns={[
        { key: "taxType", label: "Tax" },
        { key: "periodEnd", label: "Period End" },
        { key: "liabilityAmount", label: "Liability", align: "right" },
        { key: "depositDueDate", label: "Deposit Due" },
        { key: "depositDate", label: "Deposited" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
