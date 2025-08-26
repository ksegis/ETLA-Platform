// frontend/src/app/reporting/_mock.ts
// Centralized mock data helpers used by UI and API routes.

import { getReportById } from "./_data";

export type Row = Record<string, unknown>;

export function getMockRows(id: string): Row[] {
  const r = getReportById(id);
  if (!r) return [];
  // Simple generic rows if report didn’t provide columns.
  const cols = r.columns?.map(c => c.key) ?? [
    "checkNumber","payDate","empId","employee","dept","earnings","taxes","deductions","netPay"
  ];
  const make = (i: number): Row => {
    const base = i % 5;
    const emp = EMPLOYEES[base];
    const gross = 2200 + base * 50 + (i % 3) * 70;
    const taxes = Math.round(gross * 0.22 * 10) / 10;
    const ded   = [85,105,95,90,88][base];
    const net   = Math.round((gross - taxes - ded) * 10) / 10;
    const common: Row = {
      checkNumber: 100100 + i,
      payDate: payDateForIndex(i),
      empId: emp.id,
      employee: emp.name,
      dept: emp.dept,
      earnings: gross,
      taxes,
      deductions: ded,
      netPay: net,
    };
    return cols.reduce<Row>((acc,k) => {
      acc[k] = k in common ? common[k as keyof typeof common] : defaultValueForKey(k, i);
      return acc;
    }, {});
  };
  return Array.from({ length: 50 }, (_, i) => make(i));
}

// ---------- NEW: single-check detail (for facsimile stub view) ----------
export type StubSection = { code?: string; label: string; hours?: number; rate?: number; amount: number };
export type CheckStubData = {
  checkNumber: string;
  payDate: string;
  payPeriod: { from: string; to: string };
  employee: { id: string; name: string; address1: string; address2?: string; dept?: string; ssnMasked: string };
  employer: { name: string; address1: string; address2?: string; ein?: string };
  earnings: StubSection[];
  taxes: StubSection[];
  deductions: StubSection[];
  ytd: { gross: number; taxes: number; deductions: number; net: number };
  employerTaxes?: StubSection[];
  routing: { bank: string; routingMasked: string; accountMasked: string };
};

export function getMockCheck(checkId: string): CheckStubData {
  // Make the check stable from id digits
  const n = Number(String(checkId).slice(-2)) || 1;
  const emp = EMPLOYEES[n % EMPLOYEES.length];

  const hours = 80;
  const baseRate = 28 + (n % 5) * 1.5;
  const gross = round2(hours * baseRate);
  const fed   = round2(gross * 0.12);
  const fica  = round2(gross * 0.062);
  const medi  = round2(gross * 0.0145);
  const st    = round2(gross * 0.055);
  const taxTotal = round2(fed + fica + medi + st);

  const dental = 18;
  const medical = 75;
  const 401k = round2(gross * 0.04);
  const deductions = round2(dental + medical + 401k);

  const net = round2(gross - taxTotal - deductions);

  return {
    checkNumber: String(checkId),
    payDate: recentDate(0),
    payPeriod: { from: recentDate(-14), to: recentDate(0) },
    employee: {
      id: emp.id, name: emp.name, dept: emp.dept,
      address1: "123 Market St", address2: `${emp.city}, ${emp.state} 12345`,
      ssnMasked: "XXX-XX-1234",
    },
    employer: {
      name: "Acme Technologies, Inc.",
      address1: "800 Innovation Way",
      address2: "Austin, TX 78701",
      ein: "12-3456789",
    },
    earnings: [
      { code: "REG", label: "Regular", hours, rate: baseRate, amount: gross },
    ],
    taxes: [
      { label: "Federal Income Tax", amount: fed },
      { label: "Social Security",     amount: fica },
      { label: "Medicare",            amount: medi },
      { label: "State Income Tax",    amount: st },
    ],
    employerTaxes: [
      { label: "Employer Social Security", amount: round2(gross * 0.062) },
      { label: "Employer Medicare",        amount: round2(gross * 0.0145) },
      { label: "FUTA",                     amount: 6.0 }, // small sample
      { label: "SUTA",                     amount: 11.0 },
    ],
    deductions: [
      { label: "Medical", amount: medical },
      { label: "Dental",  amount: dental },
      { label: "401(k)",  amount: 401k },
    ],
    ytd: {
      gross: round2(gross * 20),
      taxes: round2(taxTotal * 20),
      deductions: round2(deductions * 20),
      net: round2(net * 20),
    },
    routing: {
      bank: "First National Bank",
      routingMasked: "*****4321",
      accountMasked: "****9876",
    },
  };
}

// ---------- helpers ----------
function payDateForIndex(i: number) {
  const d = new Date("2024-07-15T00:00:00Z");
  d.setMonth(d.getMonth() - Math.floor(i / 2));
  d.setDate(15 + (i % 2) * 15);
  return d.toISOString().slice(0,10);
}
function recentDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0,10);
}
function round2(n: number) { return Math.round(n * 100) / 100; }

function defaultValueForKey(k: string, i: number) {
  if (/date/i.test(k)) return payDateForIndex(i);
  if (/earn|gross|amount|rate|wage|pay|net|tax|deduct/i.test(k)) return 100 + (i % 5) * 25;
  if (/id/i.test(k)) return `E${String(100 + (i % 50)).padStart(3,"0")}`;
  if (/emp/i.test(k)) return EMPLOYEES[i % EMPLOYEES.length].name;
  if (/dept/i.test(k)) return EMPLOYEES[i % EMPLOYEES.length].dept;
  return `${k}-${i+1}`;
}

const EMPLOYEES = [
  { id:"E001", name:"Ava Thompson", dept:"Finance",    city:"Austin",     state:"TX" },
  { id:"E002", name:"Liam Johnson", dept:"Operations", city:"Denver",     state:"CO" },
  { id:"E003", name:"Mia Chen",     dept:"Engineering",city:"Seattle",    state:"WA" },
  { id:"E004", name:"Noah Patel",   dept:"HR",         city:"Chicago",    state:"IL" },
  { id:"E005", name:"Olivia Garcia",dept:"Sales",      city:"San Diego",  state:"CA" },
];
