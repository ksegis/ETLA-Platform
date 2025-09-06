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

  // Enhanced data states
  const [employeeData, setEmployeeData] = useState<EnhancedEmployee[]>([]);
  const [payStatementData, setPayStatementData] = useState<EnhancedPayStatement[]>([]);
  const [timecardData, setTimecardData] = useState<EnhancedTimecard[]>([]);
  const [jobData, setJobData] = useState<JobRecord[]>([]);
  const [taxData, setTaxData] = useState<TaxRecord[]>([]);
  const [benefitData, setBenefitData] = useState<BenefitDeduction[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceRecord[]>([]);
  const [selectedPayStatement, setSelectedPayStatement] = useState<PayStatementDetail | null>(null);

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

  // Enhanced data loading functions
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

  // Enhanced filtering function
  const applyFilters = (data: any[], dataType: string) => {
    return data.filter(item => {
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
        
        if (!searchableFields.some(field => 
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

  // Enhanced export functions
  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
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

  // Enhanced filter panel
  const renderEnhancedFilters = () => (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Enhanced Filters & Search</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Input
          placeholder="Search..."
          value={filters.searchTerm}
          onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
        />
        
        <Input
          type="date"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
        />
        
        <Input
          type="date"
          placeholder="End Date"
          value={filters.endDate}
          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
        />
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filters.department}
          onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
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
              onChange={(e) => setFilters(prev => ({ ...prev, taxYear: e.target.value }))}
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
              onChange={(e) => setFilters(prev => ({ ...prev, formType: e.target.value }))}
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
            onChange={(e) => setFilters(prev => ({ ...prev, deductionType: e.target.value }))}
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
            onChange={(e) => setFilters(prev => ({ ...prev, complianceType: e.target.value }))}
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
      </div>
    </Card>
  );

  // Enhanced data display functions
  const renderEmployeeData = () => {
    const filteredData = applyFilters(employeeData, 'employees');
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Enhanced Employee Directory ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            <Button onClick={() => downloadCSV(filteredData, 'enhanced_employees')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'enhanced_employees')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredData.map((employee) => (
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
      </div>
    );
  };

  const renderPayStatementData = () => {
    const filteredData = applyFilters(payStatementData, 'pay-statements');
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Enhanced Pay Statements ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            <Button onClick={() => downloadCSV(filteredData, 'enhanced_pay_statements')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'enhanced_pay_statements')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredData.map((statement) => (
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
      </div>
    );
  };

  const renderTaxData = () => {
    const filteredData = applyFilters(taxData, 'tax-records');
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tax Records - W-2/1099 Documents ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            <Button onClick={() => downloadCSV(filteredData, 'tax_records')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'tax_records')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {filteredData.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No tax records found. The tax records table is ready for W-2 and 1099 document storage.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredData.map((record) => (
              <Card key={record.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold">{record.form_type} - {record.tax_year}</h4>
                    <p className="text-sm text-gray-600">{record.tax_record_id}</p>
                    <p className="text-sm">{record.employee_name || record.employee_id}</p>
                  </div>
                  <div>
                    <p><strong>Wages:</strong> ${record.wages_tips_compensation?.toLocaleString()}</p>
                    <p><strong>Federal Tax:</strong> ${record.federal_income_tax_withheld?.toLocaleString()}</p>
                    <p><strong>State Tax:</strong> ${record.state_income_tax?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p><strong>Social Security:</strong> ${record.social_security_tax_withheld?.toLocaleString()}</p>
                    <p><strong>Medicare:</strong> ${record.medicare_tax_withheld?.toLocaleString()}</p>
                    <p><strong>State:</strong> {record.state_code}</p>
                  </div>
                  <div>
                    <p><strong>Status:</strong> <Badge>{record.document_status}</Badge></p>
                    <p><strong>Issue Date:</strong> {record.issue_date}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">View Form</Button>
                      <Button size="sm" variant="outline">Generate PDF</Button>
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

  const renderBenefitData = () => {
    const filteredData = applyFilters(benefitData, 'benefits-deductions');
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Benefits & Deductions ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            <Button onClick={() => downloadCSV(filteredData, 'benefits_deductions')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'benefits_deductions')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {filteredData.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No benefit/deduction records found. The benefits table is ready for insurance, 401k, and garnishment tracking.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredData.map((benefit) => (
              <Card key={benefit.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold">{benefit.employee_name}</h4>
                    <p className="text-sm text-gray-600">{benefit.deduction_type}</p>
                    <p className="text-sm">{benefit.deduction_code}</p>
                  </div>
                  <div>
                    <p><strong>Amount:</strong> ${benefit.amount?.toLocaleString()}</p>
                    <p><strong>Frequency:</strong> {benefit.frequency}</p>
                    <p><strong>Effective Date:</strong> {benefit.effective_date}</p>
                  </div>
                  <div>
                    <p><strong>Employee Contribution:</strong> ${benefit.employee_contribution?.toLocaleString()}</p>
                    <p><strong>Employer Contribution:</strong> ${benefit.employer_contribution?.toLocaleString()}</p>
                    <p><strong>End Date:</strong> {benefit.end_date || 'Active'}</p>
                  </div>
                  <div>
                    {benefit.court_order_number && (
                      <p><strong>Court Order:</strong> {benefit.court_order_number}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">Export</Button>
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

  const renderComplianceData = () => {
    const filteredData = applyFilters(complianceData, 'compliance');
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Compliance Reports ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            <Button onClick={() => downloadCSV(filteredData, 'compliance_reports')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'compliance_reports')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {filteredData.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No compliance records found. The compliance table is ready for EEO-1, ACA, FMLA, and audit trail tracking.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredData.map((record) => (
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
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTimecardData = () => {
    const filteredData = applyFilters(timecardData, 'timecards');
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Enhanced Timecards ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            <Button onClick={() => downloadCSV(filteredData, 'enhanced_timecards')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'enhanced_timecards')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        {filteredData.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No timecard records found. The timecards table is ready for data entry.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredData.map((timecard) => (
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
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderJobData = () => {
    const filteredData = applyFilters(jobData, 'jobs');
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Job Catalog ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            <Button onClick={() => downloadCSV(filteredData, 'job_catalog')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'job_catalog')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredData.map((job) => (
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
      </div>
    );
  };

  const renderAllReports = () => (
    <div className="space-y-8">
      <ComprehensiveDashboard onCategoryClick={(category) => setActiveTab(category)} />
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
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Enhanced Reporting System</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive payroll and HR analytics with enhanced data extraction capabilities
          </p>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b">
          {tabs.map((tab) => (
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

        {/* Enhanced Filters */}
        {renderEnhancedFilters()}

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

        {/* Enhanced Content */}
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

