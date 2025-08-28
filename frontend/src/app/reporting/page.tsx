// src/app/reporting/page.tsx
import Link from "next/link";

type ReportRow = {
  id: string;        // api/page id, e.g. "checks/pay-statements"
  name: string;      // display name
  kind: string;      // pay | table | w2 | etc.
  fields: string;    // short description of the data/columns
  description?: string;
};

const DEFAULT_CUST = process.env.NEXT_PUBLIC_DEMO_CUSTOMER_ID ?? "DEMO";

const GROUPS: { key: string; title: string; rows: ReportRow[] }[] = [
  {
    key: "employees",
    title: "Employee",
    rows: [
      {
        id: "employees/roster",
        name: "Employee Roster",
        kind: "table",
        fields:
          "Employee, Status, Dept, Title, Location, Hire, Term",
      },
      {
        id: "employees/active",
        name: "Employee – Active",
        kind: "table",
        fields:
          "Active employees with core profile fields",
      },
    ],
  },
  {
    key: "checks",
    title: "Checks",
    rows: [
      {
        id: "checks/pay-statements",
        name: "Pay Statements",
        kind: "pay",
        fields:
          "Check #, Employee, Pay Date, Period Start/End, Net Pay, Deposit (last 4)",
        description: "Individual employee pay stubs (facsimile view).",
      },
      {
        id: "checks/check-register",
        name: "Check Register",
        kind: "table",
        fields:
          "Check #, Employee, Pay Date, Gross, Taxes, Deductions, Net",
      },
      {
        id: "checks/direct-deposit-register",
        name: "Direct Deposit Register",
        kind: "table",
        fields:
          "Employee, Pay Date, Amount, Bank, Account Type, Account Last4",
      },
      {
        id: "checks/w2-forms",
        name: "W-2 Forms",
        kind: "w2",
        fields:
          "Employee, Tax Year, SSN (masked), Wages, Federal Withheld, State, State Wages",
      },
      {
        id: "checks/garnishment-register",
        name: "Garnishment Register",
        kind: "table",
        fields:
          "Employee, Order Type, Case #, Pay Date, Amount, YTD",
      },
      {
        id: "checks/payroll-tax-liability",
        name: "Payroll Tax Liability",
        kind: "table",
        fields:
          "Tax, Period End, Liability, Deposit Due, Deposited, Status",
      },
    ],
  },
  {
    key: "jobs",
    title: "Jobs",
    rows: [
      {
        id: "jobs/job-roster",
        name: "Job Roster",
        kind: "table",
        fields:
          "Job Code, Job Name, Status, Dept, Start, End",
      },
      {
        id: "jobs/job-costing",
        name: "Job Costing",
        kind: "table",
        fields:
          "Job, Period Start/End, Hours, Labor $, Burden $, Total $",
      },
    ],
  },
  {
    key: "salary",
    title: "Salary",
    rows: [
      {
        id: "salary/earnings-summary",
        name: "Earnings Summary",
        kind: "table",
        fields:
          "Employee, Period Start/End, Regular Hrs, OT Hrs, Gross",
      },
      {
        id: "salary/earnings-detail",
        name: "Earnings Detail",
        kind: "table",
        fields:
          "Employee, Pay Date, Code, Hours, Rate, Amount",
      },
    ],
  },
  {
    key: "timecards",
    title: "Timecards",
    rows: [
      {
        id: "timecards/timesheet-summary",
        name: "Timesheet Summary",
        kind: "table",
        fields:
          "Employee, Period Start/End, Total Hours, OT Hours",
      },
      {
        id: "timecards/timesheet-detail",
        name: "Timesheet Detail",
        kind: "table",
        fields:
          "Employee, Work Date, Project, Job, Hours, Pay Code",
      },
    ],
  },
];

export default function ReportingHomePage() {
  return (
    <main className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Reports</h1>

      {GROUPS.map((g) => (
        <section key={g.key} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{g.title}</h2>
            <Link href={`/reporting/${g.key}`} className="text-sm underline">
              View {g.title} group →
            </Link>
          </div>

          {!g.rows.length ? (
            <div className="text-gray-500">No reports in this group.</div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 text-left w-[36%]">Report</th>
                  <th className="border p-2 text-left w-[10%]">Kind</th>
                  <th className="border p-2 text-left">Fields</th>
                  <th className="border p-2 text-left w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r) => (
                  <tr key={r.id}>
                    <td className="border p-2">
                      <div className="font-medium">{r.name}</div>
                      {r.description && (
                        <div className="text-gray-500">{r.description}</div>
                      )}
                    </td>
                    <td className="border p-2">{r.kind}</td>
                    <td className="border p-2">{r.fields}</td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        {/* Preview goes to the report page */}
                        <Link
                          href={`/reporting/${r.id}?customerId=${encodeURIComponent(
                            DEFAULT_CUST
                          )}`}
                          prefetch={false}
                          className="rounded px-2 py-1 border hover:bg-gray-50"
                        >
                          Preview
                        </Link>

                        {/* Export hits API directly */}
                        <a
                          href={`/api/reports/${r.id}/export?customerId=${encodeURIComponent(
                            DEFAULT_CUST
                          )}`}
                          className="rounded px-2 py-1 border hover:bg-gray-50"
                        >
                          Export
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </main>
  );
}
