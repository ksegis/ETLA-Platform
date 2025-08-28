import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";

export default async function Page({ searchParams }: { searchParams: SP }) {
  const { start, end, customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Earnings Summary"
      reportId="salary/earnings-summary"
      customerId={customerId}
      start={start}
      end={end}
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
