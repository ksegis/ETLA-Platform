// src/app/reporting/employees/roster/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";
export default async function Page({ searchParams }: { searchParams: SP }) {
  const { customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Employee Roster"
      reportId="employees/roster"
      customerId={customerId}
      columns={[
        { key: "fullName", label: "Employee" },
        { key: "status", label: "Status" },
        { key: "department", label: "Dept" },
        { key: "jobTitle", label: "Title" },
        { key: "location", label: "Location" },
        { key: "hireDate", label: "Hire" },
        { key: "termDate", label: "Term" },
      ]}
    />
  );
}

// src/app/reporting/employees/active/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";
export default async function Page({ searchParams }: { searchParams: SP }) {
  const { customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="Employee – Active"
      reportId="employees/active"
      customerId={customerId}
      columns={[
        { key: "fullName", label: "Employee" },
        { key: "department", label: "Dept" },
        { key: "jobTitle", label: "Title" },
        { key: "location", label: "Location" },
        { key: "hireDate", label: "Hire" },
      ]}
    />
  );
}
