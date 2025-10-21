'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
  searchTerm: string;
}

const EnhancedReportingPage: React.FC = () => {
  const { selectedTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<string>('employees');
  const [loading, setloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced data states
  const [employeeData, setEmployeeData] = useState<EnhancedEmployee[]>([]);
  const [payStatementData, setPayStatementData] = useState<EnhancedPayStatement[]>([]);
  const [timecardData, setTimecardData] = useState<EnhancedTimecard[]>([]);
  const [jobData, setJobData] = useState<JobRecord[]>([]);
  const [taxData, setTaxData] = useState<TaxRecord[]>([]);

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
    searchTerm: ''
  });

  // Enhanced data loading functions
  const loadEmployeeData = async () => {
    if (!selectedTenant?.id) return;
    
    setloading(true);
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
      setloading(false);
    }
  };

  const loadPayStatementData = async () => {
    if (!selectedTenant?.id) return;
    
    setloading(true);
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
      setloading(false);
    }
  };

  const loadTimecardData = async () => {
    if (!selectedTenant?.id) return;
    
    setloading(true);
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
      setloading(false);
    }
  };

  const loadJobData = async () => {
    if (!selectedTenant?.id) return;
    
    setloading(true);
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
      setloading(false);
    }
  };

  const loadTaxData = async () => {
    if (!selectedTenant?.id) return;
    
    setloading(true);
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
      setloading(false);
    }
  };

  // Load data based on active tab
  const loadTabData = async (tabId: string) => {
    if (!selectedTenant?.id) return;

    setloading(true);
    
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
        case 'all-reports':
          // Load all data for comprehensive view
          await Promise.all([
            loadEmployeeData(),
            loadPayStatementData(),
            loadTimecardData(),
            loadJobData(),
            loadTaxData()
          ]);
          break;
        default:
          break;
      }
    } catch (err: any) {
      console.error('Error loading tab data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setloading(false);
    }
  };

  // Enhanced filtering function
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
          : [item.employee_id, item.form_type, item.tax_record_id];
        
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

      // Location filter
      if (filters.location && item.location !== filters.location && item.work_location !== filters.location) {
        return false;
      }

      // Employee status filter
      if (filters.employeeStatus && item.employment_status !== filters.employeeStatus) {
        return false;
      }

      // Job title filter
      if (filters.jobTitle && !item.position?.toLowerCase().includes(filters.jobTitle.toLowerCase()) && 
          !item.job_title?.toLowerCase().includes(filters.jobTitle.toLowerCase())) {
        return false;
      }

      // Salary range filters
      if (filters.salaryMin && item.pay_period_salary && item.pay_period_salary < parseFloat(filters.salaryMin)) {
        return false;
      }
      if (filters.salaryMax && item.pay_period_salary && item.pay_period_salary > parseFloat(filters.salaryMax)) {
        return false;
      }

      // Pay type filter
      if (filters.payType && item.pay_type !== filters.payType) {
        return false;
      }

      // FLSA status filter
      if (filters.flsaStatus && item.flsa_status !== filters.flsaStatus && item.flsa_classification !== filters.flsaStatus) {
        return false;
      }

      // Division filter
      if (filters.division && item.division !== filters.division) {
        return false;
      }

      // Cost center filter
      if (filters.costCenter && item.cost_center !== filters.costCenter) {
        return false;
      }

      // Union status filter
      if (filters.unionStatus && item.union_status !== filters.unionStatus) {
        return false;
      }

      // EEO category filter
      if (filters.eeoCategory && item.eeo_categories !== filters.eeoCategory) {
        return false;
      }

      // Approval status filter (for timecards)
      if (filters.approvalStatus && item.approval_status !== filters.approvalStatus) {
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
          onChange={(e: any) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
        />
        
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
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filters.employeeStatus}
          onChange={(e: any) => setFilters(prev => ({ ...prev, employeeStatus: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Terminated">Terminated</option>
          <option value="On Leave">On Leave</option>
          <option value="Suspended">Suspended</option>
        </select>
        
        <Input
          placeholder="Job Title"
          value={filters.jobTitle}
          onChange={(e: any) => setFilters(prev => ({ ...prev, jobTitle: e.target.value }))}
        />
        
        <Input
          type="number"
          placeholder="Min Salary"
          value={filters.salaryMin}
          onChange={(e: any) => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
        />
        
        <Input
          type="number"
          placeholder="Max Salary"
          value={filters.salaryMax}
          onChange={(e: any) => setFilters(prev => ({ ...prev, salaryMax: e.target.value }))}
        />
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filters.payType}
          onChange={(e: any) => setFilters(prev => ({ ...prev, payType: e.target.value }))}
        >
          <option value="">All Pay Types</option>
          <option value="salary">Salary</option>
          <option value="hourly">Hourly</option>
        </select>
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filters.flsaStatus}
          onChange={(e: any) => setFilters(prev => ({ ...prev, flsaStatus: e.target.value }))}
        >
          <option value="">All FLSA Status</option>
          <option value="exempt">Exempt</option>
          <option value="non-exempt">Non-Exempt</option>
        </select>
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filters.division}
          onChange={(e: any) => setFilters(prev => ({ ...prev, division: e.target.value }))}
        >
          <option value="">All Divisions</option>
          <option value="Technology">Technology</option>
          <option value="Revenue">Revenue</option>
          <option value="Operations">Operations</option>
        </select>
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filters.unionStatus}
          onChange={(e: any) => setFilters(prev => ({ ...prev, unionStatus: e.target.value }))}
        >
          <option value="">All Union Status</option>
          <option value="union_member">Union Member</option>
          <option value="non_union">Non-Union</option>
        </select>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={() => setFilters({
            startDate: '', endDate: '', department: '', location: '', employeeStatus: '',
            jobTitle: '', salaryMin: '', salaryMax: '', payType: '', flsaStatus: '',
            division: '', costCenter: '', unionStatus: '', eeoCategory: '', approvalStatus: '',
            taxYear: '', formType: '', searchTerm: ''
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
                  <p><strong>Status:</strong> <Badge>{statement.check_status}</Badge></p>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
        
        <div className="grid gap-4">
          {filteredData.map((timecard: any) => (
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
      </div>
    );
  };

  const renderTaxData = () => {
    const filteredData = applyFilters(taxData, 'tax-records');
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tax Records ({filteredData.length} records)</h3>
          <div className="flex gap-2">
            <Button onClick={() => downloadCSV(filteredData, 'tax_records')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => downloadJSON(filteredData, 'tax_records')} variant="outline">
              Export JSON
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredData.map((record: any) => (
            <Card key={record.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-semibold">{record.form_type} - {record.tax_year}</h4>
                  <p className="text-sm text-gray-600">{record.tax_record_id}</p>
                  <p className="text-sm">{record.employee_id}</p>
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
                  <p><strong>Jurisdiction:</strong> {record.tax_jurisdiction}</p>
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
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Comprehensive Analytics Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{employeeData.length}</div>
            <div className="text-sm text-gray-600">Total Employees</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{payStatementData.length}</div>
            <div className="text-sm text-gray-600">Pay Statements</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{timecardData.length}</div>
            <div className="text-sm text-gray-600">Timecard Records</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{jobData.length}</div>
            <div className="text-sm text-gray-600">Job Positions</div>
          </div>
        </div>
      </Card>
      
      {renderEmployeeData()}
      {renderPayStatementData()}
      {renderTimecardData()}
      {renderJobData()}
      {renderTaxData()}
    </div>
  );

  const tabs = [
    { id: 'employees', label: 'Enhanced Employees', icon: '👥' },
    { id: 'pay-statements', label: 'Pay Statements', icon: '💰' },
    { id: 'timecards', label: 'Timecards', icon: '⏰' },
    { id: 'jobs', label: 'Job Catalog', icon: '💼' },
    { id: 'tax-records', label: 'Tax Records', icon: '📋' },
    { id: 'all-reports', label: 'All Reports', icon: '📊' }
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

        {/* Enhanced Filters */}
        {renderEnhancedFilters()}

        {/* loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg">loading enhanced data...</div>
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
            {activeTab === 'all-reports' && renderAllReports()}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EnhancedReportingPage;

