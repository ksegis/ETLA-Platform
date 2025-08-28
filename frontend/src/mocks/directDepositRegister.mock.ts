// ✅ make sure both the type and the function are exported

export type DirectDepositRow = {
  employeeId: string;
  employeeName: string;
  payDate: string;       // ISO
  amount: number;        // dollars
  bankName: string;
  accountType: "Checking" | "Savings";
  accountLast4: string;  // last 4 only
  routingMasked?: string;
};

// ✅ NAMED EXPORT — this is what your route imports
export function getDirectDepositRegisterMock(): DirectDepositRow[] {
  return [
    {
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
      employeeId: "E-1002",
      employeeName: "David Chen",
      payDate: "2025-08-15",
      amount: 1789.10,
      bankName: "Atlantic Intl",
      accountType: "Savings",
      accountLast4: "1138",
      routingMasked: "*****-***-104",
    },
    {
      employeeId: "E-1003",
      employeeName: "Sofia Martinez",
      payDate: "2025-08-15",
      amount: 1498.30,
      bankName: "Heritage Bank",
      accountType: "Checking",
      accountLast4: "9022",
      routingMasked: "*****-***-207",
    },
  ];
}
