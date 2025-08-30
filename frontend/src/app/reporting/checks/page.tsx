// src/app/reporting/checks/page.tsx
import ReportGrid from "@/app/reporting/_components/ReportGrid";

export default async function Page({ searchParams }: any) {
  const sp = (await searchParams) ?? {};
  const customerId =
    typeof sp?.customerId === "string" ? sp.customerId : "DEMO";

  const checksReports = [
    {
      id: "checks/pay-statements",
      title: "Pay Statements",
      description: "Net pay by check/direct deposit",
      hasFacsimile: true,
      columns: [
        { key: "check_number", label: "Check #" },
        { key: "employee_id", label: "Employee ID" },
        { key: "employee_name", label: "Employee" },
        { key: "pay_date", label: "Pay Date" },
        { key: "net_pay", label: "Net Pay" },
        { key: "deposit_last4", label: "Acct Last4" },
      ],
    },
    {
      id: "checks/check-register",
      title: "Check Register",
      description: "All checks issued",
      columns: [
        { key: "check_number", label: "Check #" },
        { key: "pay_date", label: "Pay Date" },
        { key: "employee_id", label: "Employee ID" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
      ],
    },
    {
      id: "checks/direct-deposit-register",
      title: "Direct Deposit Register",
      description: "ACH payments",
      columns: [
        { key: "trace_number", label: "Trace #" },
        { key: "pay_date", label: "Pay Date" },
        { key: "employee_id", label: "Employee ID" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
      ],
    },
    {
      id: "checks/payroll-tax-liability",
      title: "Payroll Tax Liability",
      description: "Employer tax obligations",
      columns: [
        { key: "period_end", label: "Period End" },
        { key: "federal", label: "Federal" },
        { key: "state", label: "State" },
        { key: "local", label: "Local" },
        { key: "total", label: "Total" },
      ],
    },
    {
      id: "checks/garnishment-register",
      title: "Garnishment Register",
      description: "Wage garnishments",
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "order_id", label: "Order ID" },
        { key: "pay_date", label: "Pay Date" },
        { key: "amount", label: "Amount" },
        { key: "balance", label: "Balance" },
      ],
    },
    {
      id: "checks/w2-forms",
      title: "W-2 Forms",
      description: "Annual W-2s",
      hasFacsimile: true,
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "tax_year", label: "Year" },
        { key: "wages", label: "Wages" },
        { key: "federal_tax", label: "Fed Tax" },
        { key: "state_tax", label: "State Tax" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={checksReports} />
    </div>
  );
}
