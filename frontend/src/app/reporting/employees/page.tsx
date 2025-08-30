// src/app/reporting/employees/page.tsx
import ReportGrid from "@/app/reporting/_components/ReportGrid";

export default async function Page({ searchParams }: any) {
  const sp = (await searchParams) ?? {};
  const customerId = typeof sp?.customerId === "string" ? sp.customerId : "DEMO";

  const employeesReports = [
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
