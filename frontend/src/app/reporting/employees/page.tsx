// src/app/reporting/employees/page.tsx
import Link from "next/link";

const EMPLOYEE_REPORTS = [
  {
    slug: "employee-master-demographics",
    title: "Employee Master Demographics",
    desc: "Reference profile for HR, managers, and audits.",
  },
  {
    slug: "eeo-1",
    title: "EEO-1",
    desc: "EEO-1 workforce composition by establishment and category.",
  },
  {
    slug: "vets-4212",
    title: "VETS-4212",
    desc: "Federal contractor veteran employment report.",
  },
  {
    slug: "benefit-eligibility",
    title: "Benefit Eligibility / Carrier Feed",
    desc: "Demographics for benefits enrollment and ACA compliance.",
  },
  {
    slug: "payroll-tax-demographics",
    title: "Payroll & Tax Demographics",
    desc: "Verification of payroll setup & tax filing readiness.",
  },
  {
    slug: "turnover-termination",
    title: "Turnover / Termination Demographics",
    desc: "Exit tracking for retention and trend analysis.",
  },
  {
    slug: "custom-demographic-analytics",
    title: "Custom Demographic Analytics",
    desc: "Age, tenure, diversity and workforce mix.",
  },
];

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Employee Reports</h1>
      <div className="divide-y rounded-xl border">
        {EMPLOYEE_REPORTS.map((r) => (
          <div key={r.slug} className="p-4 hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  <Link
                    className="underline underline-offset-2"
                    href={`/reporting/employees/${r.slug}`}
                  >
                    {r.title}
                  </Link>
                </div>
                <div className="text-sm text-muted-foreground">{r.desc}</div>
              </div>
              <div className="flex gap-2">
                <Link
                  className="text-sm underline underline-offset-2"
                  href={`/reporting/employees/${r.slug}`}
                >
                  Preview
                </Link>
                <a
                  className="text-sm underline underline-offset-2"
                  href={`/api/reports/employees/${r.slug}?format=csv`}
                >
                  Export
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
