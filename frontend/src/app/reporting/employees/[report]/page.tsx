// src/app/reporting/employees/[report]/page.tsx
import GenericReportTable from "@/features/reports/GenericReportTable";

type Col = { key: string; label: string };

const MAP: Record<string, { title: string; reportId: string; columns: Col[] }> = {
  "employee-master-demographics": {
    title: "Employee Master Demographics",
    reportId: "employees/employee-master-demographics",
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
    reportId: "employees/eeo-1",
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
    reportId: "employees/vets-4212",
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
    reportId: "employees/benefit-eligibility",
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
    reportId: "employees/payroll-tax-demographics",
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
    reportId: "employees/turnover-termination",
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
    reportId: "employees/custom-demographic-analytics",
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

// Avoid PageProps typing; unwrap Promises if Next supplies them.
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
  if (!cfg) return <div className="p-6 text-sm">Unknown report.</div>;

  const customerId = (searchParams?.customerId as string) ?? "DEMO";
  const start = (searchParams?.start as string) || undefined;
  const end = (searchParams?.end as string) || undefined;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{cfg.title}</h1>
        <a
          className="text-sm underline underline-offset-2"
          href={`/api/reports/${encodeURIComponent(
            cfg.reportId
          )}?format=csv&customerId=${encodeURIComponent(customerId)}${
            start ? `&start=${encodeURIComponent(start)}` : ""
          }${end ? `&end=${encodeURIComponent(end)}` : ""}`}
        >
          Export CSV
        </a>
      </div>

      <GenericReportTable
        title={cfg.title}
        reportId={cfg.reportId}
        customerId={customerId}
        start={start}
        end={end}
        columns={cfg.columns}
      />
    </div>
  );
}
