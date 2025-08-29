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

  const employeesReports: {
    id: string;
    title: string;
    description?: string;
    columns: Col[];
    hasFacsimile?: boolean;
  }[] = [
    {
      id: "employees/active",
      title: "Active Employees",
      description: "Current active headcount",
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "name", label: "Name" },
        { key: "department", label: "Department" },
        { key: "status", label: "Status" },
        { key: "hire_date", label: "Hire Date" },
      ],
    },
    {
      id: "employees/roster",
      title: "Employee Roster",
      description: "All employees with contact details",
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "department", label: "Department" },
        { key: "status", label: "Status" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={employeesReports} />
    </div>
  );
}
