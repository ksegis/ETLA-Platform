/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ComprehensiveDashboard from '@/components/dashboard/ComprehensiveDashboard';
import TraditionalReportTable from '@/components/reporting/TraditionalReportTable';
import FacsimileDocument from '@/components/facsimile/FacsimileDocument';
import { useTenant, useAccessibleTenantIds, useMultiTenantMode } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';
import { PayStatement as FacsimilePayStatement, Timecard as FacsimileTimecard, TaxRecord as FacsimileTaxRecord, Employee as FacsimileEmployee } from '@/types/facsimile';
import { List, Grid, Users, DollarSign, Clock, Briefcase, FileText, Heart, Shield, BarChart3, Info, Search, HelpCircle, X, RefreshCcw } from 'lucide-react';
import { cn } from "@/lib/utils";

// Enhanced interfaces for the new database schema
interface EnhancedEmployee {
  id: string;
  employee_id: string;
  employee_code: string;
  full_name: string;
  preferred_name: string;
  employee_name: string;
  position: string;
  job_code: string;
  home_department: string;
  division: string;
  cost_center: string;
  location_branch: string;
  work_location: string;
  employment_status: string;
  employment_type: string;
  flsa_status: string;
  hire_date: string;
  termination_date: string;
  manager_supervisor: string;
  hr_business_partner: string;
  pay_frequency: string;
  pay_period_salary: number;
  hourly_rate: number;
  pay_type: string;
  union_status: string;
  eeo_categories: string;
  customer_id: string;
  tenant_id: string;
}

interface EnhancedPayStatement {
  id: string;
  check_number: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  pay_date: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  net_pay: number;
  deposit_last4: string;
  regular_hours: number;
  overtime_hours: number;
  doubletime_hours: number;
  regular_pay: number;
  overtime_pay: number;
  bonus_amount: number;
  commission_amount: number;
  pretax_deductions_total: number;
  posttax_deductions_total: number;
  federal_tax_withheld: number;
  state_tax_withheld: number;
  local_tax_withheld: number;
  social_security_tax: number;
  medicare_tax: number;
  ytd_gross: number;
  ytd_net: number;
  ytd_federal_tax: number;
  ytd_state_tax: number;
  ytd_social_security: number;
  ytd_medicare: number;
  check_status: string;
  customer_id: string;
  tenant_id: string;
}

interface EnhancedTimecard {
  id: string;
  customer_id: string;
  tenant_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  work_date: string;
  clock_in: string;
  clock_out: string;
  break_duration: number;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  doubletime_hours: number;
  holiday_hours: number;
  sick_hours: number;
  vacation_hours: number;
  department: string;
  supervisor: string;
  job_code: string;
  cost_center: string;
  pay_rate: number;
  day_of_week: string;
  shift_code: string;
  schedule_code: string;
  approval_status: string;
  approver_id: string;
  approval_date: string;
  notes: string;
}

interface JobRecord {
  id: string;
  job_id: string;
  job_code: string;
  job_title: string;
  job_family: string;
  job_level: string;
  department: string;
  division: string;
  cost_center: string;
  location: string;
  flsa_classification: string;
  union_code: string;
  min_pay_range: number;
  max_pay_range: number;
  midpoint_pay: number;
  job_description: string;
  job_requirements: string;
  budget_allocation: number;
  status: string;
  effective_date: string;
  end_date: string;
  customer_id: string;
  tenant_id: string;
  employee_count: number;
}

interface TaxRecord {
  id: string;
  tax_record_id: string;
  employee_id: string;
  employee_name: string;
  ssn: string;
  tax_year: number;
  form_type: string;
  filing_status: string;
  dependents: number;
  tax_jurisdiction: string;
  state_code: string;
  wages_tips_compensation: number;
  federal_income_tax_withheld: number;
  social_security_wages: number;
  social_security_tax_withheld: number;
  medicare_wages: number;
  medicare_tax_withheld: number;
  state_wages: number;
  state_income_tax: number;
  local_tax: number;
  nonemployee_compensation: number;
  misc_income: number;
  document_status: string;
  issue_date: string;
  customer_id: string;
  tenant_id: string;
}

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
  const { selectedTenant, isDemoMode } = useTenant();
  const accessibleTenantIds = useAccessibleTenantIds();
  const { isMultiTenant, availableTenants } = useMultiTenantMode();
  const [activeTab, setActiveTab] = useState<string>('employees');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearchHelp, setShowSearchHelp] = useState<boolean>(false);

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
  
  // Facsimile modal states
  const [showFacsimileModal, setShowFacsimileModal] = useState<boolean>(false);
  const [facsimileData, setFacsimileData] = useState<FacsimilePayStatement | FacsimileTimecard | FacsimileTaxRecord | null>(null);
  const [facsimileType, setFacsimileType] = useState<'pay_statement' | 'timecard' | 'tax_w2' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<FacsimileEmployee | null>(null);
  
  // Enhanced view mode state - separate for each tab
  const [viewModes, setViewModes] = useState<Record<string, 'list' | 'grid'>>({
    employees: 'list',
    'pay-statements': 'list',
    timecards: 'list',
    jobs: 'list',
    'tax-records': 'list',
    'benefits-deductions': 'list',
    compliance: 'list'
  });

  // Enhanced filters
  const [filters, setFilters] = useState<EnhancedFilters>({
    startDate: '',
    endDate: '',
    department: '',
    location: '',
    employeeStatus: '',
    jobTitle: '',
    salaryMin: '',
    salaryMax: '',
    payType: '',
    flsaStatus: '',
    division: '',
    costCenter: '',
    unionStatus: '',
    eeoCategory: '',
    approvalStatus: '',
    taxYear: '',
    formType: '',
    deductionType: '',
    complianceType: '',
    searchTerm: ''
  });
  
  // Tenant filter for multi-tenant users
  const [tenantFilter, setTenantFilter] = useState<string>('');

  const getSearchableFields = (tabId: string): string[] => {
    switch (tabId) {
      case 'employees':
        return ['Employee Name', 'Employee Code', 'Position', 'Department', 'Division', 'Cost Center', 'Manager'];
      case 'pay-statements':
        return ['Employee Name', 'Employee Code', 'Check Number', 'Pay Date'];
      case 'timecards':
        return ['Employee Name', 'Employee Code', 'Department', 'Supervisor', 'Work Date'];
      case 'jobs':
        return ['Job Title', 'Job Code', 'Department', 'Division', 'Job Family', 'Job Level'];
      case 'tax-records':
        return ['Employee Name', 'Tax Record ID', 'Form Type', 'Tax Year'];
      case 'benefits-deductions':
        return ['Employee Name', 'Deduction Type', 'Deduction Code', 'Benefit ID'];
      case 'compliance':
        return ['Employee Name', 'Compliance Type', 'Compliance ID', 'Reporting Period'];
      default:
        return ['Employee Name', 'Employee Code'];
    }
  };

  const getSearchPlaceholder = (tabId: string): string => {
    const fields = getSearchableFields(tabId);
    const examples = fields.slice(0, 2).join(', ');
    return `Search ${examples}...`;
  };

  const setViewMode = (tabId: string, mode: 'list' | 'grid') => {
    setViewModes(prev => ({ ...prev, [tabId]: mode }));
  };

  const getViewMode = (tabId: string): 'list' | 'grid' => {
    return viewModes[tabId] || 'list';
  };

  const openFacsimile = async (data: any, type: 'pay_statement' | 'timecard' | 'tax_w2') => {
    setFacsimileData(data);
    setFacsimileType(type);
    
    if (data.employee_id) {
      try {
        const { data: employee, error } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id', data.employee_id)
          .single();
        
        if (!error && employee) {
          setSelectedEmployee(employee);
        }
      } catch (err) {
        console.log('Could not load employee data for facsimile');
      }
    }
    
    setShowFacsimileModal(true);
  };

  const closeFacsimile = () => {
    setShowFacsimileModal(false);
    setFacsimileData(null);
    setFacsimileType(null);
    setSelectedEmployee(null);
  };

  const renderDataTypeContent = () => {
    if (!selectedEmployee) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Select an employee to view their detailed reports.</p>
          <p>You can search for employees using the search bar above.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'pay-statements':
        return (
          <TraditionalReportTable
            title="Pay Statements"
            data={payStatementData.filter(ps => ps.employee_id === selectedEmployee.employee_id)}
            columns={[
              { key: 'pay_date', label: 'Pay Date' },
              { key: 'check_number', label: 'Check #' },
              { key: 'pay_period_start', label: 'Period Start' },
              { key: 'pay_period_end', label: 'Period End' },
              { key: 'gross_pay', label: 'Gross Pay', render: (item) => `$${item.gross_pay.toFixed(2)}` },
              { key: 'net_pay', label: 'Net Pay', render: (item) => `$${item.net_pay.toFixed(2)}` },
              { key: 'check_status', label: 'Status' },
            ]}
            onRowClick={(row) => openFacsimile(row as FacsimilePayStatement, 'pay_statement')}
            viewMode={getViewMode('pay-statements')}
            loading={loading}
            error={error}
          />
        );
      case 'timecards':
        return (
          <TraditionalReportTable
            title="Timecards"
            data={timecardData.filter(tc => tc.employee_id === selectedEmployee.employee_id)}
            columns={[
              { key: 'work_date', label: 'Date' },
              { key: 'clock_in', label: 'Clock In' },
              { key: 'clock_out', label: 'Clock Out' },
              { key: 'total_hours', label: 'Total Hours' },
              { key: 'approval_status', label: 'Status' },
            ]}
            onRowClick={(row) => openFacsimile(row as FacsimileTimecard, 'timecard')}
            viewMode={getViewMode('timecards')}
            loading={loading}
            error={error}
          />
        );
      case 'tax-records':
        return (
          <TraditionalReportTable
            title="Tax Records"
            data={taxData.filter(tr => tr.employee_id === selectedEmployee.employee_id)}
            columns={[
              { key: 'tax_year', label: 'Year' },
              { key: 'form_type', label: 'Form Type' },
              { key: 'wages_tips_compensation', label: 'Wages', render: (item) => `$${item.wages_tips_compensation.toFixed(2)}` },
              { key: 'federal_income_tax_withheld', label: 'Fed Tax', render: (item) => `$${item.federal_income_tax_withheld.toFixed(2)}` },
              { key: 'document_status', label: 'Status' },
            ]}
            onRowClick={(row) => openFacsimile(row as FacsimileTaxRecord, 'tax_w2')}
            viewMode={getViewMode('tax-records')}
            loading={loading}
            error={error}
          />
        );
      case 'benefits-deductions':
        return (
          <TraditionalReportTable
            title="Benefits & Deductions"
            data={benefitData.filter(bd => bd.employee_id === selectedEmployee.employee_id)}
            columns={[
              { key: 'deduction_type', label: 'Type' },
              { key: 'amount', label: 'Amount', render: (item) => `$${item.amount.toFixed(2)}` },
              { key: 'frequency', label: 'Frequency' },
              { key: 'effective_date', label: 'Effective Date' },
              { key: 'employer_contribution', label: 'Employer Contrib.', render: (item) => `$${item.employer_contribution.toFixed(2)}` },
            ]}
            viewMode={getViewMode('benefits-deductions')}
            loading={loading}
            error={error}
          />
        );
      case 'jobs':
        return (
          <TraditionalReportTable
            title="Job Records"
            data={jobData}
            columns={[
              { key: 'job_title', label: 'Job Title' },
              { key: 'job_code', label: 'Job Code' },
              { key: 'department', label: 'Department' },
              { key: 'division', label: 'Division' },
              { key: 'effective_date', label: 'Start Date' },
              { key: 'end_date', label: 'End Date' },
              { key: 'status', label: 'Status' },
            ]}
            viewMode={getViewMode('jobs')}
            loading={loading}
            error={error}
          />
        );
      case 'compliance':
        return (
          <TraditionalReportTable
            title="Compliance Records"
            data={complianceData.filter(cr => cr.employee_id === selectedEmployee.employee_id)}
            columns={[
              { key: 'compliance_type', label: 'Type' },
              { key: 'reporting_period', label: 'Period' },
              { key: 'status', label: 'Status' },
              { key: 'due_date', label: 'Due Date' },
            ]}
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
    setLoading(true);
    setError(null);

    let tenantIds = accessibleTenantIds;
    if (isMultiTenant && tenantFilter) {
      tenantIds = [tenantFilter];
    } else if (isMultiTenant && !tenantFilter) {
      tenantIds = availableTenants.map(t => t.id);
    }

    if (!tenantIds || tenantIds.length === 0) {
      setLoading(false);
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
          query = supabase.from('tax_records_comprehensive_report').select('*').in('tenant_id', tenantIds);
          const { data: taxes, error: taxError } = await query;
          if (taxError) throw taxError;
          setTaxData(taxes || []);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessibleTenantIds, isMultiTenant, tenantFilter, availableTenants]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // This would trigger a reload of data with filters applied
    loadTabData(activeTab);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      department: '',
      location: '',
      employeeStatus: '',
      jobTitle: '',
      salaryMin: '',
      salaryMax: '',
      payType: '',
      flsaStatus: '',
      division: '',
      costCenter: '',
      unionStatus: '',
      eeoCategory: '',
      approvalStatus: '',
      taxYear: '',
      formType: '',
      deductionType: '',
      complianceType: '',
      searchTerm: ''
    });
    loadTabData(activeTab);
  };

  const reportTabs = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'pay-statements', label: 'Pay Statements', icon: DollarSign },
    { id: 'timecards', label: 'Timecards', icon: Clock },
    { id: 'jobs', label: 'Job History', icon: Briefcase },
    { id: 'tax-records', label: 'Tax Records', icon: FileText },
    { id: 'benefits-deductions', label: 'Benefits', icon: Heart },
    { id: 'compliance', label: 'Compliance', icon: Shield },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reporting Cockpit</h1>
          <p className="text-gray-600 mt-2">Generate, view, and manage comprehensive reports across all data categories.</p>
        </div>
        
        <ComprehensiveDashboard />

        <Card className="mt-6 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {reportTabs.map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-shrink-0"
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => loadTabData(activeTab)} disabled={loading}>
                <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                Refresh Data
              </Button>
              <Button variant="outline" onClick={() => console.log('Generate Report Clicked')} disabled={loading}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Data for {reportTabs.find(t => t.id === activeTab)?.label}</h2>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={getSearchPlaceholder(activeTab)}
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-64"
                />
                <Button onClick={handleSearch}><Search className="w-4 h-4" /></Button>
                <Button variant="ghost" onClick={() => setShowSearchHelp(!showSearchHelp)}><HelpCircle className="w-4 h-4" /></Button>
              </div>
            </div>

            {showSearchHelp && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <h3 className="font-semibold mb-2">Searchable Fields for {reportTabs.find(t => t.id === activeTab)?.label}:</h3>
                <p>{getSearchableFields(activeTab).join(', ')}</p>
              </div>
            )}

            {loading && <div className="text-center py-8">Loading data...</div>}
            {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}
            {!loading && !error && (
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
      </div>
    </DashboardLayout>
  );
};

export default EnhancedReportingPage;

