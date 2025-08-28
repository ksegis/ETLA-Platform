import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";

export default async function Page({ searchParams }: { searchParams: SP }) {
  const { start, end, customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Timesheet Detail"
      reportId="timecards/timesheet-detail"
      customerId={customerId}
      start={start}
      end={end}
      columns={[
        { key: "employeeName", label: "Employee" },
        { key: "workDate", label: "Work Date" },
        { key: "projectCode", label: "Project" },
        { key: "jobCode", label: "Job" },
        { key: "hours", label: "Hours", align: "right" },
        { key: "payCode", label: "Pay Code" },
      ]}
    />
  );
}
