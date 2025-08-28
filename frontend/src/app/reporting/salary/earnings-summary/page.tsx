// src/app/reporting/salary/earnings-summary/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";
export default async function Page({ searchParams }: { searchParams: SP }) {
  const { start, end, customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Earnings Summary"
      reportId="salary/earnings-summary"
      customerId={customerId} start={start} end={end}
      columns={[
        { key: "employeeName", label: "Employee" },
        { key: "periodStart", label: "Start" },
        { key: "periodEnd", label: "End" },
        { key: "regularHours", label: "Regular", align: "right" },
        { key: "overtimeHours", label: "OT", align: "right" },
        { key: "grossPay", label: "Gross", align: "right" },
      ]}
    />
  );
}

// src/app/reporting/salary/earnings-detail/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";
export default async function Page({ searchParams }: { searchParams: SP }) {
  const { start, end, customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Earnings Detail"
      reportId="salary/earnings-detail"
      customerId={customerId} start={start} end={end}
      columns={[
        { key: "employeeName", label: "Employee" },
        { key: "payDate", label: "Pay Date" },
        { key: "earningCode", label: "Code" },
        { key: "hours", label: "Hours", align: "right" },
        { key: "rate", label: "Rate", align: "right" },
        { key: "amount", label: "Amount", align: "right" },
      ]}
    />
  );
}
