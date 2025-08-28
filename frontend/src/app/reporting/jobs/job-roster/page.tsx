import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";

export default async function Page({ searchParams }: { searchParams: SP }) {
  const { customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Job Roster"
      reportId="jobs/job-roster"
      customerId={customerId}
      columns={[
        { key: "jobCode", label: "Job Code" },
        { key: "jobName", label: "Job Name" },
        { key: "status", label: "Status" },
        { key: "department", label: "Dept" },
        { key: "startDate", label: "Start" },
        { key: "endDate", label: "End" },
      ]}
    />
  );
}
