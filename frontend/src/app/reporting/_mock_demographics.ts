// Mock data generators for the Demographics reports only.
// Intentionally synchronous (returns arrays) to avoid Promise vs array build errors.

import { DEMOGRAPHIC_IDS } from "./_demographics";

// ---------- helpers ----------
type Row = Record<string, any>;

const firstNames = ["Alex","Jordan","Taylor","Morgan","Avery","Riley","Casey","Drew","Jamie","Quinn","Harper","Parker","Rowan","Shawn","Skyler"];
const lastNames  = ["Lee","Garcia","Nguyen","Patel","Kim","Cohen","Murphy","Johnson","Lopez","Wright","Lewis","Anderson","Walker","Young","Hall"];
const genders    = ["Male","Female","Non-Binary","Unspecified"];
const marital    = ["Single","Married","Divorced","Domestic Partner"];
const races      = ["White","Black or African American","Hispanic or Latino","Asian","American Indian or Alaska Native","Native Hawaiian or Other Pacific Islander","Two or More Races","Not Specified"];
const eeoCats    = ["Executive/Sr Officials","First/Mid Officials","Professionals","Technicians","Sales Workers","Administrative Support","Craft Workers","Operatives","Laborers","Service Workers"];
const depts      = ["Operations","Sales","Engineering","Finance","HR","Marketing","Customer Support","R&D"];
const titles     = ["Analyst","Manager","Engineer","Specialist","Coordinator","Director","Technician","Associate"];
const locations  = ["New York, NY","Austin, TX","Chicago, IL","Phoenix, AZ","Atlanta, GA","Seattle, WA","Boston, MA","Denver, CO"];
const states     = ["NY","TX","IL","AZ","GA","WA","MA","CO","CA","FL","NC","NJ","PA","OH","MI"];
const filingFed  = ["Single","Married filing jointly","Married filing separately","Head of household"];
const filingSt   = ["Single","Married","Head of household","Other"];
const empTypes   = ["FT","PT","Seasonal","Contractor"];
const coverageLv = ["Employee Only","Employee + Spouse","Employee + Child(ren)","Family"];

function rndInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}
function pick<T>(arr: T[]): T {
  return arr[rndInt(0, arr.length - 1)];
}
function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
function dateStr(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}
function randomDOB(minAge = 19, maxAge = 64) {
  const age = rndInt(minAge, maxAge);
  const year = new Date().getFullYear() - age;
  return dateStr(year, rndInt(1, 12), rndInt(1, 28));
}
function randomHireDate() {
  const year = rndInt(2015, new Date().getFullYear());
  return dateStr(year, rndInt(1, 12), rndInt(1, 28));
}
function randomTermDate(hire: string) {
  // ~25% chance terminated, ensure after hire
  if (Math.random() < 0.75) return "";
  const [hy, hm] = hire.split("-").map((x) => parseInt(x, 10));
  const y = rndInt(Math.max(hy, 2016), new Date().getFullYear());
  const m = rndInt(1, 12);
  return dateStr(y, m, rndInt(1, 28));
}
function maskSSN(last4?: string) {
  const l4 = last4 || String(rndInt(1000, 9999));
  return `XXX-XX-${l4}`;
}
function randomPhone() {
  return `(${rndInt(200, 989)}) ${rndInt(100, 999)}-${rndInt(1000, 9999)}`;
}
function randomEmail(first: string, last: string) {
  const domains = ["gmail.com","yahoo.com","outlook.com","icloud.com"];
  return `${first}.${last}`.toLowerCase() + "@" + pick(domains);
}
function randomAddress() {
  const streetNo = rndInt(100, 9999);
  const streetNm = ["Main","1st","Oak","Maple","Cedar","Park","Washington","Lake","Hill"][rndInt(0,8)];
  const citySt = pick(locations);
  const [city, state] = citySt.split(", ").map((s) => s.trim());
  const zip = String(rndInt(10000, 99999));
  return {
    street: `${streetNo} ${streetNm} St`,
    city,
    state,
    zip,
    oneLine: `${streetNo} ${streetNm} St, ${city}, ${state} ${zip}`,
  };
}
function bankLast4() {
  return String(rndInt(1000, 9999));
}
function dependentSummary(count = rndInt(0, 3)) {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const rel = pick(["Spouse","Child","Domestic Partner","Other"]);
    const g = pick(["Male","Female","Non-Binary"]);
    const dob = randomDOB(0, 24);
    out.push(`${fn} ${ln} (${dob}, ${rel}, ${g})`);
  }
  return out.join("; ");
}
function ageFromDOB(dob: string) {
  if (!dob) return "";
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}
function tenureFromHire(hire: string) {
  if (!hire) return "";
  const d = new Date(hire);
  const now = new Date();
  let y = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) y--;
  return y;
}

// Build a core person record used by multiple reports
function makePerson(idx: number) {
  const first = pick(firstNames);
  const last = pick(lastNames);
  const mi = String.fromCharCode(65 + rndInt(0, 25));
  const pref = Math.random() < 0.15 ? first : "";
  const dob = randomDOB();
  const gender = pick(genders);
  const ms = pick(marital);
  const ssnLast4 = String(rndInt(1000, 9999));
  const addr = randomAddress();
  const email = randomEmail(first, last);
  const phone = randomPhone();
  const ec = `${pick(firstNames)} ${pick(lastNames)} (${pick(["Spouse","Parent","Sibling","Friend"])}, ${randomPhone()})`;
  const hire = randomHireDate();
  const statusPool = ["Active","Active","Active","LOA","Terminated"];
  const status = pick(statusPool);
  const termDate = status === "Terminated" ? randomTermDate(hire) : "";
  const jobTitle = pick(titles);
  const dept = pick(depts);
  const loc = `${addr.city}, ${addr.state}`;
  const empId = `E${String(10000 + idx)}`;

  return {
    empId, first, last, mi, pref, dob, gender, ms,
    ssnMasked: maskSSN(ssnLast4),
    addressOneLine: addr.oneLine,
    email, phone, emergency: ec,
    hire, status, termDate,
    jobTitle, dept, loc,
    stateRes: addr.state,
    workState: pick(states),
  };
}

// ---------- per-report row builders ----------
function rowsEmpMaster(limit = 50): Row[] {
  const out: Row[] = [];
  for (let i = 0; i < limit; i++) {
    const p = makePerson(i);
    out.push({
      "Employee ID": p.empId,
      "First Name": p.first,
      "Last Name": p.last,
      "Middle Initial": p.mi,
      "Preferred Name": p.pref,
      "Date of Birth": p.dob,
      "Gender": p.gender,
      "Marital Status": p.ms,
      "Social Security Number (masked)": p.ssnMasked,
      "Address (Street, City, State, Zip)": p.addressOneLine,
      "Personal Email": p.email,
      "Personal Phone": p.phone,
      "Emergency Contact (Name, Relationship, Phone)": p.emergency,
      "Hire Date": p.hire,
      "Employment Status": p.status,
      "Termination Date": p.termDate,
      "Job Title": p.jobTitle,
      "Department": p.dept,
      "Location": p.loc,
    });
  }
  return out;
}

function rowsEEO(limit = 50): Row[] {
  const out: Row[] = [];
  for (let i = 0; i < limit; i++) {
    const p = makePerson(i);
    out.push({
      "Employee ID": p.empId,
      "First Name": p.first,
      "Last Name": p.last,
      "Gender": p.gender,
      "Race / Ethnicity": pick(races),
      "Job Category (EEO category)": pick(eeoCats),
      "Hire Date": p.hire,
      "Location / Establishment": p.loc,
      "Employment Status": p.status,
    });
  }
  return out;
}

function rowsVETS(limit = 50): Row[] {
  const out: Row[] = [];
  for (let i = 0; i < limit; i++) {
    const p = makePerson(i);
    out.push({
      "Employee ID": p.empId,
      "First Name": p.first,
      "Last Name": p.last,
      "Job Title": p.jobTitle,
      "Department": p.dept,
      "Hire Date": p.hire,
      "Veteran Status": Math.random() < 0.12 ? "Yes" : "No",
      "Location": p.loc,
    });
  }
  return out;
}

function rowsBenefit(limit = 50): Row[] {
  const out: Row[] = [];
  for (let i = 0; i < limit; i++) {
    const p = makePerson(i);
    const elig = p.status === "Active" ? p.hire : "";
    out.push({
      "Employee ID": p.empId,
      "First Name": p.first,
      "Last Name": p.last,
      "Date of Birth": p.dob,
      "Gender": p.gender,
      "Marital Status": p.ms,
      "Address (Street, City, State, Zip)": p.addressOneLine,
      "Hire Date": p.hire,
      "Employment Status": Math.random() < 0.8 ? "Full-time" : "Part-time",
      "Benefit Eligibility Date": elig,
      "Dependent Info (Name, DOB, Relationship, Gender)": dependentSummary(),
      "Coverage Level": pick(coverageLv),
    });
  }
  return out;
}

function rowsPayrollTax(limit = 50): Row[] {
  const out: Row[] = [];
  for (let i = 0; i < limit; i++) {
    const p = makePerson(i);
    out.push({
      "Employee ID": p.empId,
      "First Name": p.first,
      "Last Name": p.last,
      "SSN (masked)": p.ssnMasked,
      "Address (Street, City, State, Zip)": p.addressOneLine,
      "State of Residence": p.stateRes,
      "Work Location State": p.workState,
      "Federal Filing Status": pick(filingFed),
      "State Filing Status": pick(filingSt),
      "Number of Allowances / Dependents": rndInt(0, 5),
      "Direct Deposit Bank Info (masked, last 4 digits only)": `Acct •••• ${bankLast4()}`,
    });
  }
  return out;
}

function rowsTurnover(limit = 50): Row[] {
  const out: Row[] = [];
  for (let i = 0; i < limit; i++) {
    const p = makePerson(i);
    const exited = p.termDate ? "Terminated" : p.status;
    const reason = p.termDate ? pick(["Voluntary","Involuntary","Layoff","Job Abandonment","Retirement"]) : "";
    const code = reason ? pick(["VOL","INV","LAY","ABN","RET"]) : "";
    out.push({
      "Employee ID": p.empId,
      "First Name": p.first,
      "Last Name": p.last,
      "Hire Date": p.hire,
      "Termination Date": p.termDate,
      "Job Title": p.jobTitle,
      "Department": p.dept,
      "Location": p.loc,
      "Employment Status at Exit": exited,
      "Termination Reason / Code": reason ? `${reason} (${code})` : "",
      "Gender": p.gender,
      "Race / Ethnicity": pick(races),
    });
  }
  return out;
}

function rowsCustomAnalytics(limit = 50): Row[] {
  const out: Row[] = [];
  for (let i = 0; i < limit; i++) {
    const p = makePerson(i);
    out.push({
      "Employee ID": p.empId,
      "Gender": p.gender,
      "Race / Ethnicity": pick(races),
      "Age": ageFromDOB(p.dob),
      "Tenure": tenureFromHire(p.hire),
      "Department": p.dept,
      "Location": p.loc,
      "Employment Type": pick(empTypes),
    });
  }
  return out;
}

// Public API used by the app's preview/export layer.
// Returns an array (not a Promise) to keep the rest of your code happy.
export function getDemographicMockRows(id: string, limit = 50): Row[] {
  switch (id) {
    case "emp_master_demo":       return rowsEmpMaster(limit);
    case "eeo_1":                 return rowsEEO(limit);
    case "vets_4212":             return rowsVETS(limit);
    case "benefit_eligibility":   return rowsBenefit(limit);
    case "payroll_tax_demo":      return rowsPayrollTax(limit);
    case "turnover_demo":         return rowsTurnover(limit);
    case "custom_demo_analytics": return rowsCustomAnalytics(limit);
    default:                      return [];
  }
}

// Helper so your aggregator can detect what we handle.
export const DEMOGRAPHIC_MOCK_IDS = DEMOGRAPHIC_IDS.slice();
