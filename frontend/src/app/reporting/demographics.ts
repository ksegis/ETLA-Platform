// Lightweight report definitions for Demographics.
// No app-specific types on purpose to avoid type friction.
const DEMOGRAPHIC_REPORTS = [
  {
    id: "emp_master_demo",
    title: "Employee Master Demographics",
    group: "employee",
    category: "Demographics",
    kind: "table",
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Middle Initial",
      "Preferred Name",
      "Date of Birth",
      "Gender",
      "Marital Status",
      "Social Security Number (masked)",
      "Address (Street, City, State, Zip)",
      "Personal Email",
      "Personal Phone",
      "Emergency Contact (Name, Relationship, Phone)",
      "Hire Date",
      "Employment Status",
      "Termination Date",
      "Job Title",
      "Department",
      "Location",
    ],
    description:
      "General reference for HR, managers, and audits. Includes personal and job info with masked SSN.",
  },

  {
    id: "eeo_1",
    title: "EEO-1",
    group: "employee",
    category: "Demographics",
    kind: "table",
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Gender",
      "Race / Ethnicity",
      "Job Category (EEO category)",
      "Hire Date",
      "Location / Establishment",
      "Employment Status",
    ],
    description:
      "Equal Employment Opportunity compliance snapshot by job category and establishment.",
  },

  {
    id: "vets_4212",
    title: "VETS-4212",
    group: "employee",
    category: "Demographics",
    kind: "table",
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Job Title",
      "Department",
      "Hire Date",
      "Veteran Status",
      "Location",
    ],
    description:
      "Federal contractor veteran reporting with basic job/department context.",
  },

  {
    id: "benefit_eligibility",
    title: "Benefit Eligibility / Carrier Feed",
    group: "employee",
    category: "Demographics",
    kind: "table",
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Date of Birth",
      "Gender",
      "Marital Status",
      "Address (Street, City, State, Zip)",
      "Hire Date",
      "Employment Status",
      "Benefit Eligibility Date",
      "Dependent Info (Name, DOB, Relationship, Gender)",
      "Coverage Level",
    ],
    description:
      "Demographics for benefits and ACA. Dependents summarized in a single field for preview/export.",
  },

  {
    id: "payroll_tax_demo",
    title: "Payroll & Tax Demographics",
    group: "employee",
    category: "Demographics",
    kind: "table",
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "SSN (masked)",
      "Address (Street, City, State, Zip)",
      "State of Residence",
      "Work Location State",
      "Federal Filing Status",
      "State Filing Status",
      "Number of Allowances / Dependents",
      "Direct Deposit Bank Info (masked, last 4 digits only)",
    ],
    description:
      "Payroll verification/tax readiness. Masks SSN and bank data by default.",
  },

  {
    id: "turnover_demo",
    title: "Turnover / Termination Demographics",
    group: "employee",
    category: "Demographics",
    kind: "table",
    fields: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Hire Date",
      "Termination Date",
      "Job Title",
      "Department",
      "Location",
      "Employment Status at Exit",
      "Termination Reason / Code",
      "Gender",
      "Race / Ethnicity",
    ],
    description:
      "Tracks exits and trends across org units with EEOC demographic context.",
  },

  {
    id: "custom_demo_analytics",
    title: "Custom Demographic Analytics",
    group: "employee",
    category: "Demographics",
    kind: "table",
    fields: [
      "Employee ID",
      "Gender",
      "Race / Ethnicity",
      "Age",
      "Tenure",
      "Department",
      "Location",
      "Employment Type",
    ],
    description:
      "Planning/diversity tracking. Age and tenure are calculated from DOB and Hire Date.",
  },
];

export default DEMOGRAPHIC_REPORTS;
export const DEMOGRAPHIC_IDS: string[] = DEMOGRAPHIC_REPORTS.map((r) => r.id);
