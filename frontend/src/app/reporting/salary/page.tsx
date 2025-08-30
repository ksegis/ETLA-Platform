// src/app/reporting/salary/page.tsx
import ReportGrid from "@/app/reporting/_components/ReportGrid";

export default async function Page({ searchParams }: any) {
  const sp = (await searchParams) ?? {};
  const customerId = typeof sp?.customerId === "string" ? sp.customerId : "DEMO";

  const salaryReports = [
    {
      id: "salary/earnings-summary",
      title: "Earnings Summary",
      description: "Totals by employee and period",
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "name", label: "Employee" },
        { key: "period_start", label: "Start" },
        { key: "period_end", label: "End" },
        { key: "regular_hours", label: "Reg Hrs" },
        { key: "ot_hours", label: "OT Hrs" },
        { key: "gross_pay", label: "Gross" },
      ],
    },
    {
      id: "salary/earnings-detail",
      title: "Earnings Detail",
      description: "Line-item earnings by code",
      columns: [
        { key: "employee_id", label: "Employee ID" },
        { key: "name", label: "Employee" },
        { key: "earning_code", label: "Code" },
        { key: "hours", label: "Hours" },
        { key: "rate", label: "Rate" },
        { key: "amount", label: "Amount" },
        { key: "pay_date", label: "Pay Date" },
      ],
    },
  ];

  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={salaryReports} />
    </div>
  );
}
