import Link from "next/link";

type ReportRow = {
  id: string;
  name: string;
  kind: string;
  fields: string;
};

const CHECKS: ReportRow[] = [
  {
    id: "checks/pay-statements",
    name: "Pay Statements",
    kind: "pay",
    fields:
      "Check Number, Employee ID, Employee Name, Pay Date, Pay Period Start, Pay Period End, Net Pay, Deposit (last 4)",
  },
  {
    id: "checks/check-register",
    name: "Check Register",
    kind: "table",
    fields:
      "Check Number, Employee ID, Employee Name, Pay Date, Gross Pay, Taxes, Deductions, Net Pay",
  },
  {
    id: "checks/direct-deposit-register",
    name: "Direct Deposit Register",
    kind: "table",
    fields:
      "Employee ID, Employee Name, Pay Date, Amount, Bank Name, Account Type, Account (last 4), Routing (masked)",
  },
];

export default function ReportingHomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Pay &amp; Checks Reports</h1>

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
          {CHECKS.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">
                <div className="font-medium">{r.name}</div>
                <div className="text-gray-500">
                  {r.id === "checks/pay-statements"
                    ? "Individual employee pay stubs (facsimile view)."
                    : r.id === "checks/check-register"
                    ? "Issued checks and direct deposits."
                    : "ACH distribution by account."}
                </div>
              </td>
              <td className="border p-2">{r.kind}</td>
              <td className="border p-2">{r.fields}</td>
              <td className="border p-2">
                <div className="flex gap-2">
                  {/* Preview → page for Pay Statements */}
                  {r.id === "checks/pay-statements" ? (
                    <Link
                      href="/reporting/checks/pay-statements"
                      prefetch={false}
                      className="rounded px-2 py-1 border hover:bg-gray-50"
                    >
                      Preview
                    </Link>
                  ) : (
                    <span
                      className="rounded px-2 py-1 border text-gray-400"
                      title="Preview not implemented yet"
                    >
                      Preview
                    </span>
                  )}

                  {/* Export → plain link (no onClick in server components) */}
                  <a
                    href={`/api/reports/${r.id}/export`}
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
    </main>
  );
}
