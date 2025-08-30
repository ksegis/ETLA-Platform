'use client';

import ReportGrid from '@/app/reporting/_components/ReportGrid';
import type { Col } from '@/features/reports/GenericReportTable';

type Props = {
  /** Which group’s cards to show on this tab */
  group:
    | 'employees'
    | 'checks'
    | 'jobs'
    | 'salary'
    | 'timecards';
  /** Customer to pass through to the modal/table */
  customerId?: string;
};

export default function ReportTray({ group, customerId = 'DEMO' }: Props) {
  const employeesReports = [
    {
      id: 'employees/active',
      title: 'Active Employees',
      description: 'Current active headcount with status and hire date.',
      columns: [
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'name', label: 'Name' },
        { key: 'department', label: 'Department' },
        { key: 'status', label: 'Status' },
        { key: 'hire_date', label: 'Hire Date' },
      ] satisfies Col[],
    },
    {
      id: 'employees/roster',
      title: 'Employee Roster',
      description: 'All employees with contact details.',
      columns: [
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'department', label: 'Department' },
        { key: 'status', label: 'Status' },
      ] satisfies Col[],
    },
  ];

  const checksReports = [
    {
      id: 'checks/pay-statements',
      title: 'Pay Statements',
      description: 'Facsimile view of individual pay stubs.',
      columns: [
        { key: 'check_number', label: 'Check #' },
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'pay_date', label: 'Pay Date' },
        { key: 'net_pay', label: 'Net Pay' },
        { key: 'deposit_last4', label: 'Deposit (last 4)' },
      ] satisfies Col[],
      hasFacsimile: true,
    },
    {
      id: 'checks/check-register',
      title: 'Check Register',
      description: 'Checks with gross, taxes, deductions, and net.',
      columns: [
        { key: 'check_number', label: 'Check #' },
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'pay_date', label: 'Pay Date' },
        { key: 'gross_pay', label: 'Gross' },
        { key: 'taxes', label: 'Taxes' },
        { key: 'deductions', label: 'Deductions' },
        { key: 'net_pay', label: 'Net' },
      ] satisfies Col[],
    },
    {
      id: 'checks/direct-deposit-register',
      title: 'Direct Deposit Register',
      description: 'ACH distribution by account.',
      columns: [
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'pay_date', label: 'Pay Date' },
        { key: 'amount', label: 'Amount' },
        { key: 'bank_name', label: 'Bank' },
        { key: 'account_type', label: 'Type' },
        { key: 'account_last4', label: 'Acct Last 4' },
      ] satisfies Col[],
    },
    {
      id: 'checks/w2-forms',
      title: 'W-2 Forms',
      description: 'W-2 facsimiles (masked SSN).',
      columns: [
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'tax_year', label: 'Tax Year' },
        { key: 'wages', label: 'Wages' },
        { key: 'federal_tax_withheld', label: 'Federal Withheld' },
        { key: 'state', label: 'State' },
        { key: 'state_wages', label: 'State Wages' },
      ] satisfies Col[],
      hasFacsimile: true,
    },
    {
      id: 'checks/garnishment-register',
      title: 'Garnishment Register',
      description: 'Garnishment deductions with case and YTD.',
      columns: [
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'order_type', label: 'Order Type' },
        { key: 'case_number', label: 'Case #' },
        { key: 'pay_date', label: 'Pay Date' },
        { key: 'amount', label: 'Amount' },
        { key: 'ytd', label: 'YTD' },
      ] satisfies Col[],
    },
    {
      id: 'checks/payroll-tax-liability',
      title: 'Payroll Tax Liability',
      description: 'Tax, period end, deposit due, deposited, status.',
      columns: [
        { key: 'tax_name', label: 'Tax' },
        { key: 'period_end', label: 'Period End' },
        { key: 'liability', label: 'Liability' },
        { key: 'deposit_due', label: 'Deposit Due' },
        { key: 'deposited', label: 'Deposited' },
        { key: 'status', label: 'Status' },
      ] satisfies Col[],
    },
  ];

  const jobsReports = [
    {
      id: 'jobs/job-roster',
      title: 'Job Roster',
      description: 'Active jobs with core profile fields.',
      columns: [
        { key: 'job_code', label: 'Job Code' },
        { key: 'job_name', label: 'Job Name' },
        { key: 'department', label: 'Dept' },
        { key: 'status', label: 'Status' },
        { key: 'start_date', label: 'Start' },
        { key: 'end_date', label: 'End' },
      ] satisfies Col[],
    },
    {
      id: 'jobs/job-costing',
      title: 'Job Costing',
      description: 'Hours and amounts by job.',
      columns: [
        { key: 'job_code', label: 'Job Code' },
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'hours', label: 'Hours' },
        { key: 'amount', label: 'Amount' },
      ] satisfies Col[],
    },
  ];

  const salaryReports = [
    {
      id: 'salary/earnings-summary',
      title: 'Earnings – Summary',
      description: 'Totals by employee and earning type.',
      columns: [
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'earning_type', label: 'Type' },
        { key: 'amount', label: 'Amount' },
      ] satisfies Col[],
    },
    {
      id: 'salary/earnings-detail',
      title: 'Earnings – Detail',
      description: 'Per-check earning lines.',
      columns: [
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'pay_date', label: 'Pay Date' },
        { key: 'earning_type', label: 'Type' },
        { key: 'hours', label: 'Hours' },
        { key: 'amount', label: 'Amount' },
      ] satisfies Col[],
    },
  ];

  const timecardsReports = [
    {
      id: 'timecards/timesheet-summary',
      title: 'Timesheet – Summary',
      description: 'Totals by employee and period.',
      columns: [
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'period_start', label: 'Start' },
        { key: 'period_end', label: 'End' },
        { key: 'hours', label: 'Hours' },
      ] satisfies Col[],
    },
    {
      id: 'timecards/timesheet-detail',
      title: 'Timesheet – Detail',
      description: 'Daily punches / projects.',
      columns: [
        { key: 'employee_id', label: 'Employee ID' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'work_date', label: 'Work Date' },
        { key: 'project', label: 'Project' },
        { key: 'hours', label: 'Hours' },
      ] satisfies Col[],
    },
  ];

  const map: Record<Props['group'], { id: string; title: string; description?: string; columns: Col[]; hasFacsimile?: boolean }[]> =
    {
      employees: employeesReports,
      checks: checksReports,
      jobs: jobsReports,
      salary: salaryReports,
      timecards: timecardsReports,
    };

  const reports = map[group] ?? [];

  // Render the grid of cards (click → ReportModal)
  return (
    <div className="px-2">
      <ReportGrid customerId={customerId} reports={reports as any} />
    </div>
  );
}
