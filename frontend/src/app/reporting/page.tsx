// src/app/reporting/page.tsx
export default async function ReportingHome(props: any) {
  const maybeSearch = props?.searchParams;
  const searchParams =
    maybeSearch && typeof maybeSearch.then === "function"
      ? await maybeSearch
      : maybeSearch || {};
  const customerId = (searchParams?.customerId as string) ?? "DEMO";

  const employee = [
    {
      href: `/reporting/employees/employee-master-demographics?customerId=${encodeURIComponent(
        customerId
      )}`,
      title: "Employee Master Demographics",
      kind: "-",
      fields:
        "Employee ID, First Name, Last Name, Middle Initial, Preferred Name, Date of Birth, Gender, Marital Status",
      exportHref: `/api/reports/employees/employee-master-demographics?format=csv&customerId=${encodeURIComponent(
        customerId
      )}`,
    },
    {
      href: `/reporting/employees/eeo-1?customerId=${encodeURIComponent(
        customerId
      )}`,
      title: "EEO-1",
      kind: "-",
      fields:
        "Employee ID, First Name, Last Name, Gender, Race / Ethnicity, Job Category, Hire Date, Location / Establishment",
      exportHref: `/api/reports/employees/eeo-1?format=csv&customerId=${encodeURIComponent(
        customerId
      )}`,
    },
    {
      href: `/reporting/employees/vets-4212?customerId=${encodeURIComponent(
        customerId
      )}`,
      title: "VETS-4212",
      kind: "-",
      fields:
        "Employee ID, First Name, Last Name, Job Title, Department, Hire Date, Veteran Status, Location",
      exportHref: `/api/reports/employees/vets-4212?format=csv&customerId=${encodeURIComponent(
        customerId
      )}`,
    },
    {
      href: `/reporting/employees/benefit-eligibility?customerId=${encodeURIComponent(
        customerId
      )}`,
      title: "Benefit Eligibility / Carrier Feed",
      kind: "-",
      fields:
        "Employee ID, First Name, Last Name, Date of Birth, Gender, Marital Status, Address, Hire Date",
      exportHref: `/api/reports/employees/benefit-eligibility?format=csv&customerId=${encodeURIComponent(
        customerId
      )}`,
    },
    {
      href: `/reporting/employees/payroll-tax-demographics?customerId=${encodeURIComponent(
        customerId
      )}`,
      title: "Payroll & Tax Demographics",
      kind: "-",
      fields:
        "Employee ID, First Name, Last Name, SSN (masked), Address, State of Residence, Work Location State, Federal Filing Status",
      exportHref: `/api/reports/employees/payroll-tax-demographics?format=csv&customerId=${encodeURIComponent(
        customerId
      )}`,
    },
    {
      href: `/reporting/employees/turnover-termination?customerId=${encodeURIComponent(
        customerId
      )}`,
      title: "Turnover / Termination Demographics",
      kind: "-",
      fields:
        "Employee ID, First Name, Last Name, Hire Date, Termination Date, Job Title, Department, Location",
      exportHref: `/api/reports/employees/turnover-termination?format=csv&customerId=${encodeURIComponent(
        customerId
      )}`,
    },
    {
      href: `/reporting/employees/custom-demographic-analytics?customerId=${encodeURIComponent(
        customerId
      )}`,
      title: "Custom Demographic Analytics",
      kind: "-",
      fields:
        "Employee ID, Gender, Race / Ethnicity, Age, Tenure, Department, Location, Employment Type",
      exportHref: `/api/reports/employees/custom-demographic-analytics?format=csv&customerId=${encodeURIComponent(
        customerId
      )}`,
    },
  ];

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Reports</h1>

      {/* Employee group */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Employee</h2>
          <a
            className="text-sm underline"
            href={`/reporting/employees?customerId=${encodeURIComponent(
              customerId
            )}`}
          >
            View Employee group &rarr;
          </a>
        </div>

        <div className="rounded border divide-y">
          <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 text-sm font-medium">
            <div className="col-span-5">Report</div>
            <div className="col-span-1">Kind</div>
            <div className="col-span-4">Fields</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {employee.map((r) => (
            <div key={r.title} className="grid grid-cols-12 gap-4 p-3 items-center">
              <div className="col-span-5">
                <a href={r.href} className="underline">
                  {r.title}
                </a>
              </div>
              <div className="col-span-1">{r.kind}</div>
              <div className="col-span-4 text-sm">{r.fields}</div>
              <div className="col-span-2 flex justify-end gap-2">
                <a className="px-3 py-1 border rounded text-sm" href={r.href}>
                  Preview
                </a>
                <a className="px-3 py-1 border rounded text-sm" href={r.exportHref}>
                  Export
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leave your existing Checks / Jobs / Salary / Timecards sections as-is below */}
    </div>
  );
}
