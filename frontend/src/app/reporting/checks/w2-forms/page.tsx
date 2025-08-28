import GenericReportTable from "@/features/reports/GenericReportTable";
import type { SP } from "@/app/reporting/_pageHelpers";
import { parseParams } from "@/app/reporting/_pageHelpers";

export default async function Page({ searchParams }: { searchParams: SP }) {
  const { start, end, customerId } = parseParams(await searchParams);
  return (
    <GenericReportTable
      title="W-2 Forms"
      reportId="checks/w2-forms"
      customerId={customerId}
      start={start}
      end={end}
      columns={[
        { key: "employeeName", label: "Employee" },
        { key: "taxYear", label: "Year" },
        { key: "ssnMasked", label: "SSN (masked)" },
        { key: "wages", label: "Wages", align: "right" },
        { key: "federalTaxWithheld", label: "Fed Tax", align: "right" },
        { key: "state", label: "State" },
        { key: "stateWages", label: "State Wages", align: "right" },
      ]}
    />
  );
}
