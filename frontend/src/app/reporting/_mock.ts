// frontend/src/app/reporting/_mock.ts
// Deterministic mock data for each report id.

import { getReportById } from "./_data";

const EMPLOYEES = [
  { id: "E001", name: "Ava Thompson", dept: "Finance", job: "Accountant" },
  { id: "E002", name: "Liam Johnson", dept: "Operations", job: "Supervisor" },
  { id: "E003", name: "Mia Chen", dept: "Engineering", job: "Software Eng II" },
  { id: "E004", name: "Noah Patel", dept: "HR", job: "HR Generalist" },
  { id: "E005", name: "Olivia Garcia", dept: "Sales", job: "AE" },
];

const DEPARTMENTS = ["Finance", "Operations", "Engineering", "HR", "Sales"] as const;
const POSITIONS = ["Analyst I", "Analyst II", "Supervisor", "Manager", "Director"] as const;
const REASONS = ["Merit", "Promotion", "Market", "Adjustment", "Lump Sum"] as const;
const STATUSES = ["Active", "Leave", "Terminated", "Rehired"] as const;

const pad = (n: number) => n.toString().padStart(2, "0");
const dt = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const dollars = (n: number) => Number(n.toFixed(2));
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

// --- Per-report factories ------------------------------------------------
function mockCheckDetailHistory() {
  return EMPLOYEES.flatMap((e, i) =>
    range(3).map((j) => {
      const checkNo = 100100 + i * 10 + j;
      const gross = 2200 + j * 50 + i * 20;
      const taxes = gross * 0.22;
      const deduct = 85 + (j % 2) * 20;
      const net = gross - taxes - deduct;
      return {
        checkNumber: String(checkNo),
        payDate: dt(2024, 9 - j, 15),
        payPeriod: `${dt(2024, 9 - j, 1)} – ${dt(2024, 9 - j, 15)}`,
        employeeId: e.id,
        employeeName: e.name,
        department: e.dept,
        earnings: dollars(gross),
        taxes: dollars(taxes),
        deductions: dollars(deduct),
        netPay: dollars(net),
        memo: j === 1 ? "401k catch-up" : "",
      };
    })
  );
}

function mockTimecardDetailHistory() {
  return EMPLOYEES.flatMap((e, i) =>
    range(5).map((d) => ({
      employeeId: e.id,
      employeeName: e.name,
      date: dt(2024, 8, 1 + d),
      in1: "08:00",
      out1: "12:00",
      in2: "13:00",
      out2: "17:00",
      hours: 8,
      ptoHours: d === 2 && i % 2 === 0 ? 8 : 0,
      transferDept: d === 3 ? pick(DEPARTMENTS) : "",
      approvedBy: i % 2 === 0 ? "Supervisor A" : "Supervisor B",
    }))
  );
}

function mockSalaryHistory() {
  return EMPLOYEES.flatMap((e, i) =>
    range(3).map((k) => {
      const base = 60000 + i * 2500 + k * 1500;
      const pct = [3, 4, 5][k] ?? 3;
      return {
        employeeId: e.id,
        employeeName: e.name,
        effectiveDate: dt(2023 + k, 1 + k, 1 + i),
        amount: dollars(base),
        percentChange: pct,
        changeAmount: dollars((base * pct) / 100),
        reasonCode: REASONS[k % REASONS.length],
        memo: k === 2 ? "Promotion to level II" : "",
      };
    })
  );
}

function mockJobHistory() {
  return EMPLOYEES.flatMap((e, i) =>
    range(3).map((k) => ({
      employeeId: e.id,
      employeeName: e.name,
      effectiveDate: dt(2023 + k, 2 + k, 5 + i),
      jobTitle: k === 2 ? `${e.job} (Sr.)` : e.job,
      location: k === 1 ? "Dallas, TX" : "Austin, TX",
      reasonCode: k === 2 ? "Promotion" : "Reassignment",
      memo: k === 0 ? "Org realignment" : "",
    }))
  );
}

function mockPositionHistory() {
  return EMPLOYEES.flatMap((e, i) =>
    range(2).map((k) => ({
      employeeId: e.id,
      employeeName: e.name,
      effectiveDate: dt(2024, 1 + k, 10 + i),
      position: pick(POSITIONS),
      flsa: k % 2 === 0 ? "Exempt" : "Non-Exempt",
      grade: 10 + i + k,
      supervisor: i % 2 === 0 ? "Jordan Lee" : "Taylor Kim",
    }))
  );
}

function mockDepartmentAnalysis() {
  return DEPARTMENTS.map((d) => {
    const headcount = 5 + Math.floor(Math.random() * 6);
    const avgRate = dollars(28 + Math.random() * 22);
    const ot = dollars(Math.random() * 1200);
    const labor = dollars(headcount * avgRate * 80 + ot * 1.5);
    return {
      department: d,
      headcount,
      avgHourlyRate: avgRate,
      overtimeHours: dollars(ot / 40),
      laborCost: labor,
    };
  });
}

function mockStatusHistory() {
  return EMPLOYEES.map((e, i) => ({
    employeeId: e.id,
    employeeName: e.name,
    hireDate: dt(2021, 5 + (i % 5), 10),
    rehireDate: i % 4 === 0 ? dt(2023, 3, 1) : "",
    leaveDate: i % 3 === 0 ? dt(2024, 2, 15) : "",
    returnDate: i % 3 === 0 ? dt(2024, 3, 15) : "",
    termDate: i === 4 ? dt(2024, 9, 30) : "",
    status: i === 4 ? "Terminated" : pick(STATUSES),
  }));
}

function mockBenefitHistory() {
  return EMPLOYEES.flatMap((e) => [
    {
      employeeId: e.id,
      employeeName: e.name,
      plan: "Medical PPO",
      coverage: "Employee + Spouse",
      tier: "PPO",
      electionDate: dt(2024, 1, 1),
      eeCost: dollars(115.25),
      erCost: dollars(380.0),
    },
    {
      employeeId: e.id,
      employeeName: e.name,
      plan: "Dental",
      coverage: "Employee",
      tier: "Standard",
      electionDate: dt(2024, 1, 1),
      eeCost: dollars(14.5),
      erCost: dollars(20.0),
    },
  ]);
}

function mockRecruitmentHistory() {
  return range(10).map((i) => ({
    requisition: `REQ-${2024}${100 + i}`,
    candidate: i % 2 === 0 ? "Chris Park" : "Riley Stone",
    stage: ["Applied", "Phone Screen", "Onsite", "Offer", "Hired"][i % 5],
    stageDate: dt(2024, 1 + (i % 6), 6 + (i % 20)),
    resume: "resume.pdf",
    notes: i % 3 === 0 ? "Strong SQL" : "Needs JS depth",
  }));
}

function mockPerformanceHistory() {
  return EMPLOYEES.map((e, i) => ({
    employeeId: e.id,
    employeeName: e.name,
    reviewDate: dt(2024, 3 + i, 20),
    rating: ["Meets", "Exceeds", "Outstanding"][i % 3],
    notes: "Annual performance review",
    documentName: `review_${e.id}_${2024}.pdf`,
  }));
}

function mockPaperRecordsHistory() {
  return EMPLOYEES.map((e, i) => ({
    employeeId: e.id,
    employeeName: e.name,
    docName: `I-9_${e.id}.pdf`,
    docType: "I-9",
    docDate: dt(2021, 5 + (i % 5), 12),
  }));
}

function mockW2Images() {
  return EMPLOYEES.map((e) => ({
    employeeId: e.id,
    employeeName: e.name,
    taxYear: 2023,
    documentName: `W2_${e.id}_2023.pdf`,
  }));
}

// Public factory
export function getMockRowsForReport(id: string): any[] {
  switch (id) {
    case "check-detail-history":
      return mockCheckDetailHistory();
    case "timecard-detail-history":
      return mockTimecardDetailHistory();
    case "salary-history":
      return mockSalaryHistory();
    case "job-history":
      return mockJobHistory();
    case "position-history":
      return mockPositionHistory();
    case "department-analysis":
      return mockDepartmentAnalysis();
    case "status-history":
      return mockStatusHistory();
    case "benefit-history":
      return mockBenefitHistory();
    case "recruitment-history":
      return mockRecruitmentHistory();
    case "performance-history":
      return mockPerformanceHistory();
    case "paper-records-history":
      return mockPaperRecordsHistory();
    case "w2-images":
      return mockW2Images();
    default:
      return [{ sample: "No mock defined for this report id", id }];
  }
}

// Back-compat alias (so existing imports still work)
export const getMockRows = getMockRowsForReport;

// Small helper (rarely used by callers, but handy)
export function ensureReportHasMock(id: string) {
  const r = getReportById(id);
  if (!r) throw new Error(`Unknown report id: ${id}`);
  return true;
}
