// src/app/reporting/timecards/page.tsx
import ReportGrid from "@/app/reporting/_components/ReportGrid";

export default async function Page({ searchParams }: any) {
  const sp = (await searchParams) ?? {};
  const customerId = typeof sp?.customerId === "string" ? sp.customerId : "DEMO";

  const timecardsReports = [
    {
      id: "timecards/timesheet-summary",
      title: "Timesheet Summary",
      description: "Weekly totals by employee",
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "name", label: "Employee" },
        { key: "week_start", label: "Week Start" },
        { key: "week_end", label: "Week End" },
        { key: "total_hours", label: "Total Hours" },
      ],
    },
    {
      id: "timecards/timesheet-detail",
      title: "Timesheet Detail",
      description: "Daily punches with job/task",
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "name", label: "Employee" },
        { key: "date", label: "Date" },
        { key: "start_time", label: "Start" },
        { key: "end_time", label: "End" },
        { key: "hours", label: "Hours" },
        { key: "job_code", label: "Job" },
        { key: "task", label: "Task" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={timecardsReports} />
    </div>
  );
}
