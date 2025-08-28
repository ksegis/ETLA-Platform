// src/app/reporting/jobs/job-roster/page.tsx
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

// src/app/reporting/jobs/job-costing/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";
export default async function Page({ searchParams }: { searchParams: SP }) {
  const { start, end, customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Job Costing"
      reportId="jobs/job-costing"
      customerId={customerId} start={start} end={end}
      columns={[
        { key: "jobCode", label: "Job Code" },
        { key: "jobName", label: "Job Name" },
        { key: "periodStart", label: "Start" },
        { key: "periodEnd", label: "End" },
        { key: "laborHours", label: "Hours", align: "right" },
        { key: "laborCost", label: "Labor $", align: "right" },
        { key: "burdenCost", label: "Burden $", align: "right" },
        { key: "totalCost", label: "Total $", align: "right" },
      ]}
    />
  );
}
