// src/app/reporting/jobs/page.tsx
import ReportGrid from "@/app/reporting/_components/ReportGrid";

export default async function Page({ searchParams }: any) {
  const sp = (await searchParams) ?? {};
  const customerId = typeof sp?.customerId === "string" ? sp.customerId : "DEMO";

  const jobsReports = [
    {
      id: "jobs/job-roster",
      title: "Job Roster",
      description: "All jobs with status and dates",
      columns: [
        { key: "job_code", label: "Job Code" },
        { key: "job_name", label: "Job Name" },
        { key: "status", label: "Status" },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
      ],
    },
    {
      id: "jobs/job-costing",
      title: "Job Costing",
      description: "Labor & materials by job/period",
      columns: [
        { key: "job_code", label: "Job Code" },
        { key: "period_start", label: "Period Start" },
        { key: "period_end", label: "Period End" },
        { key: "labor_cost", label: "Labor Cost" },
        { key: "materials_cost", label: "Materials Cost" },
        { key: "total_cost", label: "Total Cost" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={jobsReports} />
    </div>
  );
}
