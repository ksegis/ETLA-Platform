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

  const timeReports: {
    id: string;
    title: string;
    description?: string;
    columns: Col[];
  }[] = [
    {
      id: "timecards/timesheet-detail",
      title: "Timesheet Detail",
      description: "Daily hours by employee/job",
      columns: [
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee" },
        { key: "workDate", label: "Date" },
        { key: "job_code", label: "Job Code" },
        { key: "cost_center", label: "Cost Center" },
        { key: "hours", label: "Hours" },
      ],
    },
    {
      id: "timecards/timesheet-summary",
      title: "Timesheet Summary",
      description: "Weekly totals",
      columns: [
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee" },
        { key: "weekStart", label: "Week Start" },
        { key: "weekEnd", label: "Week End" },
        { key: "totalHours", label: "Total Hours" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={timeReports} />
    </div>
  );
}
