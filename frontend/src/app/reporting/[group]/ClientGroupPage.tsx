"use client";

import Link from "next/link";

const DEFAULT_CUST = process.env.NEXT_PUBLIC_DEMO_CUSTOMER_ID ?? "DEMO";

const REPORTS_BY_GROUP: Record<string, { id: string; name: string; kind: string; desc: string }[]> = {
  checks: [
    { id: "checks/pay-statements",          name: "Pay Statements",          kind: "pay",   desc: "Individual employee pay stubs." },
    { id: "checks/check-register",          name: "Check Register",          kind: "table", desc: "Issued checks and direct deposits." },
    { id: "checks/direct-deposit-register", name: "Direct Deposit Register", kind: "table", desc: "ACH distribution by account." },
    { id: "checks/w2-forms",                name: "W-2 Forms",               kind: "w2",    desc: "W-2 facsimiles and amounts." },
    { id: "checks/garnishment-register",    name: "Garnishment Register",    kind: "table", desc: "Garnishment deductions by pay date." },
    { id: "checks/payroll-tax-liability",   name: "Payroll Tax Liability",   kind: "table", desc: "Tax liabilities and deposits." },
  ],
  employees: [
    { id: "employees/roster", name: "Employee Roster", kind: "table", desc: "All employees with status and details." },
    { id: "employees/active", name: "Employee – Active", kind: "table", desc: "Active employees only." },
  ],
  jobs: [
    { id: "jobs/job-roster",  name: "Job Roster",  kind: "table", desc: "Job codes, names and status." },
    { id: "jobs/job-costing", name: "Job Costing", kind: "table", desc: "Costs and hours by job and period." },
  ],
  salary: [
    { id: "salary/earnings-summary", name: "Earnings Summary", kind: "table", desc: "Summary of earnings by period." },
    { id: "salary/earnings-detail",  name: "Earnings Detail",  kind: "table", desc: "Earning line items by pay date." },
  ],
  timecards: [
    { id: "timecards/timesheet-summary", name: "Timesheet Summary", kind: "table", desc: "Hours by employee and period." },
    { id: "timecards/timesheet-detail",  name: "Timesheet Detail",  kind: "table", desc: "Daily time punches and allocations." },
  ],
};

export default function ClientGroupPage({ params }: { params: { group: string } }) {
  const group = (params?.group ?? "").toLowerCase();
  const rows = REPORTS_BY_GROUP[group] ?? [];

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{group.charAt(0).toUpperCase()+group.slice(1)} Reports</h1>
        <a href="/reporting" className="rounded px-3 py-1.5 border">← Back</a>
      </div>

      {!rows.length ? (
        <div className="text-gray-500">No reports in this group.</div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left w-[36%]">Report</th>
              <th className="border p-2 text-left w-[10%]">Kind</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left w-[180px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="border p-2 font-medium">{r.name}</td>
                <td className="border p-2">{r.kind}</td>
                <td className="border p-2">{r.desc}</td>
                <td className="border p-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/reporting/${r.id}?customerId=${encodeURIComponent(DEFAULT_CUST)}`}
                      prefetch={false}
                      className="rounded px-2 py-1 border hover:bg-gray-50"
                    >
                      Preview
                    </Link>
                    <a
                      href={`/api/reports/${r.id}/export?customerId=${encodeURIComponent(DEFAULT_CUST)}`}
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
    </main>
  );
}
