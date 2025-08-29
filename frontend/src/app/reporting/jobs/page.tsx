import ReportGrid from "@/app/reporting/_components/ReportGrid";
import type { Col } from "@/features/reports/GenericReportTable";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const customerId =
    typeof sp.customerId === "string" ? sp.customerId : "DEMO";

  const jobsReports: {
    id: string;
    title: string;
    description?: string;
    columns: Col[];
  }[] = [
    {
      id: "jobs/job-roster",
      title: "Job Roster",
      description: "All open/closed jobs",
      columns: [
        { key: "job_id", label: "Job ID" },
        { key: "job_name", label: "Job Name" },
        { key: "status", label: "Status" },
        { key: "cost_center", label: "Cost Center" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={jobsReports} />
    </div>
  );
}
