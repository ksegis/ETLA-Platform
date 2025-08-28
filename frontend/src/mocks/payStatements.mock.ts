// src/mocks/payStatements.mock.ts

export type PayStatementRow = {
  id: string;
  checkNumber: string;
  employeeId: string;
  employeeName: string;
  payDate: string;        // ISO date
  payPeriodStart: string; // ISO date
  payPeriodEnd: string;   // ISO date
  netPay: number;
  depositLast4?: string;
};

export function getPayStatementsMock(): PayStatementRow[] {
  return [
    {
      id: "PS-001",
      checkNumber: "001245",
      employeeId: "E-1001",
      employeeName: "Maria Alvarez",
      payDate: "2025-08-15",
      payPeriodStart: "2025-08-01",
      payPeriodEnd: "2025-08-15",
      netPay: 1650.75,
      depositLast4: "4321",
    },
    {
      id: "PS-002",
      checkNumber: "001246",
      employeeId: "E-1002",
      employeeName: "Jamal Carter",
      payDate: "2025-08-15",
      payPeriodStart: "2025-08-01",
      payPeriodEnd: "2025-08-15",
      netPay: 1820.10,
      depositLast4: "1188",
    },
    {
      id: "PS-003",
      checkNumber: "001247",
      employeeId: "E-1003",
      employeeName: "Sofia Nguyen",
      payDate: "2025-08-15",
      payPeriodStart: "2025-08-01",
      payPeriodEnd: "2025-08-15",
      netPay: 1432.55,
      depositLast4: "0042",
    },
    {
      id: "PS-004",
      checkNumber: "001248",
      employeeId: "E-1004",
      employeeName: "Ethan Johnson",
      payDate: "2025-08-15",
      payPeriodStart: "2025-08-01",
      payPeriodEnd: "2025-08-15",
      netPay: 1975.00,
      depositLast4: "7799",
    },
    {
      id: "PS-005",
      checkNumber: "001249",
      employeeId: "E-1005",
      employeeName: "Priya Singh",
      payDate: "2025-08-15",
      payPeriodStart: "2025-08-01",
      payPeriodEnd: "2025-08-15",
      netPay: 1588.40,
      depositLast4: "6620",
    },
  ];
}
