export type PayStatementRow = {
  id: string;                 // <-- added
  checkNumber: string;
  employeeId: string;
  employeeName: string;
  payDate: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  netPay: number;
  depositLast4?: string;
};

export function getPayStatementsMock(): PayStatementRow[] {
  return [
    {
      id: "PS-001245",        // <-- added
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
      id: "PS-001246",
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
      id: "PS-001247",
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
