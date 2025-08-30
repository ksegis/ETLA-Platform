import Link from "next/link";
import ReportGrid from "@/app/reporting/_components/ReportGrid";

type PageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function getParam(
  obj: Record<string, string | string[] | undefined> | undefined,
  key: string,
  fallback = ""
) {
  const v = obj?.[key];
  return Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback);
}

export default async function JobsReports({ searchParams }: PageProps) {
  const resolved =
    searchParams && typeof (searchParams as any).then === "function"
      ? await (searchParams as Promise<Record<string, string | string[] | undefined>>)
      : ((searchParams ?? {}) as Record<string, string | string[] | undefined>);
  const customerId = getParam(resolved, "customerId", "DEMO");

  const reports = [
    {
      id: "jobs/job-roster",
      title: "Job Roster",
      subtitle: "All active jobs",
      hasFacsimile: false,
      columns: [
        { key: "job_id", label: "Job ID" },
        { key: "job_name", label: "Job Name" },
        { key: "location", label: "Location" },
        { key: "status", label: "Status" },
        { key: "start_date", label: "Start" },
        { key: "end_date", label: "End" },
      ],
    },
    {
      id: "jobs/job-costing",
      title: "Job Costing",
      subtitle: "Labor, material, other costs",
      hasFacsimile: false,
      columns: [
        { key: "job_id", label: "Job ID" },
        { key: "job_name", label: "Job Name" },
        { key: "period_start", label: "Start" },
        { key: "period_end", label: "End" },
        { key: "labor_cost", label: "Labor" },
        { key: "material_cost", label: "Material" },
        { key: "total_cost", label: "Total" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Job Reports</h1>
        <Link href="/reporting" className="text-sm text-blue-600 hover:underline">
          ← Back to all groups
        </Link>
      </div>
      <ReportGrid customerId={customerId} reports={reports as any} />
    </div>
  );
}
