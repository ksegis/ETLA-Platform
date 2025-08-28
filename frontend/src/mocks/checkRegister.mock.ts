export type CheckRegisterRow = {
  id: string;                 // <-- added
  checkNumber: string;
  employeeId: string;
  employeeName: string;
  payDate: string;
  grossPay: number;
  taxes: number;
  deductions: number;
  netPay: number;
};

export function getCheckRegisterMock(): CheckRegisterRow[] {
  return [
    {
      id: "CR-001245",        // <-- added
      checkNumber: "001245",
      employeeId: "E-1001",
      employeeName: "Maria Alvarez",
      payDate: "2025-08-15",
      grossPay: 2125.0,
      taxes: 325.4,
      deductions: 148.85,
      netPay: 1650.75,
    },
    {
      id: "CR-001246",
      checkNumber: "001246",
      employeeId: "E-1002",
      employeeName: "David Chen",
      payDate: "2025-08-15",
      grossPay: 2310.5,
      taxes: 352.7,
      deductions: 168.7,
      netPay: 1789.1,
    },
    {
      id: "CR-001247",
      checkNumber: "001247",
      employeeId: "E-1003",
      employeeName: "Sofia Martinez",
      payDate: "2025-08-15",
      grossPay: 1920.4,
      taxes: 279.65,
      deductions: 142.45,
      netPay: 1498.3,
    },
  ];
}
