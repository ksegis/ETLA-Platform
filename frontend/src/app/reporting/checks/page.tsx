import ReportGrid from "@/app/reporting/_components/ReportGrid";
import type { Col } from "@/features/reports/GenericReportTable";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const customerId =
    typeof sp.customerId === "string" ? sp.customerId : "DEMO";

  const checksReports: {
    id: string;
    title: string;
    description?: string;
    columns: Col[];
    hasFacsimile?: boolean;
  }[] = [
    {
      id: "checks/pay-statements",
      title: "Pay Statements",
      description: "Issued checks with net pay",
      hasFacsimile: true,
      columns: [
        { key: "checkNumber", label: "Check #" },
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee" },
        { key: "payDate", label: "Pay Date" },
        { key: "netPay", label: "Net Pay" },
        { key: "depositLast4", label: "Acct Last 4" },
      ],
    },
    {
      id: "checks/check-register",
      title: "Check Register",
      description: "Gross, tax, deductions, net",
      columns: [
        { key: "checkNumber", label: "Check #" },
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee" },
        { key: "payDate", label: "Pay Date" },
        { key: "grossPay", label: "Gross" },
        { key: "taxes", label: "Taxes" },
        { key: "deductions", label: "Deductions" },
        { key: "netPay", label: "Net" },
      ],
    },
    {
      id: "checks/direct-deposit-register",
      title: "Direct Deposit Register",
      description: "ACH payouts",
      columns: [
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee" },
        { key: "payDate", label: "Pay Date" },
        { key: "netPay", label: "Net Pay" },
        { key: "depositLast4", label: "Acct Last 4" },
      ],
    },
    {
      id: "checks/w2-forms",
      title: "W-2 Forms",
      description: "Year-end wage & tax statements",
      hasFacsimile: true,
      columns: [
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee" },
        { key: "taxYear", label: "Tax Year" },
        { key: "wages", label: "Wages" },
        { key: "taxWithheld", label: "Tax Withheld" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={checksReports} />
    </div>
  );
}
