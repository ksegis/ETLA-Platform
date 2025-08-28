// src/app/reporting/employees/page.tsx
export default async function EmployeeReportsGroup(props: any) {
  const maybeSearch = props?.searchParams;
  const searchParams =
    maybeSearch && typeof maybeSearch.then === "function"
      ? await maybeSearch
      : maybeSearch || {};

  const customerId = (searchParams?.customerId as string) ?? "DEMO";

  const rows = [
    {
      id: "employee-master-demographics",
      title: "Employee Master Demographics",
      fields:
        "Employee ID, First Name, Last Name, Middle Initial, Preferred Name, Date of Birth, Gender, Marital Status",
    },
    {
      id: "eeo-1",
      title: "EEO-1",
      fields:
        "Employee ID, First Name, Last Name, Gender, Race / Ethnicity, Job Category, Hire Date, Location / Establishment",
    },
    {
      id: "vets-4212",
      title: "VETS-4212",
      fields:
        "Employee ID, First Name, Last Name, Job Title, Department, Hire Date, Veteran Status, Location",
    },
    {
      id: "benefit-eligibility",
      title: "Benefit Eligibility / Carrier Feed",
      fields:
        "Employee ID, First Name, Last Name, Date of Birth, Gender, Marital Status, Address, Hire Date",
    },
    {
      id: "payroll-tax-demographics",
      title: "Payroll & Tax Demographics",
      fields:
        "Employee ID, First Name, Last Name, SSN (masked), Address, State of Residence, Work Location State, Federal Filing Status",
    },
    {
      id: "turnover-termination",
      title: "Turnover / Termination Demographics",
      fields:
        "Employee ID, First Name, Last Name, Hire Date, Termination Date, Job Title, Department, Location",
    },
    {
      id: "custom-demographic-analytics",
      title: "Custom Demographic Analytics",
      fields:
        "Employee ID, Gender, Race / Ethnicity, Age, Tenure, Department, Location, Employment Type",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Employee Reports</h1>
        <a href="/reporting" className="text-sm underline">
          &larr; Back to All Reports
        </a>
      </div>

      <div className="rounded border divide-y">
        <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 text-sm font-medium">
          <div className="col-span-5">Report</div>
          <div className="col-span-1">Kind</div>
          <div className="col-span-4">Fields</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-12 gap-4 p-3 items-center">
            <div className="col-span-5">
              <a
                href={`/reporting/employees/${r.id}?customerId=${encodeURIComponent(
                  customerId
                )}`}
                className="underline"
              >
                {r.title}
              </a>
              <div className="text-xs text-gray-500">{/* optional subtitle */}</div>
            </div>
            <div className="col-span-1">table</div>
            <div className="col-span-4 text-sm">{r.fields}</div>
            <div className="col-span-2 flex justify-end gap-2">
              <a
                className="px-3 py-1 border rounded text-sm"
                href={`/reporting/employees/${r.id}?customerId=${encodeURIComponent(
                  customerId
                )}`}
              >
                Preview
              </a>
              <a
                className="px-3 py-1 border rounded text-sm"
                href={`/api/reports/employees/${r.id}?format=csv&customerId=${encodeURIComponent(
                  customerId
                )}`}
              >
                Export
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
