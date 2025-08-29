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

  const salaryReports: {
    id: string;
    title: string;
    description?: string;
    columns: Col[];
  }[] = [
    {
      id: "salary/earnings-detail",
      title: "Earnings Detail",
      description: "Line-level earnings transactions",
      columns: [
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee" },
        { key: "payDate", label: "Pay Date" },
        { key: "earningCode", label: "Code" },
        { key: "hours", label: "Hours" },
        { key: "amount", label: "Amount" },
      ],
    },
    {
      id: "salary/earnings-summary",
      title: "Earnings Summary",
      description: "Summarized by employee/period",
      columns: [
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee" },
        { key: "period", label: "Period" },
        { key: "totalHours", label: "Hours" },
        { key: "totalAmount", label: "Amount" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={salaryReports} />
    </div>
  );
}
