export type MockPayload = {
  columns: string[];
  rows: any[];
  docs?: Array<{ id: string; name: string; url?: string; size?: number }>;
};

export function getMockReport(id: string): MockPayload | null {
  // Shared sample PDF served from /public. Add any PDF at frontend/public/sample.pdf
  const samplePdf = "/sample.pdf";

  switch (id) {
    case "check_detail_history":
      return {
        columns: ["EmployeeID", "EmployeeName", "PayDate", "PayWeek", "PayNumber", "CheckNumber", "Gross", "Taxes", "Deductions", "NetPay", "Memo"],
        rows: [
          ["E001", "Aeryn Sun", "2025-08-15", "2025-W33", 16, "100123", 2145.25, 432.12, 210.00, 1503.13, "Biweekly"],
          ["E002", "John Crichton", "2025-08-15", "2025-W33", 16, "100124", 1880.00, 376.11, 140.00, 1363.89, "Biweekly"],
          ["E003", "D. Peacekeeper", "2025-08-15", "2025-W33", 16, "100125", 1420.50, 270.22, 95.00, 1055.28, "New position"]
        ]
      };

    case "time_card_detail_history":
      return {
        columns: ["EmployeeID", "Date", "In", "Out", "Hours", "PTOHours", "Department"],
        rows: [
          ["E001", "2025-08-12", "08:00", "17:00", 9, 0, "SALES"],
          ["E001", "2025-08-13", "08:02", "17:05", 9.05, 0, "SALES"],
          ["E002", "2025-08-12", "07:55", "16:45", 8.83, 0, "SRV/HUB"]
        ]
      };

    case "salary_history":
      return {
        columns: ["EmployeeID", "EffectiveDate", "SalaryAmount", "IncreasePercent", "IncreaseAmount", "ReasonCode", "Memo"],
        rows: [
          ["E001", "2025-07-01", 78000, 3, 2274, "MERIT", "Annual increase"],
          ["E001", "2024-07-01", 75726, 4, 2911, "PROMO", "Promotion to Sr."]
        ]
      };

    case "job_history":
      return {
        columns: ["EmployeeID", "EffectiveDate", "JobTitle", "ReasonCode", "Memo"],
        rows: [
          ["E001", "2025-07-01", "Senior Sales Associate", "PROMO", "Promotion"],
          ["E001", "2023-02-01", "Sales Associate", "MOVE", "Dept transfer"]
        ]
      };

    case "status_history":
      return {
        columns: ["EmployeeID", "HireDate", "TermDate", "LeaveStart", "LeaveEnd", "Status"],
        rows: [
          ["E001", "2021-03-10", null, null, null, "Active"],
          ["E002", "2020-01-05", "2025-06-30", null, null, "Terminated"]
        ]
      };

    case "benefit_history":
      return {
        columns: ["EmployeeID", "PlanName", "Coverage", "ElectionDate", "EmployerCost", "EmployeeCost"],
        rows: [
          ["E001", "Medical PPO", "Employee + Spouse", "2025-01-01", 420.00, 185.00],
          ["E001", "Dental", "Employee", "2025-01-01", 30.00, 15.00]
        ]
      };

    case "w2_documents":
      return {
        columns: ["id", "name", "url", "size"],
        rows: [
          { id: "w2-2024-001", name: "W2_AerynSun_2024.pdf", url: samplePdf, size: 210000 },
          { id: "w2-2024-002", name: "W2_JohnCrichton_2024.pdf", url: samplePdf, size: 205000 }
        ],
        docs: [
          { id: "w2-2024-001", name: "W2_AerynSun_2024.pdf", url: samplePdf, size: 210000 },
          { id: "w2-2024-002", name: "W2_JohnCrichton_2024.pdf", url: samplePdf, size: 205000 }
        ]
      };

    case "recruitment_history":
      return {
        columns: ["CandidateID", "Date", "Stage", "Notes", "url"],
        rows: [
          ["C-001", "2024-10-11", "Interview", "Strong SQL", samplePdf],
          ["C-002", "2024-11-02", "Offer", "Accepted", samplePdf]
        ],
        docs: [
          { id: "C-001", name: "Resume_C-001.pdf", url: samplePdf, size: 180000 },
          { id: "C-002", name: "CoverLetter_C-002.pdf", url: samplePdf, size: 150000 }
        ]
      };

    case "performance_history":
      return {
        columns: ["EmployeeID", "ReviewDate", "Rating", "SupervisorNotes", "url"],
        rows: [
          ["E001", "2025-06-30", "Exceeds", "Great client outcomes.", samplePdf],
          ["E001", "2024-06-30", "Meets", "Solid performance.", samplePdf]
        ],
        docs: [
          { id: "P-001", name: "2025_Performance_Review.pdf", url: samplePdf, size: 190000 }
        ]
      };

    case "paper_records_history":
      return {
        columns: ["id", "name", "url", "size"],
        rows: [
          { id: "PR-001", name: "I-9_AerynSun.pdf", url: samplePdf, size: 120000 },
          { id: "PR-002", name: "Direct_Deposit_Form.pdf", url: samplePdf, size: 90000 }
        ],
        docs: [
          { id: "PR-001", name: "I-9_AerynSun.pdf", url: samplePdf, size: 120000 },
          { id: "PR-002", name: "Direct_Deposit_Form.pdf", url: samplePdf, size: 90000 }
        ]
      };

    case "department_analysis":
      return {
        columns: ["Department", "Headcount", "AvgComp", "TotalCost"],
        rows: [
          ["SALES", 24, 78500, 1884000],
          ["SRV/HUB", 12, 70200, 842400],
          ["TEACH", 33, 61900, 2042700]
        ]
      };

    default:
      return {
        columns: ["Note"],
        rows: [{ Note: "Demo mode: no mock defined for this report id yet." }]
      };
  }
}
