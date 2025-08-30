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

export default async function TimecardsReports({ searchParams }: PageProps) {
  const resolved =
    searchParams && typeof (searchParams as any).then === "function"
      ? await (searchParams as Promise<Record<string, string | string[] | undefined>>)
      : ((searchParams ?? {}) as Record<string, string | string[] | undefined>);
  const customerId = getParam(resolved, "customerId", "DEMO");

  const reports = [
    {
      id: "timecards/timesheet-summary",
      title: "Timesheet Summary",
      subtitle: "Hours by employee and period",
      hasFacsimile: false,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "period_start", label: "Start" },
        { key: "period_end", label: "End" },
        { key: "regular_hours", label: "Reg Hrs" },
        { key: "overtime_hours", label: "OT Hrs" },
        { key: "total_hours", label: "Total Hrs" },
      ],
    },
    {
      id: "timecards/timesheet-detail",
      title: "Timesheet Detail",
      subtitle: "Punch-level detail",
      hasFacsimile: false,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "work_date", label: "Date" },
        { key: "in_time", label: "In" },
        { key: "out_time", label: "Out" },
        { key: "hours", label: "Hours" },
        { key: "job_id", label: "Job" },
      ],
    },
    {
      id: "timecards/exceptions",
      title: "Exceptions",
      subtitle: "Missed punches, overtime flags, etc.",
      hasFacsimile: false,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "exception_type", label: "Type" },
        { key: "work_date", label: "Date" },
        { key: "notes", label: "Notes" },
      ],
    },
    {
      id: "timecards/missing-punches",
      title: "Missing Punches",
      subtitle: "Attendance gaps",
      hasFacsimile: false,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "work_date", label: "Date" },
        { key: "expected", label: "Expected" },
        { key: "observed", label: "Observed" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Timecards</h1>
        <Link href="/reporting" className="text-sm text-blue-600 hover:underline">
          ← Back to all groups
        </Link>
      </div>
      <ReportGrid customerId={customerId} reports={reports as any} />
    </div>
  );
}
