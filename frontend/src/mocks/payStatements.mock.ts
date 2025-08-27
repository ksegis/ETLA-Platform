export type PayStatementRow = {
  checkNumber: string;
  employeeId: string;
  employeeName: string;
  payDate: string;           // ISO date
  payPeriodStart: string;    // ISO date
  payPeriodEnd: string;      // ISO date
  netPay: number;            // in dollars
  depositLast4?: string;     // optional
};

export function getPayStatementsMock(): PayStatementRow[] {
  return [
    {
      checkNumber: "001245",
      employeeId: "E-1001",
      employeeName: "Maria Alvarez",
      payDate: "2025-08-15",
      payPeriodStart: "2025-08-01",
      payPeriodEnd: "2025-08-15",
      netPay: 1650.75,
      depositLast4: "4821",
    },
    {
      checkNumber: "001246",
      employeeId: "E-1002",
      employeeName: "David Chen",
      payDate: "2025-08-15",
      payPeriodStart: "2025-08-01",
      payPeriodEnd: "2025-08-15",
      netPay: 1789.10,
      depositLast4: "1138",
    },
    {
      checkNumber: "001247",
      employeeId: "E-1003",
      employeeName: "Sofia Martinez",
      payDate: "2025-08-15",
      payPeriodStart: "2025-08-01",
      payPeriodEnd: "2025-08-15",
      netPay: 1498.30,
      depositLast4: "9022",
    },
  ];
}
