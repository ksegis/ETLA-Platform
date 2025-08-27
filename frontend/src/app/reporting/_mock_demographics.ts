// frontend/src/app/reporting/_mock_demographics.ts

// Synchronous mock row generator for demographic reports.
// Usage elsewhere can call either `getMockRows(id)` or `await getMockRows(id, filters, limit)`;
// it returns arrays (not Promises), so `await` is fine but unnecessary.

type Row = Record<string, any>;

/** Canonical IDs used by /reporting/_data.ts */
export const DEMOGRAPHIC_IDS = {
  EMPLOYEE_MASTER: "employee-master-demographics",
  EEO1: "eeo-1",
  VETS4212: "vets-4212",
  BENEFIT_ELIG: "benefit-eligibility",
  PAYROLL_TAX: "payroll-tax-demographics",
  TURNOVER: "turnover-termination",
  CUSTOM_ANALYTICS: "custom-demographic-analytics",
} as const;

type DemoId = (typeof DEMOGRAPHIC_IDS)[keyof typeof DEMOGRAPHIC_IDS];

// ---------- helpers ----------
const firstNames = [
  "Ava","Olivia","Emma","Sophia","Mia","Isabella","Noah","Liam","Mason","Ethan",
  "Lucas","Logan","Elijah","James","Alexander","Amelia","Harper","Evelyn","Ella","Abigail",
];
const lastNames = [
  "Anderson","Brown","Clark","Davis","Evans","Garcia","Harris","Jackson","Johnson","Jones",
  "Martinez","Miller","Moore","Robinson","Smith","Taylor","Thomas","Thompson","White","Williams",
];
const depts = ["Operations","Finance","HR","Sales","Marketing","Engineering","Support"];
const titles = [
  "Analyst","Specialist","Coordinator","Engineer I","Engineer II","Manager",
  "Sr. Manager","Director","VP","Technician",
];
const locations = ["NYC HQ","Austin Plant","Remote - US","Chicago Office","LA Office"];
const states = ["NY","TX","IL","CA","FL","WA","CO","MA","NJ","GA"];
const races = [
  "White","Black or African American","Hispanic or Latino","Asian",
  "Native Hawaiian or Other Pacific Islander","American Indian or Alaska Native","Two or More Races",
];
const genders = ["Male","Female","Non-Binary","Unspecified"] as const;
const maritalStatuses = ["Single","Married","Divorced","Widowed"] as const;
const filingStatusesFed = ["Single","Married Filing Jointly","Married Filing Separately","Head of Household"] as const;
const filingStatusesState = ["Single","Married","Head of Household","Other"] as const;
const employmentTypes = ["FT","PT","Seasonal","Contractor"] as const;

const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]) => arr[rndInt(0, arr.length - 1)];

const pad2 = (n: number) => String(n).padStart(2, "0");
const dateISO = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;
const randDate = (y1: number, y2: number) => {
  const y = rndInt(y1, y2);
  const m = rndInt(1, 12);
  const d = rndInt(1, 28);
  return dateISO(y, m, d);
};

const maskSSN = (ssn: string) => `***-**-${ssn.replace(/\D/g, "").slice(-4).padStart(4, "0")}`;
const bankLast4 = () => String(rndInt(0, 9999)).padStart(4, "0");
const phone = () => `(${rndInt(200, 989)}) ${rndInt(200, 989)}-${String(rndInt(0, 9999)).padStart(4, "0")}`;
const email = (first: string, last: string) =>
  `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "") + "@examplemail.com";
const address = () => ({
  street: `${rndInt(10, 9999)} ${pick([
    "Main","Oak","Pine","Maple","Cedar","Elm","Sunset","Ridge","Park","Lake",
  ])} ${pick(["St","Ave","Blvd","Rd"])}`,
  city: pick(["New York","Austin","Chicago","Los Angeles","Miami","Seattle","Denver","Boston","Newark","Atlanta"]),
  state: pick(states),
  zip: String(rndInt(10000, 99999)),
});

const ageFromDOB = (dobISO: string, asOfISO = "2025-01-01") => {
  const d1 = new Date(dobISO);
  const d2 = new Date(asOfISO);
  let a = d2.getFullYear() - d1.getFullYear();
  const m = d2.getMonth() - d1.getMonth();
  if (m < 0 || (m === 0 && d2.getDate() < d1.getDate())) a--;
  return a;
};
const yearsBetween = (startISO: string, endISO = "2025-01-01") => {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  return Math.max(0, +( (e - s) / (1000 * 60 * 60 * 24 * 365.25) ).toFixed(2));
};

const nameFor = (i: number) => {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[i % lastNames.length];
  const middle = String.fromCharCode(65 + (i % 26)); // A-Z
  return { first, last, middle };
};

// ---------- generators per report ----------

function genEmployeeMaster(i: number): Row {
  const id = String(10000 + i);
  const { first, last, middle } = nameFor(i);
  const pref = rndInt(0, 4) === 0 ? first.slice(0, 3) : first;
  const dob = randDate(1965, 2004);
  const gender = pick(genders);
  const marital = pick(maritalStatuses);
  const ssn = maskSSN(`${rndInt(100, 999)}-${rndInt(10, 99)}-${rndInt(1000, 9999)}`);
  const addr = address();
  const hire = randDate(2010, 2024);
  const status = pick(["Active","Terminated","LOA","Retired","Onboarding"]);
  const termDate = status === "Terminated" ? randDate(2020, 2025) : "";
  const job = pick(titles);
  const dept = pick(depts);
  const loc = pick(locations);
  const eName = `${pick(["Alex","Jamie","Taylor","Morgan","Casey"])} ${pick(["Lee","Reed","Nguyen","Patel","King"])}`;
  const eRel = pick(["Spouse","Parent","Sibling","Friend","Other"]);

  return {
    employeeId: id,
    firstName: first,
    lastName: last,
    middleInitial: middle,
    preferredName: pref,
    dateOfBirth: dob,
    gender,
    maritalStatus: marital,
    ssnMasked: ssn,
    addressStreet: addr.street,
    addressCity: addr.city,
    addressState: addr.state,
    addressZip: addr.zip,
    personalEmail: email(first, last),
    personalPhone: phone(),
    emergencyContact: `${eName} (${eRel}) ${phone()}`,
    hireDate: hire,
    employmentStatus: status,
    terminationDate: termDate,
    jobTitle: job,
    department: dept,
    location: loc,
  };
}

function genEEO1(i: number): Row {
  const id = String(10000 + i);
  const { first, last } = nameFor(i);
  const gender = pick(genders);
  const race = pick(races);
  const jobCat = pick([
    "1. Exec/Sr Officials & Mgrs",
    "2. First/Mid Officials & Mgrs",
    "3. Professionals",
    "4. Technicians",
    "5. Sales Workers",
    "6. Administrative Support",
    "7. Craft Workers",
    "8. Operatives",
    "9. Laborers & Helpers",
    "10. Service Workers",
  ]);
  const hire = randDate(2010, 2024);
  const loc = pick(locations);
  const status = pick(["Active","LOA","Terminated"]);
  return {
    employeeId: id,
    firstName: first,
    lastName: last,
    gender,
    raceEthnicity: race,
    jobCategory: jobCat,
    hireDate: hire,
    location: loc,
    employmentStatus: status,
  };
}

function genVets4212(i: number): Row {
  const id = String(10000 + i);
  const { first, last } = nameFor(i);
  const job = pick(titles);
  const dept = pick(depts);
  const hire = randDate(2010, 2024);
  const veteranStatus = pick(["Not a Veteran","Protected Veteran","Armed Forces Service Medal Vet","Recently Separated Vet"]);
  const loc = pick(locations);
  return {
    employeeId: id,
    firstName: first,
    lastName: last,
    jobTitle: job,
    department: dept,
    hireDate: hire,
    veteranStatus,
    location: loc,
  };
}

function genBenefitEligibility(i: number): Row {
  const id = String(10000 + i);
  const { first, last } = nameFor(i);
  const dob = randDate(1970, 2004);
  const gender = pick(genders);
  const marital = pick(maritalStatuses);
  const addr = address();
  const hire = randDate(2015, 2024);
  const empStatus = pick(["Full-time","Part-time","Seasonal","Contractor"]);
  const elig = randDate(2015, 2025);
  const depNames = [
    { n: "Jordan", g: "Male" },
    { n: "Riley", g: "Female" },
    { n: "Quinn", g: "Non-Binary" },
  ];
  const depCount = rndInt(0, 2);
  const coverage = pick([
    "Employee Only",
    "Employee + Spouse",
    "Employee + Child(ren)",
    "Family",
  ]);

  const base: Row = {
    employeeId: id,
    firstName: first,
    lastName: last,
    dateOfBirth: dob,
    gender,
    maritalStatus: marital,
    addressStreet: addr.street,
    addressCity: addr.city,
    addressState: addr.state,
    addressZip: addr.zip,
    hireDate: hire,
    employmentStatus: empStatus,
    benefitEligibilityDate: elig,
    coverageLevel: coverage,
  };

  for (let d = 0; d < depCount; d++) {
    const dn = depNames[d];
    base[`dependent${d + 1}Name`] = `${dn.n} ${last}`;
    base[`dependent${d + 1}DOB`] = randDate(2012, 2022);
    base[`dependent${d + 1}Relationship`] = pick(["Child","Spouse","Domestic Partner"]);
    base[`dependent${d + 1}Gender`] = dn.g;
  }
  return base;
}

function genPayrollTax(i: number): Row {
  const id = String(10000 + i);
  const { first, last } = nameFor(i);
  const ssn = maskSSN(`${rndInt(100, 999)}-${rndInt(10, 99)}-${rndInt(1000, 9999)}`);
  const addr = address();
  const stateRes = addr.state;
  const workState = pick(states);
  const fedStatus = pick(filingStatusesFed);
  const stStatus = pick(filingStatusesState);
  const allowances = rndInt(0, 5);
  return {
    employeeId: id,
    firstName: first,
    lastName: last,
    ssnMasked: ssn,
    addressStreet: addr.street,
    addressCity: addr.city,
    addressState: addr.state,
    addressZip: addr.zip,
    stateOfResidence: stateRes,
    workLocationState: workState,
    federalFilingStatus: fedStatus,
    stateFilingStatus: stStatus,
    allowances,
    directDepositLast4: bankLast4(),
  };
}

function genTurnover(i: number): Row {
  const id = String(10000 + i);
  const { first, last } = nameFor(i);
  const hire = randDate(2015, 2023);
  const term = randDate(2020, 2025);
  const job = pick(titles);
  const dept = pick(depts);
  const loc = pick(locations);
  const statusAtExit = pick(["Voluntary","Involuntary","Layoff","Retirement","Other"]);
  const reason = pick(["Better Pay","Attendance","Performance","Reductions","Retired","Personal"]);
  const gender = pick(genders);
  const race = pick(races);
  return {
    employeeId: id,
    firstName: first,
    lastName: last,
    hireDate: hire,
    terminationDate: term,
    jobTitle: job,
    department: dept,
    location: loc,
    employmentStatusAtExit: statusAtExit,
    terminationReason: reason,
    gender,
    raceEthnicity: race,
  };
}

function genCustomAnalytics(i: number): Row {
  const id = String(10000 + i);
  const { first, last } = nameFor(i);
  const dob = randDate(1970, 2004);
  const hire = randDate(2015, 2024);
  const dept = pick(depts);
  const loc = pick(locations);
  const gender = pick(genders);
  const race = pick(races);
  const empType = pick(employmentTypes);
  return {
    employeeId: id,
    gender,
    raceEthnicity: race,
    age: ageFromDOB(dob),
    tenureYears: yearsBetween(hire),
    department: dept,
    location: loc,
    employmentType: empType,
  };
}

// ---------- main dispatcher ----------

/**
 * Return mock rows for a demographic report.
 * @param id One of DEMOGRAPHIC_IDS values
 * @param filters Optional filters (e.g., { location: "NYC HQ" })
 * @param limit Number of rows (default 50)
 */
export function getMockRows(
  id: string,
  filters: Partial<Row> = {},
  limit = 50
): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < limit; i++) {
    let r: Row;
    switch (id as DemoId) {
      case DEMOGRAPHIC_IDS.EMPLOYEE_MASTER:
        r = genEmployeeMaster(i);
        break;
      case DEMOGRAPHIC_IDS.EEO1:
        r = genEEO1(i);
        break;
      case DEMOGRAPHIC_IDS.VETS4212:
        r = genVets4212(i);
        break;
      case DEMOGRAPHIC_IDS.BENEFIT_ELIG:
        r = genBenefitEligibility(i);
        break;
      case DEMOGRAPHIC_IDS.PAYROLL_TAX:
        r = genPayrollTax(i);
        break;
      case DEMOGRAPHIC_IDS.TURNOVER:
        r = genTurnover(i);
        break;
      case DEMOGRAPHIC_IDS.CUSTOM_ANALYTICS:
        r = genCustomAnalytics(i);
        break;
      default:
        // Fallback to a lightweight generic row so callers never explode.
        r = { employeeId: String(10000 + i) };
        break;
    }
    rows.push(r);
  }

  // Simple client-side style filtering (exact-match on provided keys)
  if (filters && Object.keys(filters).length) {
    return rows.filter((row) =>
      Object.entries(filters).every(([k, v]) => (v == null ? true : row[k] === v))
    );
  }
  return rows;
}
