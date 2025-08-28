export type DirectDepositRow = {
  id: string;                 // <-- added
  employeeId: string;
  employeeName: string;
  payDate: string;
  amount: number;
  bankName: string;
  accountType: "Checking" | "Savings";
  accountLast4: string;
  routingMasked?: string;
};

export function getDirectDepositRegisterMock(): DirectDepositRow[] {
  return [
    {
      id: "DD-1001",          // <-- added
      employeeId: "E-1001",
      employeeName: "Maria Alvarez",
      payDate: "2025-08-15",
      amount: 1650.75,
      bankName: "Belize Bank",
      accountType: "Checking",
      accountLast4: "4821",
      routingMasked: "*****-***-001",
    },
    {
      id: "DD-1002",
      employeeId: "E-1002",
      employeeName: "David Chen",
      payDate: "2025-08-15",
      amount: 1789.1,
      bankName: "Atlantic Intl",
      accountType: "Savings",
      accountLast4: "1138",
      routingMasked: "*****-***-104",
    },
    {
      id: "DD-1003",
      employeeId: "E-1003",
      employeeName: "Sofia Martinez",
      payDate: "2025-08-15",
      amount: 1498.3,
      bankName: "Heritage Bank",
      accountType: "Checking",
      accountLast4: "9022",
      routingMasked: "*****-***-207",
    },
  ];
}
