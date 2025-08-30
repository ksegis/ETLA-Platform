// src/app/reporting/checks/page.tsx
import ReportGrid from "@/app/reporting/_components/ReportGrid";

export default async function Page({ searchParams }: any) {
  const sp = (await searchParams) ?? {};
  const customerId = typeof sp?.customerId === "string" ? sp.customerId : "DEMO";

  const checksReports = [
    {
      id: "checks/pay-statements",
      title: "Pay Statements",
      description: "Net pay by employee & period",
      hasFacsimile: true,
      columns: [
        { key: "check_number", label: "Check #" },
        { key: "employee_id", label: "Employee ID" },
        { key: "employee_name", label: "Employee" },
        { key: "pay_date", label: "Pay Date" },
        { key: "pay_period_start", label: "Start" },
        { key: "pay_period_end", label: "End" },
        { key: "net_pay", label: "Net Pay" },
        { key: "deposit_last4", label: "Acct Last 4" },
      ],
    },
    {
      id: "checks/check-register",
      title: "Check Register",
      description: "Issued checks and voids",
      hasFacsimile: true,
      columns: [
        { key: "check_number", label: "Check #" },
        { key: "employee_id", label: "Employee ID" },
        { key: "employee_name", label: "Employee" },
        { key: "gross_pay", label: "Gross" },
        { key: "taxes", label: "Taxes" },
        { key: "net_pay", label: "Net" },
        { key: "pay_date", label: "Pay Date" },
        { key: "status", label: "Status" },
      ],
    },
    {
      id: "checks/direct-deposit-register",
      title: "Direct Deposit Register",
      description: "ACH distributions by employee",
      hasFacsimile: true,
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "employee_name", label: "Employee" },
        { key: "pay_date", label: "Pay Date" },
        { key: "amount", label: "Amount" },
        { key: "deposit_last4", label: "Acct Last 4" },
        { key: "routing_last4", label: "Routing Last 4" },
      ],
    },
    {
      id: "checks/garnishment-register",
      title: "Garnishment Register",
      description: "Deductions by order",
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "employee_name", label: "Employee" },
        { key: "garnishment_type", label: "Type" },
        { key: "amount", label: "Amount" },
        { key: "pay_date", label: "Pay Date" },
        { key: "case_number", label: "Case #" },
      ],
    },
    {
      id: "checks/payroll-tax-liability",
      title: "Payroll Tax Liability",
      description: "Totals by period and agency",
      columns: [
        { key: "period_start", label: "Start" },
        { key: "period_end", label: "End" },
        { key: "federal_tax", label: "Federal" },
        { key: "state_tax", label: "State" },
        { key: "fica_tax", label: "FICA" },
        { key: "total_tax", label: "Total" },
      ],
    },
    {
      id: "checks/w2-forms",
      title: "W-2 Forms",
      description: "Annual wage & tax summaries",
      hasFacsimile: true,
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "employee_name", label: "Employee" },
        { key: "tax_year", label: "Year" },
        { key: "wages", label: "Wages" },
        { key: "federal_tax", label: "Fed Tax" },
        { key: "ss_wages", label: "SS Wages" },
        { key: "medicare_wages", label: "Medicare Wages" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={checksReports} />
    </div>
  );
}
