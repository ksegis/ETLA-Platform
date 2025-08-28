// src/app/reporting/employees/[report]/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!;

const MAP: Record<
  string,
  { title: string; view: string; columns: { key: string; header: string }[] }
> = {
  "employee-master-demographics": {
    title: "Employee Master Demographics",
    view: "vw_employee_master_demographics",
    columns: [
      { key: "employee_id", header: "Employee ID" },
      { key: "first_name", header: "First Name" },
      { key: "last_name", header: "Last Name" },
      { key: "employment_status", header: "Status" },
      { key: "department", header: "Department" },
      { key: "location", header: "Location" },
      { key: "job_title", header: "Job Title" },
      { key: "hire_date", header: "Hire Date" },
      { key: "term_date", header: "Term Date" },
    ],
  },
  "eeo-1": {
    title: "EEO-1",
    view: "vw_eeo1",
    columns: [
      { key: "employee_id", header: "Employee ID" },
      { key: "first_name", header: "First Name" },
      { key: "last_name", header: "Last Name" },
      { key: "gender", header: "Gender" },
      { key: "race_ethnicity", header: "Race/Ethnicity" },
      { key: "job_category", header: "Job Category" },
      { key: "establishment", header: "Establishment" },
    ],
  },
  "vets-4212": {
    title: "VETS-4212",
    view: "vw_vets_4212",
    columns: [
      { key: "employee_id", header: "Employee ID" },
      { key: "first_name", header: "First Name" },
      { key: "last_name", header: "Last Name" },
      { key: "job_title", header: "Job Title" },
      { key: "department", header: "Department" },
      { key: "hire_date", header: "Hire Date" },
      { key: "veteran_status", header: "Veteran Status" },
      { key: "location", header: "Location" },
    ],
  },
  "benefit-eligibility": {
    title: "Benefit Eligibility / Carrier Feed",
    view: "vw_benefit_eligibility",
    columns: [
      { key: "employee_id", header: "Employee ID" },
      { key: "first_name", header: "First Name" },
      { key: "last_name", header: "Last Name" },
      { key: "date_of_birth", header: "DOB" },
      { key: "gender", header: "Gender" },
      { key: "marital_status", header: "Marital Status" },
      { key: "address", header: "Address" },
      { key: "hire_date", header: "Hire Date" },
    ],
  },
  "payroll-tax-demographics": {
    title: "Payroll & Tax Demographics",
    view: "vw_payroll_tax_demographics",
    columns: [
      { key: "employee_id", header: "Employee ID" },
      { key: "first_name", header: "First Name" },
      { key: "last_name", header: "Last Name" },
      { key: "ssn_masked", header: "SSN (masked)" },
      { key: "state_of_residence", header: "State of Residence" },
      { key: "work_location_state", header: "Work Location State" },
      { key: "federal_filing_status", header: "Federal Filing Status" },
    ],
  },
  "turnover-termination": {
    title: "Turnover / Termination Demographics",
    view: "vw_turnover_termination",
    columns: [
      { key: "employee_id", header: "Employee ID" },
      { key: "first_name", header: "First Name" },
      { key: "last_name", header: "Last Name" },
      { key: "hire_date", header: "Hire Date" },
      { key: "termination_date", header: "Termination Date" },
      { key: "job_title", header: "Job Title" },
      { key: "department", header: "Department" },
      { key: "location", header: "Location" },
    ],
  },
  "custom-demographic-analytics": {
    title: "Custom Demographic Analytics",
    view: "vw_custom_demographic_analytics",
    columns: [
      { key: "employee_id", header: "Employee ID" },
      { key: "gender", header: "Gender" },
      { key: "race_ethnicity", header: "Race/Ethnicity" },
      { key: "age", header: "Age" },
      { key: "tenure_months", header: "Tenure (mo)" },
      { key: "department", header: "Department" },
      { key: "location", header: "Location" },
      { key: "employment_type", header: "Employment Type" },
    ],
  },
};

// NOTE: don't constrain the arg type to Next's PageProps; unwrap if Promises (Next 15).
export default async function Page(props: any) {
  const maybeParams = props?.params;
  const maybeSearch = props?.searchParams;

  const params =
    maybeParams && typeof maybeParams.then === "function"
      ? await maybeParams
      : maybeParams || {};
  const searchParams =
    maybeSearch && typeof maybeSearch.then === "function"
      ? await maybeSearch
      : maybeSearch || {};

  const report = params?.report as string;
  const cfg = MAP[report];
  if (!cfg) {
    return <div className="p-6 text-sm">Unknown report.</div>;
  }

  const customerId = (searchParams?.customerId as string) ?? "DEMO";
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  let query = supabase.from(cfg.view).select("*").eq("customer_id", customerId);
  // (Optional) add date filtering per view later if needed
  const { data: rows, error } = await query.limit(2000);

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        {cfg.title}: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{cfg.title}</h1>
        <a
          className="text-sm underline underline-offset-2"
          href={`/api/reports/employees/${encodeURIComponent(
            report
          )}?format=csv&customerId=${encodeURIComponent(customerId)}`}
        >
          Export CSV
        </a>
      </div>
      <GenericReportTable columns={cfg.columns} rows={rows ?? []} keyField="employee_id" />
    </div>
  );
}
