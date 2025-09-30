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
import FacsimileModal from '@/components/reporting/FacsimileModal';
import FacsimileDocument from '@/components/facsimile/FacsimileDocument';
import { useTenant, useAccessibleTenantIds, useMultiTenantMode } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';
import { PayStatement as FacsimilePayStatement, Timecard as FacsimileTimecard, TaxRecord as FacsimileTaxRecord, Employee as FacsimileEmployee } from '@/types/facsimile';
import { List, Grid, Users, DollarSign, Clock, Briefcase, FileText, Heart, Shield, BarChart3, Info, Search, HelpCircle, X, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
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
  tenant_id: string;
  employee_ref: string;
  employee_name: string;
  work_date: string;
  first_clock_in: string | null;
  mid_clock_out: string | null;
  mid_clock_in: string | null;
  last_clock_out: string | null;
  total_hours: number;
  regular_hours: number;
  ot_hours: number;
  dt_hours: number;
  is_corrected: boolean;
  corrected_by: string | null;
  corrected_at: string | null;
  correction_reason: string | null;
  employee_id?: string;
  employee_code?: string;
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
  const { selectedTenant, isDemoMode, isLoading: tenantLoading } = useTenant();
  const accessibleTenantIds = useAccessibleTenantIds();
  const { isMultiTenant, availableTenants } = useMultiTenantMode();
  const [activeTab, setActiveTab] = useState<string>('employees');
  const [loading, setLoading] = useState<boolean>(false);
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
  
  // Facsimile modal states
  const [showFacsimileModal, setShowFacsimileModal] = useState<boolean>(false);
  const [facsimileData, setFacsimileData] = useState<FacsimilePayStatement | FacsimileTimecard | FacsimileTaxRecord | null>(null);
  const [facsimileType, setFacsimileType] = useState<'pay_statement' | 'timecard' | 'tax_w2' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<FacsimileEmployee | null>(null);
  
  // New FacsimileModal states
  const [showNewFacsimileModal, setShowNewFacsimileModal] = useState<boolean>(false);
  const [newFacsimileRecord, setNewFacsimileRecord] = useState<any>(null);
  const [newFacsimileType, setNewFacsimileType] = useState<string>('');
  
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
              { key: 'first_clock_in', label: 'Clock In' },
              { key: 'last_clock_out', label: 'Clock Out' },
              { key: 'total_hours', label: 'Total Hours' },
              { key: 'regular_hours', label: 'Regular' },
              { key: 'ot_hours', label: 'Overtime' },
              { key: 'dt_hours', label: 'Double Time' },
              { key: 'is_corrected', label: 'Status', render: (item) => item.is_corrected ? 'Corrected' : 'Calculated' },
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
    if (tenantLoading) return;
    
    setLoading(true);
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
          query = supabase.from('v_timecard_daily_effective_v2').select('*').in('tenant_id', tenantIds);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenantLoading, isDemoMode, isMultiTenant, tenantFilter, selectedTenant, availableTenants.length, accessibleTenantIds.length]);

  useEffect(() => {
    // Only load data when tenant context is ready and not loading
    if (!tenantLoading && (isDemoMode || selectedTenant || accessibleTenantIds.length > 0)) {
      loadTabData(activeTab);
    }
  }, [activeTab, tenantLoading, isDemoMode, selectedTenant?.id, accessibleTenantIds.length, loadTabData]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // Trigger a reload of data with filters applied
    loadTabData(activeTab);
  };

  // Filter data based on search term
  const filterDataBySearch = (data: any[], searchTerm: string): any[] => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase();
    const searchableFields = getSearchableFields(activeTab);
    
    return data.filter(item => {
      // Search in employee name (most common field)
      if (item.employee_name && item.employee_name.toLowerCase().includes(term)) return true;
      if (item.name && item.name.toLowerCase().includes(term)) return true;
      
      // Search in employee code
      if (item.employee_code && item.employee_code.toLowerCase().includes(term)) return true;
      if (item.code && item.code.toLowerCase().includes(term)) return true;
      
      // Search in position/title
      if (item.position && item.position.toLowerCase().includes(term)) return true;
      if (item.title && item.title.toLowerCase().includes(term)) return true;
      
      // Search in department
      if (item.department && item.department.toLowerCase().includes(term)) return true;
      
      // Search in division
      if (item.division && item.division.toLowerCase().includes(term)) return true;
      
      // Search in manager
      if (item.manager && item.manager.toLowerCase().includes(term)) return true;
      
      // Search in check number (for pay statements)
      if (item.check_number && item.check_number.toLowerCase().includes(term)) return true;
      
      // Search in any string field that might contain the term
      return Object.values(item).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(term)
      );
    });
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
        
        {/* Sticky Quick Actions Cards */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <Button 
                variant={activeTab === 'employees' ? 'default' : 'outline'}
                onClick={() => setActiveTab('employees')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">👥</span>
                <span className="text-sm">View Employees</span>
              </Button>
              <Button 
                variant={activeTab === 'pay-statements' ? 'default' : 'outline'}
                onClick={() => setActiveTab('pay-statements')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">💰</span>
                <span className="text-sm">Pay Statements</span>
              </Button>
              <Button 
                variant={activeTab === 'timecards' ? 'default' : 'outline'}
                onClick={() => setActiveTab('timecards')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">⏰</span>
                <span className="text-sm">Timecards</span>
              </Button>
              <Button 
                variant={activeTab === 'jobs' ? 'default' : 'outline'}
                onClick={() => setActiveTab('jobs')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">💼</span>
                <span className="text-sm">Job Catalog</span>
              </Button>
              <Button 
                variant={activeTab === 'tax-records' ? 'default' : 'outline'}
                onClick={() => setActiveTab('tax-records')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">📋</span>
                <span className="text-sm">Tax Records</span>
              </Button>
              <Button 
                variant={activeTab === 'benefits-deductions' ? 'default' : 'outline'}
                onClick={() => setActiveTab('benefits-deductions')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">🏥</span>
                <span className="text-sm">Benefits</span>
              </Button>
              <Button 
                variant={activeTab === 'compliance' ? 'default' : 'outline'}
                onClick={() => setActiveTab('compliance')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">📊</span>
                <span className="text-sm">Compliance</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Collapsible Analytics Dashboard */}
        <Card className="mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Comprehensive Analytics Dashboard</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDashboardCollapsed(!isDashboardCollapsed)}
                className="flex items-center gap-2"
              >
                {isDashboardCollapsed ? (
                  <>
                    <span className="text-sm">Show Dashboard</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span className="text-sm">Hide Dashboard</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
          {!isDashboardCollapsed && (
            <div className="p-6">
              <ComprehensiveDashboard />
            </div>
          )}
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => loadTabData(activeTab)} disabled={loading || tenantLoading}>
                <RefreshCcw className={cn("w-4 h-4 mr-2", (loading || tenantLoading) && "animate-spin")} />
                Refresh Data
              </Button>
              <Button variant="outline" onClick={() => console.log('Generate Report Clicked')} disabled={loading || tenantLoading}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Data for {reportTabs.find(t => t.id === activeTab)?.label}</h2>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={getSearchPlaceholder(activeTab)}
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-64"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" onClick={() => setShowSearchHelp(!showSearchHelp)}><HelpCircle className="w-4 h-4" /></Button>
              </div>
            </div>

            {showSearchHelp && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <h3 className="font-semibold mb-2">Searchable Fields for {reportTabs.find(t => t.id === activeTab)?.label}:</h3>
                <p>{getSearchableFields(activeTab).join(', ')}</p>
              </div>
            )}

            {tenantLoading && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-pulse">Loading tenant information...</div>
              </div>
            )}
            {!tenantLoading && loading && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-pulse">Loading data...</div>
              </div>
            )}
            {!tenantLoading && error && (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <Button onClick={() => loadTabData(activeTab)} variant="outline">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
            {!tenantLoading && !loading && !error && (
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
  );
};

export default EnhancedReportingPage;

