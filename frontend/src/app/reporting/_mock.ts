// Rich demo data for all reports.
// Columns mirror common “big vendor” reports (ADP/UKG/Workday/Paychex style).

type Row = Record<string, any>;

const people = [
  { id: "E001", name: "Aeryn Sun", dept: "SALES", cc: "4000", loc: "HQ", paygroup: "Biweekly", grade: "S1", job: "Account Executive", managerId: "M100", manager: "J. Sheyang" },
  { id: "E002", name: "John Crichton", dept: "SRV/HUB", cc: "4100", loc: "DC-East", paygroup: "Biweekly", grade: "P2", job: "Support Engineer", managerId: "M200", manager: "T. Sun-Ha" },
  { id: "E003", name: "D. Peacekeeper", dept: "TEACH", cc: "4200", loc: "HQ", paygroup: "Biweekly", grade: "T3", job: "Trainer", managerId: "M300", manager: "V. Chart" },
  { id: "E004", name: "Zhaan Delvian", dept: "WORSHIP", cc: "4300", loc: "Remote", paygroup: "Biweekly", grade: "W2", job: "Chaplain", managerId: "M400", manager: "B. Orion" },
  { id: "E005", name: "Ka D'Argo", dept: "SALES", cc: "4000", loc: "HQ", paygroup: "Biweekly", grade: "S2", job: "Sr. Account Exec", managerId: "M100", manager: "J. Sheyang" },
  { id: "E006", name: "Rygel XVI", dept: "SRV/HUB", cc: "4100", loc: "DC-East", paygroup: "Weekly", grade: "P1", job: "Support Analyst", managerId: "M200", manager: "T. Sun-Ha" },
];

const periods = [
  { start: "2025-07-01", label: "Jul 2025" },
  { start: "2025-08-01", label: "Aug 2025" },
  { start: "2025-09-01", label: "Sep 2025" },
];

const makeMoney = (n: number) => Math.round(n * 100) / 100;

// --------------------------- EMPLOYEE ---------------------------

const employeeRoster: Row[] = people.map((p, i) => ({
  EMPLOYEEID: p.id,
  EMPLOYEENAME: p.name,
  STATUS: i % 5 === 0 ? "Inactive" : "Active",
  DOB: "1990-05-12",
  SSN_LAST4: "1234",
  HIRE_DATE: "2023-01-09",
  TERM_DATE: i % 5 === 0 ? "2025-03-31" : "",
  JOB_CODE: p.job.toUpperCase().slice(0, 6),
  JOB_TITLE: p.job,
  GRADE: p.grade,
  DEPARTMENT: p.dept,
  COSTCENTER: p.cc,
  LOCATION: p.loc,
  MANAGER_ID: p.managerId,
  MANAGER_NAME: p.manager,
  PAYGROUP: p.paygroup,
  FLSA: "Nonexempt",
  SCHEDULE: "40/wk",
  EMAIL: `${p.name.toLowerCase().replace(/[^a-z]/g, ".")}@etla.demo`,
  PHONE: "(555) 555-1212",
  ADDRESS: "123 Payroll Way",
  CITY: "Artemis",
  STATE: "DC",
  ZIP: "20001",
}));

const headcountSummary: Row[] = periods.flatMap((per) => [
  { PERIODSTART: per.start, PERIODLABEL: per.label, DEPARTMENT: "SALES", COSTCENTER: "4000", LOCATION: "HQ", HEADCOUNT: 2, FTE: 2.0, HIRES: 0, TERMS: 0, NET_CHANGE: 0 },
  { PERIODSTART: per.start, PERIODLABEL: per.label, DEPARTMENT: "SRV/HUB", COSTCENTER: "4100", LOCATION: "DC-East", HEADCOUNT: 2, FTE: 2.0, HIRES: 1, TERMS: 0, NET_CHANGE: 1 },
  { PERIODSTART: per.start, PERIODLABEL: per.label, DEPARTMENT: "TEACH", COSTCENTER: "4200", LOCATION: "HQ", HEADCOUNT: 1, FTE: 1.0, HIRES: 0, TERMS: 0, NET_CHANGE: 0 },
  { PERIODSTART: per.start, PERIODLABEL: per.label, DEPARTMENT: "WORSHIP", COSTCENTER: "4300", LOCATION: "Remote", HEADCOUNT: 1, FTE: 1.0, HIRES: 0, TERMS: 0, NET_CHANGE: 0 },
]);

const turnoverHistory: Row[] = periods.map((per) => ({
  PERIODSTART: per.start,
  PERIODLABEL: per.label,
  DEPARTMENT: "Company",
  AVG_HEADCOUNT: 6.0,
  VOLUNTARY_TERMS: 0,
  INVOLUNTARY_TERMS: 0,
  TOTAL_TERMS: 0,
  TURNOVER_RATE: 0,
}));

// ---------------------------- CHECKS ----------------------------

const benefitGroupAnalysis: Row[] = people.map((p) => ({
  EMPLOYEEID: p.id,
  EMPLOYEENAME: p.name,
  PAYDATE: "2025-08-15",
  PAYWEEK: "2025-W33",
  PAYNUMBER: p.paygroup === "Weekly" ? 16 : 8,
  BENEFIT_GROUP: p.dept === "SALES" ? "Premium PPO" : "HSA Plan",
  COVERAGE_TIER: "Employee + Spouse",
  EMPLOYER_COST: makeMoney(600),
  EMPLOYEE_COST: makeMoney(210),
}));

const checkDetailHistory: Row[] = people.map((p, i) => {
  const regHours = 80;
  const regRate = p.dept === "SALES" ? 18.5 : 19.5 + (i % 2);
  const otHours = i % 3 === 0 ? 2 : 0;
  const otRate = regRate * 1.5;
  const regAmt = regHours * regRate;
  const otAmt = otHours * otRate;
  const bonus = i % 4 === 0 ? 300 : 0;

  const fed = makeMoney(regAmt * 0.072);
  const state = makeMoney(regAmt * 0.025);
  const ss = makeMoney(regAmt * 0.062);
  const medicare = makeMoney(regAmt * 0.0145);
  const local = i % 2 ? 0 : makeMoney(regAmt * 0.01);

  const k401 = makeMoney(regAmt * 0.05);
  const medical = 156.1;
  const dental = 25.0;
  const vision = 8.9;
  const garn = i % 5 === 0 ? 45 : 0;

  const gross = makeMoney(regAmt + otAmt + bonus);
  const taxes = makeMoney(fed + state + ss + medicare + local);
  const ded = makeMoney(k401 + medical + dental + vision + garn);
  const net = makeMoney(gross - taxes - ded);

  return {
    EMPLOYEEID: p.id,
    EMPLOYEENAME: p.name,
    PAYDATE: "2025-08-15",
    PAYWEEK: "2025-W33",
    PAYNUMBER: p.paygroup === "Weekly" ? 16 : 16,
    CHECKNUMBER: 100100 + i,
    PAYGROUP: p.paygroup,
    DEPARTMENT: p.dept,
    COSTCENTER: p.cc,
    LOCATION: p.loc,

    E_REG_HOURS: regHours,
    E_REG_RATE: regRate,
    E_REG_AMOUNT: regAmt,
    E_OT_HOURS: otHours,
    E_OT_RATE: otRate,
    E_OT_AMOUNT: otAmt,
    E_BONUS_AMOUNT: bonus,

    T_FED: fed,
    T_STATE: state,
    T_LOCAL: local,
    T_SOCSEC: ss,
    T_MEDICARE: medicare,

    D_401K: k401,
    D_MEDICAL: medical,
    D_DENTAL: dental,
    D_VISION: vision,
    D_GARNISH: garn,

    MEMO: i % 2 ? "" : "New position stipend",
    GROSS: gross,
    TAXES: taxes,
    DEDUCTIONS: ded,
    NETPAY: net,

    YTD_GROSS: makeMoney(1480 * 10 + gross),
    YTD_TAXES: makeMoney(266.4 * 10 + taxes),
    YTD_DEDUCTIONS: makeMoney(155 * 10 + ded),
    YTD_NETPAY: makeMoney(1058.6 * 10 + net),
  };
});

const payPeriodAnalysis: Row[] = [
  { PERIODSTART: "2025-08-01", PERIODLABEL: "2025-W33", PAYGROUP: "Biweekly", HEADCOUNT: 6, FTE: 6, REGULARPAY: 16000, OTPAY: 330, BONUSPAY: 2500, GROSS: 18830, TAXES: 2660, DEDUCTIONS: 1550, NETPAY: 14620 },
  { PERIODSTART: "2025-08-15", PERIODLABEL: "2025-W35", PAYGROUP: "Biweekly", HEADCOUNT: 6, FTE: 6, REGULARPAY: 16100, OTPAY: 220, BONUSPAY: 600, GROSS: 16920, TAXES: 2470, DEDUCTIONS: 1490, NETPAY: 12960 },
];

const taxInformation: Row[] = people.map((p) => ({
  EMPLOYEEID: p.id,
  EMPLOYEENAME: p.name,
  STATE: "DC",
  SUI_STATE: "DC",
  W4_STATUS: "Single",
  W4_DEPENDENTS: 0,
  ADDL_WITHHOLDING: 0,
  LOCALITY: p.loc === "DC-East" ? "DC" : "",
  JURISDICTION_CODE: p.loc === "DC-East" ? "11001" : "",
  RATE: 0.0525,
  YTD_FED: 3200.12,
  YTD_STATE: 1200.43,
  YTD_LOCAL: p.loc === "DC-East" ? 210.25 : 0,
}));

const w2Documents: Row[] = [
  { DOCUMENT_ID: "W2-2024-E001", EMPLOYEEID: "E001", EMPLOYEENAME: "Aeryn Sun", TAXYEAR: 2024, FILENAME: "W2_AerynSun_2024.pdf", SIZE_BYTES: 145233, DOWNLOAD_URL: "/docs/mock/W2_AerynSun_2024.pdf" },
  { DOCUMENT_ID: "W2-2024-E002", EMPLOYEEID: "E002", EMPLOYEENAME: "John Crichton", TAXYEAR: 2024, FILENAME: "W2_JohnCrichton_2024.pdf", SIZE_BYTES: 139882, DOWNLOAD_URL: "/docs/mock/W2_JohnCrichton_2024.pdf" },
];

// ------------------------------ JOBS ------------------------------

const deptAnalysis: Row[] = periods.flatMap((per) => [
  { PERIODSTART: per.start, PERIODLABEL: per.label, DEPARTMENT: "SALES", COSTCENTER: "4000", LOCATION: "HQ", PAYGROUP: "Biweekly", HEADCOUNT: 2, FTE: 2, REGULARPAY: 16000, OTPAY: 300, BONUS: 0 },
  { PERIODSTART: per.start, PERIODLABEL: per.label, DEPARTMENT: "SRV/HUB", COSTCENTER: "4100", LOCATION: "DC-East", PAYGROUP: "Biweekly", HEADCOUNT: 2, FTE: 2, REGULARPAY: 20600, OTPAY: 840, BONUS: 0 },
  { PERIODSTART: per.start, PERIODLABEL: per.label, DEPARTMENT: "TEACH", COSTCENTER: "4200", LOCATION: "HQ", PAYGROUP: "Biweekly", HEADCOUNT: 1, FTE: 1, REGULARPAY: 25440, OTPAY: 300, BONUS: 0 },
  { PERIODSTART: per.start, PERIODLABEL: per.label, DEPARTMENT: "WORSHIP", COSTCENTER: "4300", LOCATION: "Remote", PAYGROUP: "Biweekly", HEADCOUNT: 1, FTE: 1, REGULARPAY: 32700, OTPAY: 840, BONUS: 0 },
]);

const jobHistory: Row[] = [
  { EFFECTIVE_DATE: "2025-07-08", EMPLOYEEID: "E002", EMPLOYEENAME: "John Crichton", ACTION: "Transfer", FROM_DEPT: "SALES", TO_DEPT: "SRV/HUB", FROM_JOB: "Account Executive", TO_JOB: "Support Engineer", REASON: "Business Need", PRIOR_RATE: 28.75, NEW_RATE: 30.25, FLSA: "Nonexempt", LOCATION: "DC-East", COSTCENTER: "4100" },
  { EFFECTIVE_DATE: "2025-08-01", EMPLOYEEID: "E005", EMPLOYEENAME: "Ka D'Argo", ACTION: "Pay Change", FROM_DEPT: "SALES", TO_DEPT: "SALES", FROM_JOB: "Account Executive", TO_JOB: "Sr. Account Exec", REASON: "Merit", PRIOR_RATE: 29.5, NEW_RATE: 31.0, FLSA: "Exempt", LOCATION: "HQ", COSTCENTER: "4000" },
  { EFFECTIVE_DATE: "2025-05-01", EMPLOYEEID: "E006", EMPLOYEENAME: "Rygel XVI", ACTION: "Hire", FROM_DEPT: "", TO_DEPT: "SRV/HUB", FROM_JOB: "", TO_JOB: "Support Analyst", REASON: "New Hire", PRIOR_RATE: 0, NEW_RATE: 22.0, FLSA: "Nonexempt", LOCATION: "DC-East", COSTCENTER: "4100" },
];

const positionHistory: Row[] = [
  { EFFECTIVE_DATE: "2025-07-01", POSITION_ID: "POS-4000-01", POSITION_TITLE: "Account Executive", GRADE: "S1", DEPARTMENT: "SALES", COSTCENTER: "4000", LOCATION: "HQ", STATUS: "Filled", INCUMBENT_ID: "E001", INCUMBENT_NAME: "Aeryn Sun", FTE: 1.0, HEADCOUNT: 1 },
  { EFFECTIVE_DATE: "2025-07-01", POSITION_ID: "POS-4100-01", POSITION_TITLE: "Support Engineer", GRADE: "P2", DEPARTMENT: "SRV/HUB", COSTCENTER: "4100", LOCATION: "DC-East", STATUS: "Filled", INCUMBENT_ID: "E002", INCUMBENT_NAME: "John Crichton", FTE: 1.0, HEADCOUNT: 1 },
  { EFFECTIVE_DATE: "2025-08-01", POSITION_ID: "POS-4100-02", POSITION_TITLE: "Support Analyst", GRADE: "P1", DEPARTMENT: "SRV/HUB", COSTCENTER: "4100", LOCATION: "DC-East", STATUS: "Open", INCUMBENT_ID: "", INCUMBENT_NAME: "", FTE: 1.0, HEADCOUNT: 0 },
];

// ----------------------------- SALARY -----------------------------

const compensationSummary: Row[] = people.map((p) => {
  const base = p.grade.startsWith("S") ? 72000 : p.grade.startsWith("P") ? 68000 : 76000;
  const allow = p.dept === "SALES" ? 3000 : 0;
  const bonusPct = p.dept === "SALES" ? 0.10 : 0.05;
  return {
    EMPLOYEEID: p.id,
    EMPLOYEENAME: p.name,
    JOB_TITLE: p.job,
    GRADE: p.grade,
    DEPARTMENT: p.dept,
    LOCATION: p.loc,
    CURRENCY: "USD",
    BASEPAY_ANNUAL: base,
    ALLOWANCES: allow,
    BONUS_TARGET_PCT: bonusPct,
    BONUS_TARGET_AMT: makeMoney(base * bonusPct),
    TOTAL_COMP: base + allow + makeMoney(base * bonusPct),
  };
});

const rangePenetration: Row[] = people.map((p) => {
  const min = 60000, mid = 75000, max = 90000;
  const base = p.grade.startsWith("S") ? 72000 : p.grade.startsWith("P") ? 68000 : 76000;
  return {
    JOB_CODE: p.job.toUpperCase().slice(0, 6),
    JOB_TITLE: p.job,
    GRADE: p.grade,
    RANGE_MIN: min,
    RANGE_MID: mid,
    RANGE_MAX: max,
    BASEPAY_ANNUAL: base,
    COMPA_RATIO: makeMoney(base / mid),
    PENETRATION_PCT: makeMoney(((base - min) / (max - min)) * 100),
  };
});

const meritHistory: Row[] = [
  { EMPLOYEEID: "E001", EMPLOYEENAME: "Aeryn Sun", CYCLE: "2025 Merit", EFFECTIVE_DATE: "2025-04-01", PRIOR_BASE: 70000, NEW_BASE: 72000, MERIT_PCT: 0.0286, MERIT_AMT: 2000, MARKET_AMT: 0, LUMP_SUM_AMT: 0, TOTAL_INCREASE_AMT: 2000, TOTAL_INCREASE_PCT: 0.0286 },
  { EMPLOYEEID: "E005", EMPLOYEENAME: "Ka D'Argo", CYCLE: "2025 Merit", EFFECTIVE_DATE: "2025-04-01", PRIOR_BASE: 70500, NEW_BASE: 73000, MERIT_PCT: 0.0355, MERIT_AMT: 2500, MARKET_AMT: 0, LUMP_SUM_AMT: 0, TOTAL_INCREASE_AMT: 2500, TOTAL_INCREASE_PCT: 0.0355 },
];

// --------------------------- TIMECARDS ----------------------------

const timecardDetail: Row[] = [
  { EMPLOYEEID: "E002", EMPLOYEENAME: "John Crichton", DATE: "2025-08-11", PAYCODE: "REG", IN: "08:30", OUT: "17:30", HOURS: 8.0, APPROVAL: "Approved", COSTCENTER: "4100", LOCATION: "DC-East" },
  { EMPLOYEEID: "E002", EMPLOYEENAME: "John Crichton", DATE: "2025-08-12", PAYCODE: "REG", IN: "08:30", OUT: "17:30", HOURS: 8.0, APPROVAL: "Approved", COSTCENTER: "4100", LOCATION: "DC-East" },
  { EMPLOYEEID: "E002", EMPLOYEENAME: "John Crichton", DATE: "2025-08-13", PAYCODE: "OT",  IN: "08:30", OUT: "19:30", HOURS: 10.0, APPROVAL: "Approved", COSTCENTER: "4100", LOCATION: "DC-East" },
  { EMPLOYEEID: "E006", EMPLOYEENAME: "Rygel XVI",      DATE: "2025-08-12", PAYCODE: "REG", IN: "09:00", OUT: "18:00", HOURS: 8.0, APPROVAL: "Approved", COSTCENTER: "4100", LOCATION: "DC-East" },
];

const overtimeSummary: Row[] = [
  { PERIODSTART: "2025-08-01", PERIODLABEL: "Aug W33", EMPLOYEEID: "E002", EMPLOYEENAME: "John Crichton", DEPARTMENT: "SRV/HUB", LOCATION: "DC-East", OT_HOURS: 2.0, OT_RATE: 45.38, OT_AMOUNT: 90.76 },
  { PERIODSTART: "2025-08-01", PERIODLABEL: "Aug W33", EMPLOYEEID: "E003", EMPLOYEENAME: "D. Peacekeeper", DEPARTMENT: "TEACH", LOCATION: "HQ", OT_HOURS: 2.0, OT_RATE: 48.75, OT_AMOUNT: 97.50 },
];

const exceptions: Row[] = [
  { EMPLOYEEID: "E006", EMPLOYEENAME: "Rygel XVI", DATE: "2025-08-13", EXCEPTION_TYPE: "Missed Punch", NOTES: "No out punch", RESOLVED: "Yes", APPROVER: "T. Sun-Ha" },
  { EMPLOYEEID: "E002", EMPLOYEENAME: "John Crichton", DATE: "2025-08-10", EXCEPTION_TYPE: "Unapproved Time", NOTES: "Late approval", RESOLVED: "Yes", APPROVER: "T. Sun-Ha" },
];

// ------------------------ PUBLIC ACCESSORS ------------------------

const byId: Record<string, Row[]> = {
  // Employee
  "employee-roster": employeeRoster,
  "headcount-summary": headcountSummary,
  "turnover-history": turnoverHistory,

  // Checks
  "benefit-group-analysis": benefitGroupAnalysis,
  "check-detail-history": checkDetailHistory,
  "pay-period-analysis": payPeriodAnalysis,
  "tax-information": taxInformation,
  "w2-documents": w2Documents,

  // Jobs
  "dept-analysis": deptAnalysis,
  "job-history": jobHistory,
  "position-history": positionHistory,

  // Salary
  "compensation-summary": compensationSummary,
  "range-penetration": rangePenetration,
  "merit-history": meritHistory,

  // Timecards
  "timecard-detail": timecardDetail,
  "overtime-summary": overtimeSummary,
  "exceptions": exceptions,
};

export function getMockRows(id: string, limit?: number): Row[] {
  const key = String(id).toLowerCase();
  const rows = byId[key] ?? [];
  return typeof limit === "number" ? rows.slice(0, Math.max(0, limit)) : rows;
}

export function hasMock(id: string): boolean {
  return getMockRows(id).length > 0;
}
