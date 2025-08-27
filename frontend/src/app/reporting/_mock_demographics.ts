// Fully self-contained mock data for the demographic reports

type Row = Record<string, any>;
const genders = ["Male", "Female", "Nonbinary"];
const races = [
  "White",
  "Black or African American",
  "Asian",
  "Hispanic or Latino",
  "American Indian or Alaska Native",
  "Two or More Races",
];
const depts = ["Engineering", "Sales", "HR", "Finance", "Operations"];
const locs = ["NY", "CA", "TX", "WA", "MA", "IL"];
const eeoJobs = [
  "1.1 - Executive/Sr Officials & Mgrs",
  "1.2 - First/Mid Officials & Mgrs",
  "2 - Professionals",
  "3 - Technicians",
  "4 - Sales Workers",
  "5 - Administrative Support",
  "6 - Craft Workers",
  "7 - Operatives",
  "8 - Laborers & Helpers",
  "9 - Service Workers",
];

const first = [
  "Alex",
  "Sam",
  "Taylor",
  "Priya",
  "Chris",
  "Morgan",
  "Jamie",
  "Riley",
  "Jordan",
  "Avery",
];
const last = [
  "Johnson",
  "Carter",
  "Nguyen",
  "Patel",
  "Evans",
  "Kim",
  "Fox",
  "Brooks",
  "Lee",
  "Baker",
];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]) => arr[rand(arr.length)];
const pad = (n: number) => String(n).padStart(2, "0");
const date = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const mask = (s: string, keepLast = 4) =>
  `${"*".repeat(Math.max(0, s.length - keepLast))}${s.slice(-keepLast)}`;

const makeEmployeeId = (i: number) => `E${String(100 + i).padStart(3, "0")}`;
const makeSSN = () =>
  `${rand(799) + 100}-${pad(rand(90) + 10)}-${pad(rand(9000) + 1000)}`;
const makePhone = () =>
  `(${rand(800) + 100}) ${pad(rand(90) + 10)}-${String(rand(9000) + 1000)}`;
const makeEmail = (f: string, l: string) =>
  `${f.toLowerCase()}.${l.toLowerCase()}@example.com`;

const hireYearBase = 2014;

const ageFromYOB = (y: number) => new Date().getFullYear() - y;
const tenureFromHire = (y: number) => new Date().getFullYear() - y;

const fullAddress = () =>
  `${rand(9999) + 1} Main St, ${pick(["Boston", "Seattle", "Austin", "NYC"])}, ${pick(
    locs
  )} ${String(rand(89999) + 10000)}`;

export function getDemoRows(id: string, limit = 50): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < limit; i++) {
    const fn = pick(first);
    const ln = pick(last);
    const mi = String.fromCharCode(65 + rand(26));
    const dobYear = 1968 + rand(35);
    const dob = date(dobYear, rand(12) + 1, rand(27) + 1);
    const empId = makeEmployeeId(i + 1);
    const hireYear = hireYearBase + rand(10);
    const term = Math.random() < 0.15 ? date(2020 + rand(5), rand(12) + 1, rand(27) + 1) : "";
    const status = term ? "Terminated" : pick(["Active", "LOA", "Active"]);
    const dept = pick(depts);
    const loc = pick(locs);
    const job = pick(["Engineer", "Manager", "Analyst", "Sales Rep", "Coordinator"]);
    const ssn = makeSSN();

    const base = {
      employeeId: empId,
      firstName: fn,
      lastName: ln,
      middleInitial: mi,
      preferredName: Math.random() < 0.25 ? fn : "",
      dateOfBirth: dob,
      gender: pick(genders),
      maritalStatus: pick(["Single", "Married", "Divorced"]),
      ssnMasked: mask(ssn, 4),
      address: fullAddress(),
      personalEmail: makeEmail(fn, ln),
      personalPhone: makePhone(),
      emergencyContact: `${pick(first)} ${pick(last)} (${pick([
        "Spouse",
        "Parent",
        "Sibling",
        "Friend",
      ])}) ${makePhone()}`,
      hireDate: date(hireYear, rand(12) + 1, rand(27) + 1),
      employmentStatus: status,
      terminationDate: term || "",
      jobTitle: job,
      department: dept,
      location: loc,
      raceEthnicity: pick(races),
      jobCategory: pick(eeoJobs),
      establishment: `EST-${pick(["001", "002", "003"])}`,
      veteranStatus: Math.random() < 0.12 ? "Yes" : "No",
      benefitEligibilityDate: date(hireYear, rand(12) + 1, rand(27) + 1),
      dependentInfo:
        Math.random() < 0.4
          ? `${pick(first)} ${pick(last)} (${date(2010 + rand(13), rand(12) + 1, rand(27) + 1)})`
          : "",
      coverageLevel: pick([
        "Employee Only",
        "Employee + Spouse",
        "Employee + Children",
        "Family",
      ]),
      stateOfResidence: pick(locs),
      workState: pick(locs),
      federalFilingStatus: pick(["Single", "Married", "Head of Household"]),
      stateFilingStatus: pick(["Single", "Married"]),
      allowances: rand(4),
      directDepositMasked: `****${String(rand(9000) + 1000)}`,
      employmentStatusAtExit: term ? pick(["Terminated", "Resigned", "Retired"]) : "",
      terminationReason: term ? pick(["Involuntary", "Voluntary", "Retirement"]) : "",
      age: ageFromYOB(dobYear),
      tenureYears: tenureFromHire(hireYear),
      employmentType: pick(["FT", "PT", "Seasonal", "Contractor"]),
    };

    // Map to each report shape via keys
    switch (id) {
      case "employee-master":
        rows.push({
          employeeId: base.employeeId,
          firstName: base.firstName,
          lastName: base.lastName,
          middleInitial: base.middleInitial,
          preferredName: base.preferredName,
          dateOfBirth: base.dateOfBirth,
          gender: base.gender,
          maritalStatus: base.maritalStatus,
          ssnMasked: base.ssnMasked,
          address: base.address,
          personalEmail: base.personalEmail,
          personalPhone: base.personalPhone,
          emergencyContact: base.emergencyContact,
          hireDate: base.hireDate,
          employmentStatus: base.employmentStatus,
          terminationDate: base.terminationDate,
          jobTitle: base.jobTitle,
          department: base.department,
          location: base.location,
        });
        break;

      case "eeo1":
        rows.push({
          employeeId: base.employeeId,
          firstName: base.firstName,
          lastName: base.lastName,
          gender: base.gender,
          raceEthnicity: base.raceEthnicity,
          jobCategory: base.jobCategory,
          hireDate: base.hireDate,
          establishment: base.establishment,
          employmentStatus: base.employmentStatus,
        });
        break;

      case "vets4212":
        rows.push({
          employeeId: base.employeeId,
          firstName: base.firstName,
          lastName: base.lastName,
          jobTitle: base.jobTitle,
          department: base.department,
          hireDate: base.hireDate,
          veteranStatus: base.veteranStatus,
          location: base.location,
        });
        break;

      case "benefits-eligibility":
        rows.push({
          employeeId: base.employeeId,
          firstName: base.firstName,
          lastName: base.lastName,
          dateOfBirth: base.dateOfBirth,
          gender: base.gender,
          maritalStatus: base.maritalStatus,
          address: base.address,
          hireDate: base.hireDate,
          employmentStatus: base.employmentStatus,
          benefitEligibilityDate: base.benefitEligibilityDate,
          dependentInfo: base.dependentInfo,
          coverageLevel: base.coverageLevel,
        });
        break;

      case "payroll-tax-demo":
        rows.push({
          employeeId: base.employeeId,
          firstName: base.firstName,
          lastName: base.lastName,
          ssnMasked: base.ssnMasked,
          address: base.address,
          stateOfResidence: base.stateOfResidence,
          workState: base.workState,
          federalFilingStatus: base.federalFilingStatus,
          stateFilingStatus: base.stateFilingStatus,
          allowances: base.allowances,
          directDepositMasked: base.directDepositMasked,
        });
        break;

      case "turnover-demo":
        rows.push({
          employeeId: base.employeeId,
          firstName: base.firstName,
          lastName: base.lastName,
          hireDate: base.hireDate,
          terminationDate: base.terminationDate,
          jobTitle: base.jobTitle,
          department: base.department,
          location: base.location,
          employmentStatusAtExit: base.employmentStatusAtExit,
          terminationReason: base.terminationReason,
          gender: base.gender,
          raceEthnicity: base.raceEthnicity,
        });
        break;

      case "custom-demo-analytics":
        rows.push({
          employeeId: base.employeeId,
          gender: base.gender,
          raceEthnicity: base.raceEthnicity,
          age: base.age,
          tenureYears: base.tenureYears,
          department: base.department,
          location: base.location,
          employmentType: base.employmentType,
        });
        break;

      default:
        rows.push(base); // fallback (shouldn't be used)
    }
  }
  return rows;
}
