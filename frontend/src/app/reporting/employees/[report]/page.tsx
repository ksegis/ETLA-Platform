// src/app/reporting/employees/[report]/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!;

type Col = { key: string; label: string };

const MAP: Record<string, { title: string; view: string; columns: Col[] }> = {
  "employee-master-demographics": {
    title: "Employee Master Demographics",
    view: "vw_employee_master_demographics",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "employment_status", label: "Status" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "job_title", label: "Job Title" },
      { key: "hire_date", label: "Hire Date" },
      { key: "term_date", label: "Term Date" },
    ],
  },
  "eeo-1": {
    title: "EEO-1",
    view: "vw_eeo1",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "gender", label: "Gender" },
      { key: "race_ethnicity", label: "Race/Ethnicity" },
      { key: "job_category", label: "Job Category" },
      { key: "establishment", label: "Establishment" },
    ],
  },
  "vets-4212": {
    title: "VETS-4212",
    view: "vw_vets_4212",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "job_title", label: "Job Title" },
      { key: "department", label: "Department" },
      { key: "hire_date", label: "Hire Date" },
      { key: "veteran_status", label: "Veteran Status" },
      { key: "location", label: "Location" },
    ],
  },
  "benefit-eligibility": {
    title: "Benefit Eligibility / Carrier Feed",
    view: "vw_benefit_eligibility",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "date_of_birth", label: "DOB" },
      { key: "gender", label: "Gender" },
      { key: "marital_status", label: "Marital Status" },
      { key: "address", label: "Address" },
      { key: "hire_date", label: "Hire Date" },
    ],
  },
  "payroll-tax-demographics": {
    title: "Payroll & Tax Demographics",
    view: "vw_payroll_tax_demographics",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "ssn_masked", label: "SSN (masked)" },
      { key: "state_of_residence", label: "State of Residence" },
      { key: "work_location_state", label: "Work Location State" },
      { key: "federal_filing_status", label: "Federal Filing Status" },
    ],
  },
  "turnover-termination": {
    title: "Turnover / Termination Demographics",
    view: "vw_turnover_termination",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "hire_date", label: "Hire Date" },
      { key: "termination_date", label: "Termination Date" },
      { key: "job_title", label: "Job Title" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
    ],
  },
  "custom-demographic-analytics": {
    title: "Custom Demographic Analytics",
    view: "vw_custom_demographic_analytics",
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "gender", label: "Gender" },
      { key: "race_ethnicity", label: "Race/Ethnicity" },
      { key: "age", label: "Age" },
      { key: "tenure_months", label: "Tenure (mo)" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "employment_type", label: "Employment Type" },
    ],
  },
};

// Avoid PageProps typing; unwrap if Promises (Next 15).
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

  const { data: rows, error } = await supabase
    .from(cfg.view)
    .select("*")
    .eq("customer_id", customerId)
    .limit(2000);

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
      <GenericReportTable
        columns={cfg.columns}
        rows={rows ?? []}
        keyField="employee_id"
      />
    </div>
  );
}
