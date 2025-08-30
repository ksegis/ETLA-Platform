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

export default async function SalaryReports({ searchParams }: PageProps) {
  const resolved =
    searchParams && typeof (searchParams as any).then === "function"
      ? await (searchParams as Promise<Record<string, string | string[] | undefined>>)
      : ((searchParams ?? {}) as Record<string, string | string[] | undefined>);
  const customerId = getParam(resolved, "customerId", "DEMO");

  const reports = [
    {
      id: "salary/earnings-summary",
      title: "Earnings Summary",
      subtitle: "By employee and period",
      hasFacsimile: false,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "period_start", label: "Start" },
        { key: "period_end", label: "End" },
        { key: "regular_hours", label: "Reg Hrs" },
        { key: "overtime_hours", label: "OT Hrs" },
        { key: "earnings", label: "Earnings" },
      ],
    },
    {
      id: "salary/earnings-detail",
      title: "Earnings Detail",
      subtitle: "Line-level earnings",
      hasFacsimile: false,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "earn_code", label: "Code" },
        { key: "hours", label: "Hours" },
        { key: "rate", label: "Rate" },
        { key: "amount", label: "Amount" },
        { key: "pay_date", label: "Pay Date" },
      ],
    },
    {
      id: "salary/deductions-summary",
      title: "Deductions Summary",
      subtitle: "Benefit & other deductions",
      hasFacsimile: false,
      columns: [
        { key: "employee_id", label: "Emp ID" },
        { key: "employee_name", label: "Name" },
        { key: "deduction_code", label: "Code" },
        { key: "deduction_name", label: "Deduction" },
        { key: "amount", label: "Amount" },
        { key: "ytd_amount", label: "YTD" },
      ],
    },
    {
      id: "salary/tax-liabilities",
      title: "Tax Liabilities",
      subtitle: "Employer tax obligations",
      hasFacsimile: false,
      columns: [
        { key: "jurisdiction", label: "Jurisdiction" },
        { key: "tax_type", label: "Tax Type" },
        { key: "period_start", label: "Start" },
        { key: "period_end", label: "End" },
        { key: "amount", label: "Amount" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Salary & Taxes</h1>
        <Link href="/reporting" className="text-sm text-blue-600 hover:underline">
          ← Back to all groups
        </Link>
      </div>
      <ReportGrid customerId={customerId} reports={reports as any} />
    </div>
  );
}
