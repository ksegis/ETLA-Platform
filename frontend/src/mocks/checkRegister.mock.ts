export type CheckRegisterRow = {
  checkNumber: string;
  employeeId: string;
  employeeName: string;
  payDate: string; // ISO
  grossPay: number;
  taxes: number;
  deductions: number;
  netPay: number;
};

export function getCheckRegisterMock(): CheckRegisterRow[] {
  return [
    {
      checkNumber: "001245",
      employeeId: "E-1001",
      employeeName: "Maria Alvarez",
      payDate: "2025-08-15",
      grossPay: 2125.00,
      taxes: 325.40,
      deductions: 148.85,
      netPay: 1650.75,
    },
    {
      checkNumber: "001246",
      employeeId: "E-1002",
      employeeName: "David Chen",
      payDate: "2025-08-15",
      grossPay: 2310.50,
      taxes: 352.70,
      deductions: 168.70,
      netPay: 1789.10,
    },
    {
      checkNumber: "001247",
      employeeId: "E-1003",
      employeeName: "Sofia Martinez",
      payDate: "2025-08-15",
      grossPay: 1920.40,
      taxes: 279.65,
      deductions: 142.45,
      netPay: 1498.30,
    },
  ];
}
