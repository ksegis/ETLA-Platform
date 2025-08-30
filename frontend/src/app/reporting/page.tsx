'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  Users,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  Briefcase,
} from 'lucide-react'

import ReportGrid from '@/app/reporting/_components/ReportGrid'
import type { Col } from '@/features/reports/GenericReportTable'

type ReportDef = {
  id: string
  title: string
  description?: string
  columns: Col[]
  hasFacsimile?: boolean
}

export default function ReportingDashboardPage() {
  const { tenant } = useAuth()
  const [activeTab, setActiveTab] = useState<'employee' | 'checks' | 'jobs' | 'salary' | 'timecards' | 'all-reports'>('employee')

  // Derive customerId from URL (?customerId=) with fallback to DEMO
  const [customerId, setCustomerId] = useState<string>('DEMO')
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const cid = sp.get('customerId') || sp.get('customer_id')
      if (cid && cid.trim()) setCustomerId(cid.trim())
    } catch {
      // no-op on SSR
    }
  }, [])

  // ===== Report catalogs per tab =====
  const employeeReports: ReportDef[] = useMemo(
    () => [
      {
        id: 'employees/active',
        title: 'Active Employees',
        description: 'Current active headcount by status',
        columns: [
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'status', label: 'Status' },
          { key: 'hire_date', label: 'Hire Date' },
        ],
      },
      {
        id: 'employees/roster',
        title: 'Employee Roster',
        description: 'All employees with contact details',
        columns: [
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Status' },
        ],
      },
      {
        id: 'employees/demographics',
        title: 'Employee Demographics',
        description: 'Department, location, and diversity attributes',
        columns: [
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'department', label: 'Department' },
          { key: 'location', label: 'Location' },
          { key: 'gender', label: 'Gender' },
          { key: 'ethnicity', label: 'Ethnicity' },
        ],
      },
      {
        id: 'employees/status-history',
        title: 'Status History',
        description: 'Active/Leave/Term changes over time',
        columns: [
          { key: 'employee_code', label: 'Employee' },
          { key: 'status', label: 'Status' },
          { key: 'effective_date', label: 'Effective Date' },
          { key: 'note', label: 'Notes' },
        ],
      },
    ],
    []
  )

  const checkReports: ReportDef[] = useMemo(
    () => [
      {
        id: 'checks/pay-statements',
        title: 'Pay Statements',
        description: 'Per-employee net pay by pay date',
        hasFacsimile: true,
        columns: [
          { key: 'check_number', label: 'Check #' },
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'employee_name', label: 'Employee' },
          { key: 'pay_date', label: 'Pay Date' },
          { key: 'net_pay', label: 'Net Pay' },
          { key: 'deposit_last4', label: 'Acct Last 4' },
        ],
      },
      {
        id: 'checks/garnishment-register',
        title: 'Garnishment Register',
        description: 'Per-pay-period garnishments',
        columns: [
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'employee_name', label: 'Employee' },
          { key: 'garnishment_type', label: 'Type' },
          { key: 'amount', label: 'Amount' },
          { key: 'pay_date', label: 'Pay Date' },
        ],
      },
      {
        id: 'checks/payroll-tax-liability',
        title: 'Payroll Tax Liability',
        description: 'Employer & employee tax totals',
        columns: [
          { key: 'period_start', label: 'Start' },
          { key: 'period_end', label: 'End' },
          { key: 'federal_tax', label: 'Federal' },
          { key: 'state_tax', label: 'State' },
          { key: 'fica', label: 'FICA' },
          { key: 'total_tax', label: 'Total' },
        ],
      },
      {
        id: 'checks/w2-forms',
        title: 'W-2 Forms',
        description: 'Annual forms by employee',
        hasFacsimile: true,
        columns: [
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'employee_name', label: 'Employee' },
          { key: 'tax_year', label: 'Tax Year' },
          { key: 'created_at', label: 'Created' },
        ],
      },
    ],
    []
  )

  const jobReports: ReportDef[] = useMemo(
    () => [
      {
        id: 'jobs/job-roster',
        title: 'Job Roster',
        description: 'All jobs / projects',
        columns: [
          { key: 'job_id', label: 'Job ID' },
          { key: 'job_name', label: 'Job Name' },
          { key: 'department', label: 'Department' },
          { key: 'status', label: 'Status' },
          { key: 'start_date', label: 'Start' },
          { key: 'end_date', label: 'End' },
        ],
      },
      {
        id: 'jobs/job-costing',
        title: 'Job Costing',
        description: 'Hours and pay allocated by job',
        columns: [
          { key: 'job_id', label: 'Job ID' },
          { key: 'job_name', label: 'Job Name' },
          { key: 'total_hours', label: 'Hours' },
          { key: 'gross_pay', label: 'Gross Pay' },
          { key: 'period_start', label: 'Start' },
          { key: 'period_end', label: 'End' },
        ],
      },
    ],
    []
  )

  const salaryReports: ReportDef[] = useMemo(
    () => [
      {
        id: 'salary/earnings-summary',
        title: 'Earnings Summary',
        description: 'Totals by employee for a period',
        columns: [
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'employee_name', label: 'Employee' },
          { key: 'regular_hours', label: 'Reg Hrs' },
          { key: 'overtime_hours', label: 'OT Hrs' },
          { key: 'gross_pay', label: 'Gross' },
          { key: 'period_start', label: 'Start' },
          { key: 'period_end', label: 'End' },
        ],
      },
      {
        id: 'salary/earnings-detail',
        title: 'Earnings Detail',
        description: 'Line-item earnings per check',
        columns: [
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'earning_code', label: 'Code' },
          { key: 'hours', label: 'Hours' },
          { key: 'rate', label: 'Rate' },
          { key: 'amount', label: 'Amount' },
          { key: 'pay_date', label: 'Pay Date' },
        ],
      },
    ],
    []
  )

  const timeReports: ReportDef[] = useMemo(
    () => [
      {
        id: 'timecards/timesheet-summary',
        title: 'Timesheet Summary',
        description: 'Weekly totals by employee',
        columns: [
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'employee_name', label: 'Employee' },
          { key: 'week_start', label: 'Week Start' },
          { key: 'regular_hours', label: 'Reg Hrs' },
          { key: 'overtime_hours', label: 'OT Hrs' },
          { key: 'total_hours', label: 'Total' },
        ],
      },
      {
        id: 'timecards/timesheet-detail',
        title: 'Timesheet Detail',
        description: 'Daily punches / shifts',
        columns: [
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'work_date', label: 'Date' },
          { key: 'in_time', label: 'In' },
          { key: 'out_time', label: 'Out' },
          { key: 'hours', label: 'Hours' },
          { key: 'job_id', label: 'Job' },
        ],
      },
    ],
    []
  )

  const reportingTabs = [
    { id: 'employee', name: 'Employee', icon: Users },
    { id: 'checks', name: 'Checks', icon: CheckCircle },
    { id: 'jobs', name: 'Jobs', icon: Briefcase },
    { id: 'salary', name: 'Salary', icon: DollarSign },
    { id: 'timecards', name: 'Timecards', icon: Clock },
    { id: 'all-reports', name: 'All Reports', icon: FileText },
  ] as const

  const renderReportGrid = (reports: ReportDef[]) => (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>Select a report below to preview, filter, paginate, and export.</CardDescription>
      </CardHeader>
      <CardContent>
        <ReportGrid customerId={customerId} reports={reports} />
      </CardContent>
    </Card>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'employee':
        return (
          <div className="space-y-6">
            {/* --- Your existing KPI cards --- */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Employees</p>
                      <p className="text-2xl font-bold text-gray-900">2,113</p>
                      <p className="text-xs text-green-600">+2.3% from last period</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Employees</p>
                      <p className="text-2xl font-bold text-gray-900">2,087</p>
                      <p className="text-xs text-green-600">98.8% active rate</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New Hires</p>
                      <p className="text-2xl font-bold text-gray-900">47</p>
                      <p className="text-xs text-blue-600">This month</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Terminations</p>
                      <p className="text-2xl font-bold text-gray-900">21</p>
                      <p className="text-xs text-orange-600">This month</p>
                    </div>
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- Employee Reports grid --- */}
            {renderReportGrid(employeeReports)}
          </div>
        )

      case 'checks':
        return (
          <div className="space-y-6">
            {/* Existing metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Checks Processed</p>
                      <p className="text-2xl font-bold text-gray-900">4,226</p>
                      <p className="text-xs text-green-600">This pay period</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">$8.4M</p>
                      <p className="text-xs text-blue-600">Gross payroll</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Direct Deposits</p>
                      <p className="text-2xl font-bold text-gray-900">4,198</p>
                      <p className="text-xs text-green-600">99.3% electronic</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paper Checks</p>
                      <p className="text-2xl font-bold text-gray-900">28</p>
                      <p className="text-xs text-orange-600">0.7% physical</p>
                    </div>
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checks Reports grid */}
            {renderReportGrid(checkReports)}
          </div>
        )

      case 'jobs':
        return (
          <div className="space-y-6">
            {/* Existing metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">1,247</p>
                      <p className="text-xs text-green-600">This month</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">98.5%</p>
                      <p className="text-xs text-green-600">Above target</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                      <p className="text-2xl font-bold text-gray-900">4.2m</p>
                      <p className="text-xs text-green-600">-12% improvement</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">19</p>
                      <p className="text-xs text-orange-600">1.5% failure rate</p>
                    </div>
                    <Eye className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs Reports grid */}
            {renderReportGrid(jobReports)}
          </div>
        )

      case 'salary':
        return (
          <div className="space-y-6">
            {/* Existing metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                      <p className="text-2xl font-bold text-gray-900">$8.4M</p>
                      <p className="text-xs text-green-600">This period</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Salary</p>
                      <p className="text-2xl font-bold text-gray-900">$67,500</p>
                      <p className="text-xs text-blue-600">Annual equivalent</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overtime Pay</p>
                      <p className="text-2xl font-bold text-gray-900">$1.2M</p>
                      <p className="text-xs text-orange-600">14.3% of total</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bonuses</p>
                      <p className="text-2xl font-bold text-gray-900">$450K</p>
                      <p className="text-xs text-purple-600">5.4% of total</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Salary Reports grid */}
            {renderReportGrid(salaryReports)}
          </div>
        )

      case 'timecards':
        return (
          <div className="space-y-6">
            {/* Existing metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Hours</p>
                      <p className="text-2xl font-bold text-gray-900">84,520</p>
                      <p className="text-xs text-green-600">This period</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Regular Hours</p>
                      <p className="text-2xl font-bold text-gray-900">72,440</p>
                      <p className="text-xs text-blue-600">85.7% of total</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                      <p className="text-2xl font-bold text-gray-900">12,080</p>
                      <p className="text-xs text-orange-600">14.3% of total</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Hours/Employee</p>
                      <p className="text-2xl font-bold text-gray-900">40.2</p>
                      <p className="text-xs text-purple-600">Per week</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timecards Reports grid */}
            {renderReportGrid(timeReports)}
          </div>
        )

      case 'all-reports':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>Complete list of all available reports and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Reuse any marketing/UI here if you want; the grids above present the functional entries. */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-default">
                    <div className="flex items-center mb-3">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium">Employee Reports</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Active, roster, demographics, status history</p>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab('employee')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Open Employee Reports
                    </Button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-default">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="text-sm font-medium">Check Reports</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Pay statements, garnishments, tax liability, W-2</p>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab('checks')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Open Check Reports
                    </Button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-default">
                    <div className="flex items-center mb-3">
                      <Briefcase className="h-5 w-5 text-indigo-600 mr-2" />
                      <h4 className="text-sm font-medium">Job/Costing Reports</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Job roster & job costing</p>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab('jobs')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Open Job Reports
                    </Button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-default">
                    <div className="flex items-center mb-3">
                      <DollarSign className="h-5 w-5 text-emerald-600 mr-2" />
                      <h4 className="text-sm font-medium">Salary/Earnings Reports</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Earnings summary & detail</p>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab('salary')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Open Salary Reports
                    </Button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-default">
                    <div className="flex items-center mb-3">
                      <Clock className="h-5 w-5 text-purple-600 mr-2" />
                      <h4 className="text-sm font-medium">Time & Attendance</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Timesheet summary & detail</p>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab('timecards')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Open Time Reports
                    </Button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-default">
                    <div className="flex items-center mb-3">
                      <Settings className="h-5 w-5 text-slate-600 mr-2" />
                      <h4 className="text-sm font-medium">Custom Reports</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Build and customize your own reports</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Top Navigation + Actions */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HR/Payroll Reporting</h1>
              <p className="text-gray-600">
                Enterprise reporting by pay period, benefit group, and department{tenant?.name ? ` for ${tenant.name}` : ''}.
              </p>
              <p className="text-xs text-gray-500 mt-1">Customer: <span className="font-medium">{customerId}</span></p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={() => location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            {reportingTabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <TabIcon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">{renderTabContent()}</div>
      </div>
    </DashboardLayout>
  )
}
