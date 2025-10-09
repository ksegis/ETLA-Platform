'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Building,
  FileText,
  Clock,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  LayoutGrid,
  List,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant, useAccessibleTenantIds, useMultiTenantMode } from '@/contexts/TenantContext'
import { supabase } from '@/lib/supabase'

// Employee interface matching the database schema
interface Employee {
  id: string
  tenant_id: string
  employee_id: string
  first_name: string
  last_name: string
  email?: string
  date_of_birth?: string
  hire_date: string
  termination_date?: string
  status?: string
  department?: string
  job_title?: string
  pay_frequency?: string
  pay_type?: string
  base_pay_rate?: number
  annual_salary?: number
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  employment_status?: string
  employment_type?: string
  work_location?: string
  position?: string
  home_department?: string
  employee_code?: string
  employee_name?: string
  full_name?: string
  preferred_name?: string
  cost_center?: string
  division?: string
  location_branch?: string
  job_code?: string
  flsa_status?: string
  manager_supervisor?: string
  hr_business_partner?: string
  home_address?: string
  union_status?: string
  eeo_categories?: string
  created_at: string
  updated_at: string
}

// Department interface
interface Department {
  id: string
  tenant_id: string
  name: string
  description?: string
  manager?: string
  budget?: number
  created_at: string
  updated_at: string
}

// Statistics interface
interface EmployeeStats {
  totalEmployees: number
  activeEmployees: number
  departments: number
  selectedEmployee: string | null
}

// Data type tabs
type DataType = 'pay_statements' | 'timecards' | 'tax_records' | 'benefits' | 'job_history' | 'documents'

const dataTypeConfig = {
  pay_statements: { label: 'Pay Statements', shortLabel: 'Pay', icon: DollarSign, color: 'bg-green-100 text-green-700' },
  timecards: { label: 'Timecards', shortLabel: 'Time', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  tax_records: { label: 'Tax Records', shortLabel: 'Tax', icon: FileText, color: 'bg-red-100 text-red-700' },
  benefits: { label: 'Benefits', shortLabel: 'Benefits', icon: CheckCircle, color: 'bg-purple-100 text-purple-700' },
  job_history: { label: 'Job History', shortLabel: 'History', icon: TrendingUp, color: 'bg-orange-100 text-orange-700' },
  documents: { label: 'Documents', shortLabel: 'Docs', icon: FileText, color: 'bg-gray-100 text-gray-700' }
}

export default function ReportingCockpitPage() {
  const { user, tenantUser } = useAuth()
  const { selectedTenant } = useTenant()
  const accessibleTenantIds = useAccessibleTenantIds()
  const { isMultiTenant, availableTenants } = useMultiTenantMode()

// New interfaces for additional report categories
interface BenefitDeduction {
  id: string;
  benefit_deduction_id: string;
  employee_id: string;
  employee_name: string;
  deduction_type: string;
  deduction_code: string;
  amount: number;
  frequency: string;
  effective_date: string;
  end_date: string;
  employer_contribution: number;
  employee_contribution: number;
  court_order_number: string;
  garnishment_details: any;
  customer_id: string;
  tenant_id: string;
}

interface ComplianceRecord {
  id: string;
  compliance_id: string;
  employee_id: string;
  employee_name: string;
  compliance_type: string;
  reporting_period: string;
  status: string;
  data_details: any;
  filing_date: string;
  due_date: string;
  customer_id: string;
  tenant_id: string;
}

interface PayStatementDetail {
  id: string;
  check_number: string;
  employee_name: string;
  employee_code: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  regular_hours: number;
  overtime_hours: number;
  doubletime_hours: number;
  regular_pay: number;
  overtime_pay: number;
  bonus_amount: number;
  commission_amount: number;
  gross_pay: number;
  pretax_deductions: any;
  posttax_deductions: any;
  federal_tax_withheld: number;
  state_tax_withheld: number;
  local_tax_withheld: number;
  social_security_tax: number;
  medicare_tax: number;
  net_pay: number;
  ytd_gross: number;
  ytd_net: number;
  ytd_federal_tax: number;
  ytd_state_tax: number;
  ytd_social_security: number;
  ytd_medicare: number;
  direct_deposit_details: any;
  check_status: string;
}

// Enhanced filter interface
interface EnhancedFilters {
  startDate: string;
  endDate: string;
  department: string;
  location: string;
  employeeStatus: string;
  jobTitle: string;
  salaryMin: string;
  salaryMax: string;
  payType: string;
  flsaStatus: string;
  division: string;
  costCenter: string;
  unionStatus: string;
  eeoCategory: string;
  approvalStatus: string;
  taxYear: string;
  formType: string;
  deductionType: string;
  complianceType: string;
  searchTerm: string;
}

const EnhancedReportingPage: React.FC = () => {
  const { selectedTenant, isDemoMode, Loading: tenantloading } = useTenant();
  const accessibleTenantIds = useAccessibleTenantIds();
  const { isMultiTenant, availableTenants } = useMultiTenantMode();
  const [activeTab, setActiveTab] = useState<string>('employees');
  const [loading, setloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearchHelp, setShowSearchHelp] = useState<boolean>(false);
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState<boolean>(false);

  // Enhanced data states
  const [employeeData, setEmployeeData] = useState<EnhancedEmployee[]>([]);
  const [payStatementData, setPayStatementData] = useState<EnhancedPayStatement[]>([]);
  const [timecardData, setTimecardData] = useState<EnhancedTimecard[]>([]);
  const [jobData, setJobData] = useState<JobRecord[]>([]);
  const [taxData, setTaxData] = useState<TaxRecord[]>([]);
  const [benefitData, setBenefitData] = useState<BenefitDeduction[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceRecord[]>([]);
  const [selectedPayStatement, setSelectedPayStatement] = useState<PayStatementDetail | null>(null);
  const [selectedTimecard, setSelectedTimecard] = useState<EnhancedTimecard | null>(null);
  const [selectedTaxRecord, setSelectedTaxRecord] = useState<TaxRecord | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Statistics
  const [stats, setStats] = useState<EmployeeStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    selectedEmployee: null
  })

  // Load data using proven pattern from Project Management and Work Requests
  const loadData = async () => {
    const tenantIds = accessibleTenantIds
    
    if (!tenantIds || tenantIds.length === 0) {
      console.log('No accessible tenants, skipping load')
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Loading employee data for tenants:', tenantIds)
      
      // Load employees with error handling
      try {
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*')
          .in('tenant_id', tenantIds)
          .order('created_at', { ascending: false })
        
        if (employeesError) {
          console.error('Employees query error:', employeesError)
          setEmployees([])
        } else {
          console.log('✅ Loaded employees:', employeesData?.length || 0)
          setEmployees(employeesData || [])
        }
      } catch (err) {
        console.error('Employees query error:', err)
        setEmployees([])
      }

  const closeFacsimile = () => {
    setShowFacsimileModal(false);
    setFacsimileData(null);
    setFacsimileType(null);
    setSelectedEmployee(null);
  };

  // New facsimile modal handlers
  const handleViewFacsimile = (record: any) => {
    setNewFacsimileRecord(record);
    setNewFacsimileType(
      activeTab === 'timecards' ? 'timecard' : 
      activeTab === 'pay-statements' ? 'pay_statement' : 
      activeTab === 'tax-records' ? 'tax_w2' : 
      activeTab === 'jobs' ? 'job' :
      activeTab === 'benefits-deductions' ? 'benefit' :
      activeTab === 'compliance' ? 'compliance' :
      activeTab === 'employees' ? 'employee' :
      'expense'
    );
    setShowNewFacsimileModal(true);
  };

  const handlePrintFacsimile = (record: any) => {
    setNewFacsimileRecord(record);
    setNewFacsimileType(
      activeTab === 'timecards' ? 'timecard' : 
      activeTab === 'pay-statements' ? 'pay_statement' : 
      activeTab === 'tax-records' ? 'tax_w2' : 
      activeTab === 'jobs' ? 'job' :
      activeTab === 'benefits-deductions' ? 'benefit' :
      activeTab === 'compliance' ? 'compliance' :
      activeTab === 'employees' ? 'employee' :
      'expense'
    );
    setShowNewFacsimileModal(true);
    // Auto-trigger print after modal opens
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const closeNewFacsimile = () => {
    setShowNewFacsimileModal(false);
    setNewFacsimileRecord(null);
    setNewFacsimileType('');
  };

  const renderDataTypeContent = () => {
    switch (activeTab) {
      case 'employees':
        const filteredData = filterDataBySearch(employeeData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Employees"
            data={filteredData}
            columns={[
              { key: 'employee_name', label: 'Employee Name' },
              { key: 'employee_code', label: 'Employee Code' },
              { key: 'position', label: 'Position' },
              { key: 'home_department', label: 'Department' },
              { key: 'division', label: 'Division' },
              { key: 'employment_status', label: 'Status' },
              { key: 'hire_date', label: 'Hire Date' },
              { key: 'pay_type', label: 'Pay Type' },
            ]}
            onRowClick={(row) => setSelectedEmployee(row as FacsimileEmployee)}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode('employees')}
            loading={loading}
            error={error}
          />
        );
      case 'pay-statements':
        const filteredPayStatements = filterDataBySearch(payStatementData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Pay Statements"
            data={filteredPayStatements}
            columns={[
              { key: 'employee_name', label: 'Employee Name' },
              { key: 'pay_date', label: 'Pay Date' },
              { key: 'check_number', label: 'Check #' },
              { key: 'pay_period_start', label: 'Period Start' },
              { key: 'pay_period_end', label: 'Period End' },
              { key: 'gross_pay', label: 'Gross Pay', render: (item) => `$${(item.gross_pay || 0).toFixed(2)}` },
              { key: 'net_pay', label: 'Net Pay', render: (item) => `$${(item.net_pay || 0).toFixed(2)}` },
              { key: 'check_status', label: 'Status' },
            ]}
            onRowClick={(row) => openFacsimile(row as FacsimilePayStatement, 'pay_statement')}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode('pay-statements')}
            loading={loading}
            error={error}
          />
        );
      case 'timecards':
        const filteredTimecards = filterDataBySearch(timecardData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Timecards"
            data={filteredTimecards}
            columns={[
              { key: 'employee_name', label: 'Employee Name' },
              { key: 'work_date', label: 'Date' },
              { key: 'clock_in', label: 'Clock In' },
              { key: 'clock_out', label: 'Clock Out' },
              { key: 'total_hours', label: 'Total Hours' },
              { key: 'department', label: 'Department' },
              { key: 'approval_status', label: 'Status' },
            ]}
            onRowClick={(row) => openFacsimile(row as FacsimileTimecard, 'timecard')}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode="list"
            loading={loading}
            error={error}
          />
        );
      case 'tax-records':
        const filteredTaxRecords = filterDataBySearch(taxData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Tax Records"
            data={filteredTaxRecords}
            columns={[
              { key: 'employee_name', label: 'Employee Name' },
              { key: 'tax_year', label: 'Year' },
              { key: 'form_type', label: 'Form Type' },
              { key: 'wages_tips_compensation', label: 'Wages', render: (item) => `$${(item.wages_tips_compensation || 0).toFixed(2)}` },
              { key: 'federal_income_tax_withheld', label: 'Fed Tax', render: (item) => `$${(item.federal_income_tax_withheld || 0).toFixed(2)}` },
              { key: 'document_status', label: 'Status' },
            ]}
            onRowClick={(row) => openFacsimile(row as FacsimileTaxRecord, 'tax_w2')}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode('tax-records')}
            loading={loading}
            error={error}
          />
        );
      case 'benefits-deductions':
        const filteredBenefits = filterDataBySearch(benefitData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Benefits & Deductions"
            data={filteredBenefits}
            columns={[
              { key: 'employee_name', label: 'Employee Name' },
              { key: 'deduction_type', label: 'Type' },
              { key: 'amount', label: 'Amount', render: (item) => `$${(item.amount || 0).toFixed(2)}` },
              { key: 'frequency', label: 'Frequency' },
              { key: 'effective_date', label: 'Effective Date' },
              { key: 'employer_contribution', label: 'Employer Contrib.', render: (item) => `$${(item.employer_contribution || 0).toFixed(2)}` },
            ]}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode('benefits-deductions')}
            loading={loading}
            error={error}
          />
        );
      case 'jobs':
        const filteredJobs = filterDataBySearch(jobData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Jobs"
            data={filteredJobs}
            columns={[
              { key: 'job_title', label: 'Job Title' },
              { key: 'job_code', label: 'Job Code' },
              { key: 'department', label: 'Department' },
              { key: 'division', label: 'Division' },
              { key: 'effective_date', label: 'Start Date' },
              { key: 'end_date', label: 'End Date' },
              { key: 'status', label: 'Status' },
            ]}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode('jobs')}
            loading={loading}
            error={error}
          />
        );
      case 'compliance':
        const filteredCompliance = filterDataBySearch(complianceData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Compliance Records"
            data={filteredCompliance}
            columns={[
              { key: 'employee_name', label: 'Employee Name' },
              { key: 'compliance_type', label: 'Type' },
              { key: 'reporting_period', label: 'Period' },
              { key: 'status', label: 'Status' },
              { key: 'due_date', label: 'Due Date' },
            ]}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode('compliance')}
            loading={loading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  const loadTabData = useCallback(async (tabId: string) => {
    // Don't load if tenant context is still loading
    if (tenantloading) return;
    
    setloading(true);
    setError(null);

    // Get tenant IDs with proper fallback logic
    let tenantIds: string[] = [];
    
    if (isDemoMode) {
      tenantIds = ['99883779-9517-4ca9-a3f8-7fdc59051f0e']; // Demo tenant ID
    } else if (isMultiTenant && tenantFilter) {
      tenantIds = [tenantFilter];
    } else if (isMultiTenant && availableTenants.length > 0) {
      tenantIds = availableTenants.map(t => t.id);
    } else if (selectedTenant) {
      tenantIds = [selectedTenant.id];
    } else if (accessibleTenantIds.length > 0) {
      tenantIds = accessibleTenantIds;
    }

    if (!tenantIds || tenantIds.length === 0) {
      setloading(false);
      setError("No tenant selected or accessible.");
      return;
    }

    try {
      let query;
      switch (tabId) {
        case 'employees':
          query = supabase.from('employee_comprehensive_report').select('*').in('tenant_id', tenantIds);
          const { data: employees, error: empError } = await query;
          if (empError) throw empError;
          setEmployeeData(employees || []);
          break;
        case 'pay-statements':
          query = supabase.from('pay_statements_comprehensive_report').select('*').in('tenant_id', tenantIds);
          const { data: payStatements, error: psError } = await query;
          if (psError) throw psError;
          setPayStatementData(payStatements || []);
          break;
        case 'timecards':
          query = supabase.from('timecards_comprehensive_report').select('*').in('tenant_id', tenantIds);
          const { data: timecards, error: tcError } = await query;
          if (tcError) throw tcError;
          setTimecardData(timecards || []);
          break;
        case 'jobs':
          query = supabase.from('jobs_comprehensive_report').select('*').in('tenant_id', tenantIds);
          const { data: jobs, error: jobError } = await query;
          if (jobError) throw jobError;
          setJobData(jobs || []);
          break;
        case 'tax-records':
          try {
            query = supabase.from('tax_records_comprehensive_report').select('*').in('tenant_id', tenantIds);
            const { data: taxes, error: taxError } = await query;
            if (taxError) {
              console.error('Tax records query error:', taxError);
              throw taxError;
            }
            console.log('Tax records data:', taxes);
            setTaxData(taxes || []);
          } catch (taxErr) {
            console.error('Tax records loading error:', taxErr);
            setTaxData([]);
          }
          break;
        case 'benefits-deductions':
          query = supabase.from('benefits').select('*').in('tenant_id', tenantIds);
          const { data: benefits, error: benefitError } = await query;
          if (benefitError) throw benefitError;
          setBenefitData(benefits || []);
          break;
        case 'compliance':
          // Assuming a compliance table exists
          query = supabase.from('compliance_records').select('*').in('tenant_id', tenantIds);
          const { data: compliance, error: complianceError } = await query;
          if (complianceError) throw complianceError;
          setComplianceData(compliance || []);
          break;
        default:
          break;
      }

    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load employee data. Please try again.')
    } finally {
      setloading(false);
    }
  }, [tenantloading, isDemoMode, isMultiTenant, tenantFilter, selectedTenant, availableTenants.length, accessibleTenantIds.length]);

  // Load data on component mount using proven dependency pattern
  useEffect(() => {
    // Only load data when tenant context is ready and not loading
    if (!tenantloading && (isDemoMode || selectedTenant || accessibleTenantIds.length > 0)) {
      loadTabData(activeTab);
    }
  }, [activeTab, tenantloading, isDemoMode, selectedTenant?.id, accessibleTenantIds.length, loadTabData]);

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Active',
      value: stats.activeEmployees,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-700'
    },
    {
      title: 'Departments',
      value: stats.departments,
      icon: Building,
      color: 'bg-purple-50 text-purple-700'
    },
    {
      title: 'Selected',
      value: stats.selectedEmployee || 'None',
      icon: User,
      color: 'bg-orange-50 text-orange-700'
    }
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Loading employees...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Operations Reporting Cockpit</h1>
                <p className="text-gray-600">Unified employee reporting and document management</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statisticsCards.map((card, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <card.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Function Bar - Data Type Tabs */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dataTypeConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={activeDataType === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveDataType(key as DataType)}
                      className={`flex items-center space-x-2 ${activeDataType === key ? config.color : ''}`}
                    >
                      <config.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{config.label}</span>
                      <span className="sm:hidden">{config.shortLabel}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Generate Report</span>
                    <span className="sm:hidden">Report</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">View Facsimile</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Export Selected</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search & Filters */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Search & Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>
              </CardHeader>
              {showFilters && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search Employees</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Name, ID, email, or title..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="Active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Employee List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

        <Card className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => loadTabData(activeTab)} disabled={loading || tenantloading}>
                <RefreshCcw className={cn("w-4 h-4 mr-2", (loading || tenantloading) && "animate-spin")} />
                Refresh Data
              </Button>
              <Button variant="outline" onClick={() => console.log('Generate Report Clicked')} disabled={loading || tenantloading}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

            {/* Selected Employee Details */}
            {selectedEmployee && (
              <Card>
                <CardHeader>
                  <CardTitle>Employee Details</CardTitle>
                  <CardDescription>
                    Detailed information for {getEmployeeName(selectedEmployee)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{getEmployeeName(selectedEmployee)}</span>
                        </div>
                        {selectedEmployee.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{selectedEmployee.email}</span>
                          </div>
                        )}
                        {selectedEmployee.date_of_birth && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">Born: {new Date(selectedEmployee.date_of_birth).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Employment Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Employment</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{selectedEmployee.job_title || 'No title'}</span>
                        </div>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{selectedEmployee.department || 'No department'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Hired: {new Date(selectedEmployee.hire_date).toLocaleDateString()}</span>
                        </div>
                        {selectedEmployee.annual_salary && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">Salary: ${selectedEmployee.annual_salary.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Contact</h4>
                      <div className="space-y-2">
                        {selectedEmployee.home_address && (
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                            <span className="text-sm">{selectedEmployee.home_address}</span>
                          </div>
                        )}
                        {(selectedEmployee.city || selectedEmployee.state) && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">
                              {[selectedEmployee.city, selectedEmployee.state, selectedEmployee.zip_code].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Data Type Content */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-4">
                      {dataTypeConfig[activeDataType].label} for {getEmployeeName(selectedEmployee)}
                    </h4>
                    {renderDataTypeContent()}
                  </div>
                </CardContent>
              </Card>
            )}

            {tenantloading && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-pulse">loading tenant information...</div>
              </div>
            )}
            {!tenantloading && loading && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-pulse">loading data...</div>
              </div>
            )}
            {!tenantloading && error && (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <Button onClick={() => loadTabData(activeTab)} variant="outline">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
            {!tenantloading && !loading && !error && (
              <div className="mt-6">
                {renderDataTypeContent()}
              </div>
            )}
          </div>
        </Card>

        {showFacsimileModal && facsimileData && facsimileType && (
          <FacsimileDocument
            templateKey={facsimileType}
            data={facsimileData}
            employee={selectedEmployee || undefined}
          />
        )}

        {showNewFacsimileModal && newFacsimileRecord && (
          <FacsimileModal
            isOpen={showNewFacsimileModal}
            onClose={closeNewFacsimile}
            record={newFacsimileRecord}
            recordType={newFacsimileType}
            onPrint={() => window.print()}
            onDownload={() => {
              // Handle download logic here
              console.log('Download facsimile');
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
