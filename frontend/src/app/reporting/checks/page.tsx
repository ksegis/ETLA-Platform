import Link from "next/link";
import ReportGrid from "@/app/reporting/_components/ReportGrid";

type PageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function getParam(
  obj: Record<string, string | string[] | undefined> | undefined,
  key: string,
  fallback = ""
) {
  const v = obj?.[key];
  return Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback);
}

export default async function ChecksReports({ searchParams }: PageProps) {
  const resolved =
    searchParams && typeof (searchParams as any).then === "function"
      ? await (searchParams as Promise<Record<string, string | string[] | undefined>>)
      : ((searchParams ?? {}) as Record<string, string | string[] | undefined>);
  const customerId = getParam(resolved, "customerId", "DEMO");

  const reports = [
    {
      id: "checks/pay-statements",
      title: "Pay Statements",
      subtitle: "Employee pay stubs within range",
      hasFacsimile: true,
      columns: [
        { key: "check_number", label: "Check #" },
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "pay_date", label: "Pay Date" },
        { key: "net_pay", label: "Net Pay" },
        { key: "deposit_last4", label: "Acct ••••" },
      ],
    },
    {
      id: "checks/check-register",
      title: "Check Register",
      subtitle: "All checks for the period",
      hasFacsimile: false,
      columns: [
        { key: "check_number", label: "Check #" },
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "pay_date", label: "Pay Date" },
        { key: "gross_pay", label: "Gross" },
        { key: "taxes", label: "Taxes" },
        { key: "deductions", label: "Deductions" },
        { key: "net_pay", label: "Net" },
      ],
    },
    {
      id: "checks/direct-deposit-register",
      title: "Direct Deposit Register",
      subtitle: "ACH payments summary",
      hasFacsimile: false,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "pay_date", label: "Pay Date" },
        { key: "net_pay", label: "Amount" },
        { key: "deposit_last4", label: "Acct ••••" },
      ],
    },
    {
      id: "checks/garnishment-register",
      title: "Garnishment Register",
      subtitle: "Ordered deductions detail",
      hasFacsimile: false,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "order_type", label: "Type" },
        { key: "order_number", label: "Order #" },
        { key: "pay_date", label: "Pay Date" },
        { key: "amount", label: "Amount" },
        { key: "ytd_amount", label: "YTD" },
      ],
    },
    {
      id: "checks/w2-forms",
      title: "W-2 Forms",
      subtitle: "Year-end forms by employee",
      hasFacsimile: true,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "tax_year", label: "Year" },
        { key: "wages", label: "Wages" },
        { key: "federal_tax", label: "Fed Tax" },
        { key: "state_tax", label: "State Tax" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Checks & Payroll Outputs</h1>
        <Link href="/reporting" className="text-sm text-blue-600 hover:underline">
          ← Back to all groups
        </Link>
      </div>
      <ReportGrid customerId={customerId} reports={reports as any} />
    </div>
  );
}
