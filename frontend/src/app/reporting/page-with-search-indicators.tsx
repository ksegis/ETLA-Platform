'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ComprehensiveDashboard from '@/components/dashboard/ComprehensiveDashboard';
import TraditionalReportTable from '@/components/reporting/TraditionalReportTable';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';
import { List, Grid, Users, DollarSign, Clock, Briefcase, FileText, Heart, Shield, BarChart3, Info, Search, HelpCircle } from 'lucide-react';

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
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  doubletime_hours: number;
  holiday_hours: number;
  department: string;
  supervisor: string;
  day_of_week: string;
  shift_code: string;
  schedule_code: string;
  approval_status: string;
  approver_id: string;
  approval_date: string;
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
  tax_year: number;
  form_type: string;
  filing_status: string;
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
  const { selectedTenant } = useTenant();
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

  // Helper function to get searchable fields for each tab
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

  // Helper function to get search placeholder text
  const getSearchPlaceholder = (tabId: string): string => {
    const fields = getSearchableFields(tabId);
    const examples = fields.slice(0, 2).join(', ');
    return `Search ${examples}...`;
  };

  // Helper function to set view mode for specific tab
  const setViewMode = (tabId: string, mode: 'list' | 'grid') => {
    setViewModes(prev => ({ ...prev, [tabId]: mode }));
  };

  // Helper function to get view mode for specific tab
  const getViewMode = (tabId: string): 'list' | 'grid' => {
    return viewModes[tabId] || 'list';
  };

  // Enhanced data loading functions (keeping existing implementation)
  const loadEmployeeData = async () => {
    if (!selectedTenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('employee_comprehensive_report')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('employee_name');
      
      if (error) throw error;
      setEmployeeData(data || []);
    } catch (err: any) {
      console.error('Error loading employee data:', err);
      setError(`Failed to load employee data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPayStatementData = async () => {
    if (!selectedTenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('pay_statements_comprehensive_report')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('pay_date', { ascending: false });
      
      if (error) throw error;
      setPayStatementData(data || []);
    } catch (err: any) {
      console.error('Error loading pay statement data:', err);
      setError(`Failed to load pay statement data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTimecardData = async () => {
    if (!selectedTenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('timecards_comprehensive_report')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('work_date', { ascending: false });
      
      if (error) throw error;
      setTimecardData(data || []);
    } catch (err: any) {
      console.error('Error loading timecard data:', err);
      setError(`Failed to load timecard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadJobData = async () => {
    if (!selectedTenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('jobs_comprehensive_report')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('job_title');
      
      if (error) throw error;
      setJobData(data || []);
    } catch (err: any) {
      console.error('Error loading job data:', err);
      setError(`Failed to load job data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTaxData = async () => {
    if (!selectedTenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tax_records_comprehensive_report')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('tax_year', { ascending: false });
      
      if (error) throw error;
      setTaxData(data || []);
    } catch (err: any) {
      console.error('Error loading tax data:', err);
      setError(`Failed to load tax data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadBenefitData = async () => {
    if (!selectedTenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('benefits_deductions_comprehensive_report')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('effective_date', { ascending: false });
      
      if (error) throw error;
      setBenefitData(data || []);
    } catch (err: any) {
      console.error('Error loading benefit data:', err);
      setError(`Failed to load benefit data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceData = async () => {
    if (!selectedTenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('compliance_records_comprehensive_report')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('reporting_period', { ascending: false });
      
      if (error) throw error;
      setComplianceData(data || []);
    } catch (err: any) {
      console.error('Error loading compliance data:', err);
      setError(`Failed to load compliance data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  const loadTabData = async (tabId: string) => {
    if (!selectedTenant?.id) return;

    setLoading(true);
    
    try {
      switch (tabId) {
        case 'employees':
          await loadEmployeeData();
          break;
        case 'pay-statements':
          await loadPayStatementData();
          break;
        case 'timecards':
          await loadTimecardData();
          break;
        case 'jobs':
          await loadJobData();
          break;
        case 'tax-records':
          await loadTaxData();
          break;
        case 'benefits-deductions':
          await loadBenefitData();
          break;
        case 'compliance':
          await loadComplianceData();
          break;
        case 'all-reports':
          // Load all data for comprehensive view
          await Promise.all([
            loadEmployeeData(),
            loadPayStatementData(),
            loadTimecardData(),
            loadJobData(),
            loadTaxData(),
            loadBenefitData(),
            loadComplianceData()
          ]);
          break;
        default:
          break;
      }
    } catch (err: any) {
      console.error('Error loading tab data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering function (keeping existing implementation)
  const applyFilters = (data: any[], dataType: string) => {
    return data.filter((item: any) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableFields = dataType === 'employees' 
          ? [item.employee_name, item.position, item.home_department, item.employee_code]
          : dataType === 'pay-statements'
          ? [item.employee_name, item.check_number, item.employee_code]
          : dataType === 'timecards'
          ? [item.employee_name, item.department, item.employee_code]
          : dataType === 'jobs'
          ? [item.job_title, item.department, item.job_code]
          : dataType === 'tax-records'
          ? [item.employee_id, item.form_type, item.tax_record_id]
          : dataType === 'benefits-deductions'
          ? [item.employee_name, item.deduction_type, item.deduction_code]
          : [item.employee_name, item.compliance_type, item.compliance_id];
        
        if (!searchableFields.some((field: any) => 
          field?.toString().toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }

      // Date range filters
      if (filters.startDate && item.pay_date) {
        if (new Date(item.pay_date) < new Date(filters.startDate)) return false;
      }
      if (filters.endDate && item.pay_date) {
        if (new Date(item.pay_date) > new Date(filters.endDate)) return false;
      }

      // Department filter
      if (filters.department && item.department !== filters.department && item.home_department !== filters.department) {
        return false;
      }

      // Employee status filter
      if (filters.employeeStatus && item.employment_status !== filters.employeeStatus) {
        return false;
      }

      // Deduction type filter
      if (filters.deductionType && item.deduction_type !== filters.deductionType) {
        return false;
      }

      // Compliance type filter
      if (filters.complianceType && item.compliance_type !== filters.complianceType) {
        return false;
      }

      // Tax year filter
      if (filters.taxYear && item.tax_year && item.tax_year.toString() !== filters.taxYear) {
        return false;
      }

      // Form type filter
      if (filters.formType && item.form_type !== filters.formType) {
        return false;
      }

      return true;
    });
  };

  // Enhanced export functions (keeping existing implementation)
  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row: any) => 
        headers.map((header: any) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pay statement detail view
  const generatePayStatementPDF = (statement: PayStatementDetail) => {
    // This would integrate with a PDF generation library
    console.log('Generating PDF for pay statement:', statement.check_number);
    alert('PDF generation would be implemented here');
  };

  // Load data when tab changes
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, selectedTenant]);

  // Enhanced filter panel with searchable column indicators
  const renderEnhancedFilters = () => (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Enhanced Filters & Search</h3>
      
      {/* Search Help Section */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Searchable Fields for {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearchHelp(!showSearchHelp)}
              className="p-1 h-auto"
            >
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </Button>
          </div>
        </div>
        
        {showSearchHelp && (
          <div className="mt-2 text-sm text-blue-700">
            <p className="mb-1">You can search the following fields:</p>
            <div className="flex flex-wrap gap-1">
              {getSearchableFields(activeTab).map((field, index: any) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-2 text-xs text-blue-600">
          💡 Tip: Search is case-insensitive and matches partial text across all searchable fields
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Enhanced Search Field with Indicator */}
        <div className="relative">
          <Input
            placeholder={getSearchPlaceholder(activeTab)}
            value={filters.searchTerm}
            onChange={(e: any) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="pr-8"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-50">
                <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  Click the help icon above for searchable fields
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Input
          type="date"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={(e: any) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
        />
        
        <Input
          type="date"
          placeholder="End Date"
          value={filters.endDate}
          onChange={(e: any) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
        />
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filters.department}
          onChange={(e: any) => setFilters(prev => ({ ...prev, department: e.target.value }))}
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
        </select>
        
        {/* Additional filters based on active tab */}
        {activeTab === 'tax-records' && (
          <>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={filters.taxYear}
              onChange={(e: any) => setFilters(prev => ({ ...prev, taxYear: e.target.value }))}
            >
              <option value="">All Tax Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={filters.formType}
              onChange={(e: any) => setFilters(prev => ({ ...prev, formType: e.target.value }))}
            >
              <option value="">All Form Types</option>
              <option value="W-2">W-2</option>
              <option value="1099-MISC">1099-MISC</option>
              <option value="1099-NEC">1099-NEC</option>
            </select>
          </>
        )}
        
        {activeTab === 'benefits-deductions' && (
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.deductionType}
            onChange={(e: any) => setFilters(prev => ({ ...prev, deductionType: e.target.value }))}
          >
            <option value="">All Deduction Types</option>
            <option value="Health Insurance">Health Insurance</option>
            <option value="Dental Insurance">Dental Insurance</option>
            <option value="401k">401k</option>
            <option value="HSA">HSA</option>
            <option value="Garnishment">Garnishment</option>
          </select>
        )}
        
        {activeTab === 'compliance' && (
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.complianceType}
            onChange={(e: any) => setFilters(prev => ({ ...prev, complianceType: e.target.value }))}
          >
            <option value="">All Compliance Types</option>
            <option value="EEO-1">EEO-1</option>
            <option value="ACA">ACA</option>
            <option value="FMLA">FMLA</option>
            <option value="Workers Comp">Workers Comp</option>
          </select>
        )}
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={() => setFilters({
            startDate: '', endDate: '', department: '', location: '', employeeStatus: '',
            jobTitle: '', salaryMin: '', salaryMax: '', payType: '', flsaStatus: '',
            division: '', costCenter: '', unionStatus: '', eeoCategory: '', approvalStatus: '',
            taxYear: '', formType: '', deductionType: '', complianceType: '', searchTerm: ''
          })}
          variant="outline"
        >
          Clear Filters
        </Button>
        <Button 
          onClick={() => setShowSearchHelp(!showSearchHelp)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          {showSearchHelp ? 'Hide' : 'Show'} Search Help
        </Button>
      </div>
    </Card>
  );

  // Enhanced view mode toggle component
  const renderViewModeToggle = (tabId: string) => (
    <div className="flex border rounded-md">
      <Button
        variant={getViewMode(tabId) === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode(tabId, 'list')}
        className="rounded-r-none"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={getViewMode(tabId) === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode(tabId, 'grid')}
        className="rounded-l-none"
      >
        <Grid className="w-4 h-4" />
      </Button>
    </div>
  );

  // Enhanced data display functions with consistent list/grid views (keeping existing implementation)
  const renderEmployeeData = () => {
    const filteredData = applyFilters(employeeData, 'employees');
    const currentViewMode = getViewMode('employees');
    
    const employeeColumns = [
      { key: 'employee_code', label: 'Employee Code', sortable: true },
      { key: 'full_name', label: 'Full Name', sortable: true, render: (employee: EnhancedEmployee) => employee.full_name || employee.employee_name },
      { key: 'position', label: 'Position', sortable: true },
      { key: 'home_department', label: 'Department', sortable: true },
      { key: 'division', label: 'Division', sortable: true },
      { key: 'cost_center', label: 'Cost Center', sortable: true },
      { key: 'flsa_status', label: 'FLSA Status', sortable: true, render: (employee: EnhancedEmployee) => (
        <Badge variant={employee.flsa_status === 'exempt' ? 'default' : 'secondary'}>
          {employee.flsa_status}
        </Badge>
      )},
      { key: 'pay_type', label: 'Pay Type', sortable: true },
      { key: 'union_status', label: 'Union Status', sortable: true },
      { key: 'employment_status', label: 'Status', sortable: true, render: (employee: EnhancedEmployee) => (
        <Badge variant={employee.employment_status === 'active' ? 'default' : 'secondary'}>
          {employee.employment_status}
        </Badge>
      )}
    ];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Enhanced Employee Directory ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            {renderViewModeToggle('employees')}
            <Button onClick={() => downloadCSV(filteredData, 'enhanced_employees')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'enhanced_employees')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {currentViewMode === 'list' ? (
          <TraditionalReportTable
            data={filteredData}
            columns={employeeColumns}
            searchTerm={filters.searchTerm}
            onSearch={(term: any) => setFilters(prev => ({ ...prev, searchTerm: term }))}
            title="Employee Directory"
            onExportCSV={() => downloadCSV(filteredData, 'enhanced_employees')}
            onExportJSON={() => downloadJSON(filteredData, 'enhanced_employees')}
          />
        ) : (
          <div className="grid gap-4">
            {filteredData.map((employee: any) => (
              <Card key={employee.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold">{employee.full_name || employee.employee_name}</h4>
                    <p className="text-sm text-gray-600">{employee.employee_code}</p>
                    <p className="text-sm">{employee.position}</p>
                  </div>
                  <div>
                    <p><strong>Department:</strong> {employee.home_department}</p>
                    <p><strong>Division:</strong> {employee.division}</p>
                    <p><strong>Cost Center:</strong> {employee.cost_center}</p>
                  </div>
                  <div>
                    <p><strong>FLSA Status:</strong> <Badge variant={employee.flsa_status === 'exempt' ? 'default' : 'secondary'}>{employee.flsa_status}</Badge></p>
                    <p><strong>Pay Type:</strong> {employee.pay_type}</p>
                    <p><strong>Union Status:</strong> {employee.union_status}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPayStatementData = () => {
    const filteredData = applyFilters(payStatementData, 'pay-statements');
    const currentViewMode = getViewMode('pay-statements');
    
    const payStatementColumns = [
      { key: 'check_number', label: 'Check #', sortable: true },
      { key: 'employee_name', label: 'Employee', sortable: true },
      { key: 'employee_code', label: 'Employee Code', sortable: true },
      { key: 'pay_date', label: 'Pay Date', sortable: true },
      { key: 'pay_period_start', label: 'Period Start', sortable: true },
      { key: 'pay_period_end', label: 'Period End', sortable: true },
      { key: 'regular_hours', label: 'Regular Hours', sortable: true },
      { key: 'overtime_hours', label: 'OT Hours', sortable: true },
      { key: 'gross_pay', label: 'Gross Pay', sortable: true, render: (statement: EnhancedPayStatement) => `$${statement.gross_pay?.toLocaleString()}` },
      { key: 'net_pay', label: 'Net Pay', sortable: true, render: (statement: EnhancedPayStatement) => `$${statement.net_pay?.toLocaleString()}` },
      { key: 'check_status', label: 'Status', sortable: true, render: (statement: EnhancedPayStatement) => (
        <Badge variant={statement.check_status === 'processed' ? 'default' : 'secondary'}>
          {statement.check_status}
        </Badge>
      )}
    ];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Enhanced Pay Statements ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            {renderViewModeToggle('pay-statements')}
            <Button onClick={() => downloadCSV(filteredData, 'enhanced_pay_statements')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'enhanced_pay_statements')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {currentViewMode === 'list' ? (
          <TraditionalReportTable
            data={filteredData}
            columns={payStatementColumns}
            searchTerm={filters.searchTerm}
            onSearch={(term: any) => setFilters(prev => ({ ...prev, searchTerm: term }))}
            title="Pay Statements"
            onExportCSV={() => downloadCSV(filteredData, 'enhanced_pay_statements')}
            onExportJSON={() => downloadJSON(filteredData, 'enhanced_pay_statements')}
          />
        ) : (
          <div className="grid gap-4">
            {filteredData.map((statement: any) => (
              <Card key={statement.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold">{statement.employee_name}</h4>
                    <p className="text-sm text-gray-600">Check #{statement.check_number}</p>
                    <p className="text-sm">{statement.pay_date}</p>
                  </div>
                  <div>
                    <p><strong>Gross Pay:</strong> ${statement.gross_pay?.toLocaleString()}</p>
                    <p><strong>Net Pay:</strong> ${statement.net_pay?.toLocaleString()}</p>
                    <p><strong>Regular Hours:</strong> {statement.regular_hours}</p>
                  </div>
                  <div>
                    <p><strong>Federal Tax:</strong> ${statement.federal_tax_withheld?.toLocaleString()}</p>
                    <p><strong>State Tax:</strong> ${statement.state_tax_withheld?.toLocaleString()}</p>
                    <p><strong>Social Security:</strong> ${statement.social_security_tax?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p><strong>YTD Gross:</strong> ${statement.ytd_gross?.toLocaleString()}</p>
                    <p><strong>YTD Net:</strong> ${statement.ytd_net?.toLocaleString()}</p>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedPayStatement(statement as any)}
                        variant="outline"
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => generatePayStatementPDF(statement as any)}
                        variant="outline"
                      >
                        Generate PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Continue with other render functions (keeping existing implementation)...
  const renderTimecardData = () => {
    const filteredData = applyFilters(timecardData, 'timecards');
    const currentViewMode = getViewMode('timecards');
    
    const timecardColumns = [
      { key: 'employee_name', label: 'Employee', sortable: true },
      { key: 'employee_code', label: 'Employee Code', sortable: true },
      { key: 'work_date', label: 'Work Date', sortable: true },
      { key: 'clock_in', label: 'Clock In', sortable: true },
      { key: 'clock_out', label: 'Clock Out', sortable: true },
      { key: 'total_hours', label: 'Total Hours', sortable: true },
      { key: 'regular_hours', label: 'Regular Hours', sortable: true },
      { key: 'overtime_hours', label: 'OT Hours', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'supervisor', label: 'Supervisor', sortable: true },
      { key: 'approval_status', label: 'Status', sortable: true, render: (timecard: EnhancedTimecard) => (
        <Badge variant={timecard.approval_status === 'approved' ? 'default' : 'secondary'}>
          {timecard.approval_status}
        </Badge>
      )}
    ];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Enhanced Timecards ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            {renderViewModeToggle('timecards')}
            <Button onClick={() => downloadCSV(filteredData, 'enhanced_timecards')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'enhanced_timecards')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {currentViewMode === 'list' ? (
          <TraditionalReportTable
            data={filteredData}
            columns={timecardColumns}
            searchTerm={filters.searchTerm}
            onSearch={(term: any) => setFilters(prev => ({ ...prev, searchTerm: term }))}
            title="Timecards"
            onExportCSV={() => downloadCSV(filteredData, 'enhanced_timecards')}
            onExportJSON={() => downloadJSON(filteredData, 'enhanced_timecards')}
          />
        ) : (
          <div className="grid gap-4">
            {filteredData.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No timecard records found. The timecards table is ready for data entry.</p>
              </Card>
            ) : (
              filteredData.map((timecard: any) => (
                <Card key={timecard.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold">{timecard.employee_name}</h4>
                      <p className="text-sm text-gray-600">{timecard.employee_code}</p>
                      <p className="text-sm">{timecard.work_date}</p>
                    </div>
                    <div>
                      <p><strong>Clock In:</strong> {timecard.clock_in}</p>
                      <p><strong>Clock Out:</strong> {timecard.clock_out}</p>
                      <p><strong>Total Hours:</strong> {timecard.total_hours}</p>
                    </div>
                    <div>
                      <p><strong>Regular Hours:</strong> {timecard.regular_hours}</p>
                      <p><strong>Overtime Hours:</strong> {timecard.overtime_hours}</p>
                      <p><strong>Holiday Hours:</strong> {timecard.holiday_hours}</p>
                    </div>
                    <div>
                      <p><strong>Department:</strong> {timecard.department}</p>
                      <p><strong>Supervisor:</strong> {timecard.supervisor}</p>
                      <p><strong>Status:</strong> <Badge variant={timecard.approval_status === 'approved' ? 'default' : 'secondary'}>{timecard.approval_status}</Badge></p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const renderJobData = () => {
    const filteredData = applyFilters(jobData, 'jobs');
    const currentViewMode = getViewMode('jobs');
    
    const jobColumns = [
      { key: 'job_code', label: 'Job Code', sortable: true },
      { key: 'job_title', label: 'Job Title', sortable: true },
      { key: 'job_family', label: 'Job Family', sortable: true },
      { key: 'job_level', label: 'Level', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'division', label: 'Division', sortable: true },
      { key: 'flsa_classification', label: 'FLSA', sortable: true },
      { key: 'min_pay_range', label: 'Min Pay', sortable: true, render: (job: JobRecord) => `$${job.min_pay_range?.toLocaleString()}` },
      { key: 'max_pay_range', label: 'Max Pay', sortable: true, render: (job: JobRecord) => `$${job.max_pay_range?.toLocaleString()}` },
      { key: 'employee_count', label: 'Employees', sortable: true },
      { key: 'status', label: 'Status', sortable: true, render: (job: JobRecord) => (
        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
          {job.status}
        </Badge>
      )}
    ];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Job Catalog ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            {renderViewModeToggle('jobs')}
            <Button onClick={() => downloadCSV(filteredData, 'job_catalog')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'job_catalog')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {currentViewMode === 'list' ? (
          <TraditionalReportTable
            data={filteredData}
            columns={jobColumns}
            searchTerm={filters.searchTerm}
            onSearch={(term: any) => setFilters(prev => ({ ...prev, searchTerm: term }))}
            title="Job Catalog"
            onExportCSV={() => downloadCSV(filteredData, 'job_catalog')}
            onExportJSON={() => downloadJSON(filteredData, 'job_catalog')}
          />
        ) : (
          <div className="grid gap-4">
            {filteredData.map((job: any) => (
              <Card key={job.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold">{job.job_title}</h4>
                    <p className="text-sm text-gray-600">{job.job_code}</p>
                    <p className="text-sm">{job.job_family} - {job.job_level}</p>
                  </div>
                  <div>
                    <p><strong>Department:</strong> {job.department}</p>
                    <p><strong>Division:</strong> {job.division}</p>
                    <p><strong>FLSA:</strong> {job.flsa_classification}</p>
                  </div>
                  <div>
                    <p><strong>Pay Range:</strong> ${job.min_pay_range?.toLocaleString()} - ${job.max_pay_range?.toLocaleString()}</p>
                    <p><strong>Midpoint:</strong> ${job.midpoint_pay?.toLocaleString()}</p>
                    <p><strong>Employees:</strong> {job.employee_count}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTaxData = () => {
    const filteredData = applyFilters(taxData, 'tax-records');
    const currentViewMode = getViewMode('tax-records');
    
    const taxColumns = [
      { key: 'tax_record_id', label: 'Tax Record ID', sortable: true },
      { key: 'employee_name', label: 'Employee', sortable: true },
      { key: 'tax_year', label: 'Tax Year', sortable: true },
      { key: 'form_type', label: 'Form Type', sortable: true },
      { key: 'filing_status', label: 'Filing Status', sortable: true },
      { key: 'wages_tips_compensation', label: 'Wages', sortable: true, render: (tax: TaxRecord) => `$${tax.wages_tips_compensation?.toLocaleString()}` },
      { key: 'federal_income_tax_withheld', label: 'Federal Tax', sortable: true, render: (tax: TaxRecord) => `$${tax.federal_income_tax_withheld?.toLocaleString()}` },
      { key: 'state_income_tax', label: 'State Tax', sortable: true, render: (tax: TaxRecord) => `$${tax.state_income_tax?.toLocaleString()}` },
      { key: 'document_status', label: 'Status', sortable: true, render: (tax: TaxRecord) => (
        <Badge variant={tax.document_status === 'issued' ? 'default' : 'secondary'}>
          {tax.document_status}
        </Badge>
      )}
    ];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tax Records - W-2/1099 Documents ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            {renderViewModeToggle('tax-records')}
            <Button onClick={() => downloadCSV(filteredData, 'tax_records')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'tax_records')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {currentViewMode === 'list' ? (
          <TraditionalReportTable
            data={filteredData}
            columns={taxColumns}
            searchTerm={filters.searchTerm}
            onSearch={(term: any) => setFilters(prev => ({ ...prev, searchTerm: term }))}
            title="Tax Records"
            onExportCSV={() => downloadCSV(filteredData, 'tax_records')}
            onExportJSON={() => downloadJSON(filteredData, 'tax_records')}
          />
        ) : (
          <div className="grid gap-4">
            {filteredData.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No tax records found. The tax records table is ready for W-2 and 1099 document tracking.</p>
              </Card>
            ) : (
              filteredData.map((record: any) => (
                <Card key={record.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold">{record.form_type} - {record.tax_year}</h4>
                      <p className="text-sm text-gray-600">{record.tax_record_id}</p>
                      <p className="text-sm">{record.employee_name}</p>
                    </div>
                    <div>
                      <p><strong>Wages:</strong> ${record.wages_tips_compensation?.toLocaleString()}</p>
                      <p><strong>Federal Tax:</strong> ${record.federal_income_tax_withheld?.toLocaleString()}</p>
                      <p><strong>State Tax:</strong> ${record.state_income_tax?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p><strong>Social Security:</strong> ${record.social_security_tax_withheld?.toLocaleString()}</p>
                      <p><strong>Medicare:</strong> ${record.medicare_tax_withheld?.toLocaleString()}</p>
                      <p><strong>Filing Status:</strong> {record.filing_status}</p>
                    </div>
                    <div>
                      <p><strong>Status:</strong> <Badge>{record.document_status}</Badge></p>
                      <p><strong>Issue Date:</strong> {record.issue_date}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">View Document</Button>
                        <Button size="sm" variant="outline">Export</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBenefitData = () => {
    const filteredData = applyFilters(benefitData, 'benefits-deductions');
    const currentViewMode = getViewMode('benefits-deductions');
    
    const benefitColumns = [
      { key: 'benefit_deduction_id', label: 'Benefit ID', sortable: true },
      { key: 'employee_name', label: 'Employee', sortable: true },
      { key: 'deduction_type', label: 'Type', sortable: true },
      { key: 'deduction_code', label: 'Code', sortable: true },
      { key: 'amount', label: 'Amount', sortable: true, render: (benefit: BenefitDeduction) => `$${benefit.amount?.toLocaleString()}` },
      { key: 'frequency', label: 'Frequency', sortable: true },
      { key: 'effective_date', label: 'Effective Date', sortable: true },
      { key: 'employer_contribution', label: 'Employer Contribution', sortable: true, render: (benefit: BenefitDeduction) => `$${benefit.employer_contribution?.toLocaleString()}` },
      { key: 'employee_contribution', label: 'Employee Contribution', sortable: true, render: (benefit: BenefitDeduction) => `$${benefit.employee_contribution?.toLocaleString()}` }
    ];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Benefits & Deductions ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            {renderViewModeToggle('benefits-deductions')}
            <Button onClick={() => downloadCSV(filteredData, 'benefits_deductions')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'benefits_deductions')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {currentViewMode === 'list' ? (
          <TraditionalReportTable
            data={filteredData}
            columns={benefitColumns}
            searchTerm={filters.searchTerm}
            onSearch={(term: any) => setFilters(prev => ({ ...prev, searchTerm: term }))}
            title="Benefits & Deductions"
            onExportCSV={() => downloadCSV(filteredData, 'benefits_deductions')}
            onExportJSON={() => downloadJSON(filteredData, 'benefits_deductions')}
          />
        ) : (
          <div className="grid gap-4">
            {filteredData.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No benefit/deduction records found. The benefits table is ready for health insurance, 401k, and garnishment tracking.</p>
              </Card>
            ) : (
              filteredData.map((record: any) => (
                <Card key={record.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold">{record.deduction_type}</h4>
                      <p className="text-sm text-gray-600">{record.deduction_code}</p>
                      <p className="text-sm">{record.employee_name}</p>
                    </div>
                    <div>
                      <p><strong>Amount:</strong> ${record.amount?.toLocaleString()}</p>
                      <p><strong>Frequency:</strong> {record.frequency}</p>
                      <p><strong>Effective Date:</strong> {record.effective_date}</p>
                    </div>
                    <div>
                      <p><strong>Employer Contribution:</strong> ${record.employer_contribution?.toLocaleString()}</p>
                      <p><strong>Employee Contribution:</strong> ${record.employee_contribution?.toLocaleString()}</p>
                      <p><strong>End Date:</strong> {record.end_date || 'Ongoing'}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">Export</Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const renderComplianceData = () => {
    const filteredData = applyFilters(complianceData, 'compliance');
    const currentViewMode = getViewMode('compliance');
    
    const complianceColumns = [
      { key: 'compliance_id', label: 'Compliance ID', sortable: true },
      { key: 'employee_name', label: 'Employee', sortable: true },
      { key: 'compliance_type', label: 'Type', sortable: true },
      { key: 'reporting_period', label: 'Reporting Period', sortable: true },
      { key: 'status', label: 'Status', sortable: true, render: (compliance: ComplianceRecord) => (
        <Badge variant={compliance.status === 'completed' ? 'default' : 'secondary'}>
          {compliance.status}
        </Badge>
      )},
      { key: 'filing_date', label: 'Filing Date', sortable: true },
      { key: 'due_date', label: 'Due Date', sortable: true }
    ];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Compliance Reports ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            {renderViewModeToggle('compliance')}
            <Button onClick={() => downloadCSV(filteredData, 'compliance_reports')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'compliance_reports')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {currentViewMode === 'list' ? (
          <TraditionalReportTable
            data={filteredData}
            columns={complianceColumns}
            searchTerm={filters.searchTerm}
            onSearch={(term: any) => setFilters(prev => ({ ...prev, searchTerm: term }))}
            title="Compliance Reports"
            onExportCSV={() => downloadCSV(filteredData, 'compliance_reports')}
            onExportJSON={() => downloadJSON(filteredData, 'compliance_reports')}
          />
        ) : (
          <div className="grid gap-4">
            {filteredData.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No compliance records found. The compliance table is ready for EEO-1, ACA, FMLA, and audit trail tracking.</p>
              </Card>
            ) : (
              filteredData.map((record: any) => (
                <Card key={record.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold">{record.compliance_type}</h4>
                      <p className="text-sm text-gray-600">{record.compliance_id}</p>
                      <p className="text-sm">{record.employee_name}</p>
                    </div>
                    <div>
                      <p><strong>Reporting Period:</strong> {record.reporting_period}</p>
                      <p><strong>Status:</strong> <Badge>{record.status}</Badge></p>
                      <p><strong>Filing Date:</strong> {record.filing_date}</p>
                    </div>
                    <div>
                      <p><strong>Due Date:</strong> {record.due_date}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">View Report</Button>
                        <Button size="sm" variant="outline">Generate PDF</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAllReports = () => (
    <div className="space-y-8">
      <ComprehensiveDashboard onCategoryClick={(category: any) => setActiveTab(category)} />
    </div>
  );

  const tabs = [
    { id: 'employees', label: 'Enhanced Employees', icon: '👥' },
    { id: 'pay-statements', label: 'Pay Statements', icon: '💰' },
    { id: 'timecards', label: 'Timecards', icon: '⏰' },
    { id: 'jobs', label: 'Job Catalog', icon: '💼' },
    { id: 'tax-records', label: 'Tax Records', icon: '📋' },
    { id: 'benefits-deductions', label: 'Benefits & Deductions', icon: '🏥' },
    { id: 'compliance', label: 'Compliance Reports', icon: '📊' },
    { id: 'all-reports', label: 'All Reports', icon: '📈' }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="p-6 pb-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Enhanced Reporting System</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive payroll and HR analytics with enhanced data extraction capabilities and flexible view options
              </p>
            </div>

            {/* Enhanced Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 border-b">
              {tabs.map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="px-6 pb-6">
            {renderEnhancedFilters()}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Loading and Error States */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="text-lg">Loading enhanced data...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Enhanced Content with List/Grid Views */}
            {!loading && !error && (
              <div>
                {activeTab === 'employees' && renderEmployeeData()}
                {activeTab === 'pay-statements' && renderPayStatementData()}
                {activeTab === 'timecards' && renderTimecardData()}
                {activeTab === 'jobs' && renderJobData()}
                {activeTab === 'tax-records' && renderTaxData()}
                {activeTab === 'benefits-deductions' && renderBenefitData()}
                {activeTab === 'compliance' && renderComplianceData()}
                {activeTab === 'all-reports' && renderAllReports()}
              </div>
            )}
          </div>
        </div>

        {/* Pay Statement Detail Modal */}
        {selectedPayStatement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Pay Statement Detail</h2>
                <Button onClick={() => setSelectedPayStatement(null)} variant="outline">
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Employee Information</h3>
                  <p><strong>Name:</strong> {selectedPayStatement.employee_name}</p>
                  <p><strong>Employee Code:</strong> {selectedPayStatement.employee_code}</p>
                  <p><strong>Check Number:</strong> {selectedPayStatement.check_number}</p>
                  <p><strong>Pay Period:</strong> {selectedPayStatement.pay_period_start} - {selectedPayStatement.pay_period_end}</p>
                  <p><strong>Pay Date:</strong> {selectedPayStatement.pay_date}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Hours & Earnings</h3>
                  <p><strong>Regular Hours:</strong> {selectedPayStatement.regular_hours}</p>
                  <p><strong>Overtime Hours:</strong> {selectedPayStatement.overtime_hours}</p>
                  <p><strong>Regular Pay:</strong> ${selectedPayStatement.regular_pay?.toLocaleString()}</p>
                  <p><strong>Overtime Pay:</strong> ${selectedPayStatement.overtime_pay?.toLocaleString()}</p>
                  <p><strong>Bonus:</strong> ${selectedPayStatement.bonus_amount?.toLocaleString()}</p>
                  <p><strong>Gross Pay:</strong> ${selectedPayStatement.gross_pay?.toLocaleString()}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Taxes</h3>
                  <p><strong>Federal Tax:</strong> ${selectedPayStatement.federal_tax_withheld?.toLocaleString()}</p>
                  <p><strong>State Tax:</strong> ${selectedPayStatement.state_tax_withheld?.toLocaleString()}</p>
                  <p><strong>Social Security:</strong> ${selectedPayStatement.social_security_tax?.toLocaleString()}</p>
                  <p><strong>Medicare:</strong> ${selectedPayStatement.medicare_tax?.toLocaleString()}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Year-to-Date Totals</h3>
                  <p><strong>YTD Gross:</strong> ${selectedPayStatement.ytd_gross?.toLocaleString()}</p>
                  <p><strong>YTD Net:</strong> ${selectedPayStatement.ytd_net?.toLocaleString()}</p>
                  <p><strong>YTD Federal Tax:</strong> ${selectedPayStatement.ytd_federal_tax?.toLocaleString()}</p>
                  <p><strong>YTD Social Security:</strong> ${selectedPayStatement.ytd_social_security?.toLocaleString()}</p>
                  <p><strong>Net Pay:</strong> ${selectedPayStatement.net_pay?.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={() => generatePayStatementPDF(selectedPayStatement)}>
                  Generate PDF
                </Button>
                <Button variant="outline" onClick={() => setSelectedPayStatement(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EnhancedReportingPage;

