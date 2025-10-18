// src/app/reporting/ReportingClient.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
const supabase = createSupabaseBrowserClient();

import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useMultiTenantMode } from '../../contexts/MultiTenantModeContext';
import { useAccessibleTenantIds } from 'hooks/useAccessibleTenantIds';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import {
  Search, Filter, RefreshCcw, Users, DollarSign, Clock, Briefcase,
  FileText, Heart, Shield, ChevronDown, ChevronUp, LayoutDashboard,
  Settings, HelpCircle, XCircle
} from 'lucide-react';

import PreviewModal from './_components/PreviewModal';
import TraditionalReportTable from '../../components/reporting/TraditionalReportTable';
import type { ReportType } from './_data';

// --- Data types (unchanged) ---
interface EnhancedEmployee { id: string; employee_id: string; employee_code: string; employee_name: string; position: string; home_department: string; division: string; cost_center: string; employment_status: string; hire_date: string; pay_type: string; manager: string; email: string; phone: string; address: string; city: string; state: string; zip_code: string; country: string; date_of_birth: string; gender: string; ethnicity: string; ssn: string; salary: number; hourly_rate: number; flsa_status: string; union_member: boolean; eeo_category: string; work_location: string; emergency_contact_name: string; emergency_contact_phone: string; tenant_id: string; }
interface EnhancedPayStatement { id: string; check_number: string; employee_name: string; employee_code: string; pay_period_start: string; pay_period_end: string; pay_date: string; gross_pay: number; net_pay: number; check_status: string; tenant_id: string; }
interface EnhancedTimecard { tenant_id: string; employee_ref: string; employee_name: string; work_date: string; first_clock_in: string | null; mid_clock_out: string | null; mid_clock_in: string | null; last_clock_out: string | null; total_hours: number; regular_hours: number; ot_hours: number; dt_hours: number; is_corrected: boolean; corrected_by: string | null; corrected_at: string | null; correction_reason: string | null; employee_id?: string; employee_code?: string; }
interface JobRecord { id: string; job_id: string; job_code: string; job_title: string; job_family: string; job_level: string; department: string; division: string; cost_center: string; location: string; flsa_classification: string; union_code: string; min_pay_range: number; max_pay_range: number; midpoint_pay: number; job_description: string; job_requirements: string; budget_allocation: number; status: string; effective_date: string; end_date: string; customer_id: string; tenant_id: string; employee_count: number; }
interface TaxRecord { id: string; tax_record_id: string; employee_id: string; employee_name: string; ssn: string; tax_year: number; form_type: string; filing_status: string; dependents: number; tax_jurisdiction: string; state_code: string; wages_tips_compensation: number; federal_income_tax_withheld: number; social_security_wages: number; social_security_tax_withheld: number; medicare_wages: number; medicare_tax_withheld: number; state_wages: number; state_income_tax: number; local_tax: number; nonemployee_compensation: number; misc_income: number; document_status: string; issue_date: string; customer_id: string; tenant_id: string; }
interface BenefitDeduction { id: string; benefit_deduction_id: string; employee_id: string; employee_name: string; deduction_type: string; deduction_code: string; amount: number; frequency: string; effective_date: string; end_date: string; employer_contribution: number; employee_contribution: number; court_order_number: string; garnishment_details: any; customer_id: string; tenant_id: string; }
interface ComplianceRecord { id: string; compliance_id: string; employee_id: string; employee_name: string; compliance_type: string; reporting_period: string; status: string; data_details: any; filing_date: string; due_date: string; customer_id: string; tenant_id: string; }
interface PayStatementDetail { id: string; check_number: string; employee_name: string; employee_code: string; pay_period_start: string; pay_period_end: string; pay_date: string; regular_hours: number; overtime_hours: number; doubletime_hours: number; regular_pay: number; overtime_pay: number; bonus_amount: number; commission_amount: number; gross_pay: number; pretax_deductions: any; posttax_deductions: any; federal_tax_withheld: number; state_tax_withheld: number; local_tax_withheld: number; social_security_tax: number; medicare_tax: number; net_pay: number; ytd_gross: number; ytd_net: number; ytd_federal_tax: number; ytd_state_tax: number; ytd_social_security: number; ytd_medicare: number; direct_deposit_details: any; check_status: string; }
interface FacsimileEmployee { id: string; employee_name: string; employee_id: string; }
interface FacsimilePayStatement { id: string; check_number: string; employee_id: string; }
interface FacsimileTimecard { id: string; employee_id: string; work_date: string; }
interface FacsimileTaxRecord { id: string; employee_id: string; tax_year: number; }

interface EnhancedFilters {
  startDate: string; endDate: string; department: string; location: string; employeeStatus: string; jobTitle: string; salaryMin: string; salaryMax: string; payType: string; flsaStatus: string; division: string; costCenter: string; unionStatus: string; eeoCategory: string; approvalStatus: string; taxYear: string; formType: string; deductionType: string; complianceType: string; searchTerm: string;
}

export default function ReportingClient() {
  // New unified contexts
  const { loading: authLoading } = useAuth();
  const { tenantId, isDemoMode } = useTenant();
  const { isMultiTenant } = useMultiTenantMode(); // shim feeds from Tenant/Auth
  const accessibleTenantIds = useAccessibleTenantIds() ?? []; // expect [{id,name},...]

  const [activeTab, setActiveTab] = useState<string>('employees');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearchHelp, setShowSearchHelp] = useState<boolean>(false);
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState<boolean>(false);

  // Data states
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

  // Facsimile states
  const [showFacsimileModal, setShowFacsimileModal] = useState<boolean>(false);
  const [facsimileData, setFacsimileData] = useState<FacsimilePayStatement | FacsimileTimecard | FacsimileTaxRecord | null>(null);
  const [facsimileType, setFacsimileType] = useState<'pay_statement' | 'timecard' | 'tax_w2' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<FacsimileEmployee | null>(null);

  const [showNewFacsimileModal, setShowNewFacsimileModal] = useState<boolean>(false);
  const [newFacsimileRecord, setNewFacsimileRecord] = useState<any>(null);
  const [newFacsimileType, setNewFacsimileType] = useState<string>('');

  const [viewModes, setViewModes] = useState<Record<string, 'list' | 'grid'>>({
    employees: 'list',
    'pay-statements': 'list',
    timecards: 'list',
    jobs: 'list',
    'tax-records': 'list',
    'benefits-deductions': 'list',
    compliance: 'list',
  });

  const [filters, setFilters] = useState<EnhancedFilters>({
    startDate: '', endDate: '', department: '', location: '', employeeStatus: '', jobTitle: '',
    salaryMin: '', salaryMax: '', payType: '', flsaStatus: '', division: '', costCenter: '',
    unionStatus: '', eeoCategory: '', approvalStatus: '', taxYear: '', formType: '',
    deductionType: '', complianceType: '', searchTerm: '',
  });

  // Tenant filter (for multi-tenant users)
  const [tenantFilter, setTenantFilter] = useState<string>('');

  const getSearchableFields = (tabId: string): string[] => {
    switch (tabId) {
      case 'employees': return ['Employee Name', 'Employee Code', 'Position', 'Department', 'Division', 'Cost Center', 'Manager'];
      case 'pay-statements': return ['Employee Name', 'Employee Code', 'Check Number', 'Pay Date'];
      case 'timecards': return ['Employee Name', 'Employee Code', 'Department', 'Supervisor', 'Work Date'];
      case 'jobs': return ['Job Title', 'Job Code', 'Department', 'Division', 'Job Family', 'Job Level'];
      case 'tax-records': return ['Employee Name', 'Tax Record ID', 'Form Type', 'Tax Year'];
      case 'benefits-deductions': return ['Employee Name', 'Deduction Type', 'Deduction Code', 'Benefit ID'];
      case 'compliance': return ['Employee Name', 'Compliance Type', 'Compliance ID', 'Reporting Period'];
      default: return ['Employee Name', 'Employee Code'];
    }
  };

  const handleExport = (r: ReportType) => {
    window.location.href = `/api/reports/${r.id}/export`;
  };

  const setViewMode = (tabId: string, mode: 'list' | 'grid') => {
    setViewModes(prev => ({ ...prev, [tabId]: mode }));
  };
  const getViewMode = (tabId: string): 'list' | 'grid' => viewModes[tabId] || 'list';

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
        if (!error && employee) setSelectedEmployee(employee);
      } catch {
        // ignore
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

  const handleViewFacsimile = (record: any) => {
    setNewFacsimileRecord(record);
    setNewFacsimileType(
      activeTab === 'timecards' ? 'timecard' :
      activeTab === 'pay-statements' ? 'pay_statement' :
      activeTab === 'tax-records' ? 'tax_w2' :
      activeTab === 'jobs' ? 'job' :
      activeTab === 'benefits-deductions' ? 'benefit' :
      activeTab === 'compliance' ? 'compliance' :
      activeTab === 'employees' ? 'employee' : 'expense'
    );
    setShowNewFacsimileModal(true);
  };

  const handlePrintFacsimile = (record: any) => {
    handleViewFacsimile(record);
    setTimeout(() => window.print(), 500);
  };

  const closeNewFacsimile = () => {
    setShowNewFacsimileModal(false);
    setNewFacsimileRecord(null);
    setNewFacsimileType('');
  };

  const fetchDataForTab = useCallback(async (tabId: string, targetTenantId: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(tabId).select('*');
      if (isMultiTenant && tenantFilter) {
        query = query.eq('tenant_id', tenantFilter);
      } else if (targetTenantId) {
        query = query.eq('tenant_id', targetTenantId);
      }
      const { data, error } = await query;
      if (error) throw error;

      switch (tabId) {
        case 'employees': setEmployeeData(data as EnhancedEmployee[]); break;
        case 'pay-statements': setPayStatementData(data as EnhancedPayStatement[]); break;
        case 'timecards': setTimecardData(data as EnhancedTimecard[]); break;
        case 'jobs': setJobData(data as JobRecord[]); break;
        case 'tax-records': setTaxData(data as TaxRecord[]); break;
        case 'benefits-deductions': setBenefitData(data as BenefitDeduction[]); break;
        case 'compliance': setComplianceData(data as ComplianceRecord[]); break;
      }
    } catch (err: any) {
      setError(`Failed to load data for ${tabId}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isMultiTenant, tenantFilter]);

  useEffect(() => {
    if (authLoading) return;
    const targetTenantId = isMultiTenant ? (tenantFilter || tenantId || '') : (tenantId || '');
    if (targetTenantId) {
      fetchDataForTab(activeTab, targetTenantId);
    }
  }, [activeTab, tenantFilter, tenantId, isMultiTenant, authLoading, fetchDataForTab]);

  const filterDataBySearch = (data: any[], term: string) => {
    if (!term) return data;
    const lower = term.toLowerCase();
    return data.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(lower)));
  };

  const handleFilterChange = (key: keyof EnhancedFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '', endDate: '', department: '', location: '', employeeStatus: '', jobTitle: '',
      salaryMin: '', salaryMax: '', payType: '', flsaStatus: '', division: '', costCenter: '',
      unionStatus: '', eeoCategory: '', approvalStatus: '', taxYear: '', formType: '',
      deductionType: '', complianceType: '', searchTerm: ''
    });
  };

  const renderFilterControls = () => {
    const commonFilters = (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)} />
          </div>
        </div>
      </>
    );

    switch (activeTab) {
      case 'employees':
        return (
          <>
            {commonFilters}
            <div className="grid grid-cols-2 gap-4">
              <Select onValueChange={(v) => handleFilterChange('department', v)} value={filters.department}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>{/* departments */}</SelectContent>
              </Select>
              <Select onValueChange={(v) => handleFilterChange('location', v)} value={filters.location}>
                <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>{/* locations */}</SelectContent>
              </Select>
            </div>
          </>
        );
      default:
        return commonFilters;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isDashboardCollapsed ? 'w-20' : 'w-64'} bg-white shadow-md flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!isDashboardCollapsed && <h1 className="text-xl font-bold text-gray-800">Reporting</h1>}
          <Button variant="ghost" size="icon" onClick={() => setIsDashboardCollapsed(!isDashboardCollapsed)}>
            {isDashboardCollapsed ? <ChevronDown /> : <ChevronUp />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded-md">
            <LayoutDashboard className="h-5 w-5 mr-3" />
            {!isDashboardCollapsed && 'Dashboard'}
          </a>
        </nav>
        <div className="p-2 border-t">
          <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded-md">
            <Settings className="h-5 w-5 mr-3" />
            {!isDashboardCollapsed && 'Settings'}
          </a>
          <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded-md">
            <HelpCircle className="h-5 w-5 mr-3" />
            {!isDashboardCollapsed && 'Help'}
          </a>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Enhanced Reporting</h1>
          </div>
          {isMultiTenant && (
            <div className="w-64">
              <Select onValueChange={(v) => setTenantFilter(v)} value={tenantFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by tenant..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accessible Tenants</SelectItem>
                  {(accessibleTenantIds || []).map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name ?? t.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="employees"><Users className="h-4 w-4 mr-2" />Employees</TabsTrigger>
              <TabsTrigger value="pay-statements"><DollarSign className="h-4 w-4 mr-2" />Pay Statements</TabsTrigger>
              <TabsTrigger value="timecards"><Clock className="h-4 w-4 mr-2" />Timecards</TabsTrigger>
              <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-2" />Jobs</TabsTrigger>
              <TabsTrigger value="tax-records"><FileText className="h-4 w-4 mr-2" />Tax Records</TabsTrigger>
              <TabsTrigger value="benefits-deductions"><Heart className="h-4 w-4 mr-2" />Benefits</TabsTrigger>
              <TabsTrigger value="compliance"><Shield className="h-4 w-4 mr-2" />Compliance</TabsTrigger>
            </TabsList>

            <Card className="mt-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="capitalize">{activeTab.replace(/-/g, ' ')}</CardTitle>
                    <CardDescription>View and manage {activeTab.replace(/-/g, ' ')} data.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fetchDataForTab(activeTab, isMultiTenant ? (tenantFilter || tenantId || '') : (tenantId || ''))}
                      disabled={loading}
                    >
                      <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <div className="relative">
                      <Input
                        placeholder={`Search in ${activeTab.replace(/-/g, ' ')}...`}
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                    <Button variant="outline" onClick={() => setShowSearchHelp(!showSearchHelp)}>
                      <Filter className="h-4 w-4 mr-2" />
                      Advanced Filters
                    </Button>
                  </div>
                </div>
                {showSearchHelp && (
                  <Card className="mt-4 bg-gray-50 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Advanced Filters</p>
                      <Button variant="ghost" size="icon" onClick={resetFilters}><XCircle className="h-4 w-4" /></Button>
                    </div>
                    {renderFilterControls()}
                  </Card>
                )}
              </CardHeader>
              <CardContent>
                {(() => {
                  switch (activeTab) {
                    case 'employees': {
                      const filtered = filterDataBySearch(employeeData, filters.searchTerm);
                      return (
                        <TraditionalReportTable
                          title="Employees"
                          data={filtered}
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
                    }
                    case 'pay-statements': {
                      const filtered = filterDataBySearch(payStatementData, filters.searchTerm);
                      return (
                        <TraditionalReportTable
                          title="Pay Statements"
                          data={filtered}
                          columns={[
                            { key: 'employee_name', label: 'Employee Name' },
                            { key: 'pay_date', label: 'Pay Date' },
                            { key: 'check_number', label: 'check &num;' },
                            { key: 'pay_period_start', label: 'Period Start' },
                            { key: 'pay_period_end', label: 'Period End' },
                            { key: 'gross_pay', label: 'Gross Pay', render: (i) => `$${(i.gross_pay || 0).toFixed(2)}` },
                            { key: 'net_pay', label: 'Net Pay', render: (i) => `$${(i.net_pay || 0).toFixed(2)}` },
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
                    }
                    case 'timecards': {
                      const filtered = filterDataBySearch(timecardData, filters.searchTerm);
                      return (
                        <TraditionalReportTable
                          title="Timecards"
                          data={filtered}
                          columns={[
                            { key: 'employee_name', label: 'Employee Name' },
                            { key: 'work_date', label: 'Work Date' },
                            { key: 'total_hours', label: 'Total Hours' },
                            { key: 'regular_hours', label: 'Regular' },
                            { key: 'ot_hours', label: 'Overtime' },
                            { key: 'dt_hours', label: 'Double Time' },
                            { key: 'is_corrected', label: 'Corrected?' },
                          ]}
                          onRowClick={(row) => openFacsimile(row as FacsimileTimecard, 'timecard')}
                          onViewFacsimile={handleViewFacsimile}
                          onPrintFacsimile={handlePrintFacsimile}
                          viewMode={getViewMode('timecards')}
                          loading={loading}
                          error={error}
                        />
                      );
                    }
                    case 'jobs': {
                      const filtered = filterDataBySearch(jobData, filters.searchTerm);
                      return (
                        <TraditionalReportTable
                          title="Jobs"
                          data={filtered}
                          columns={[
                            { key: 'job_title', label: 'Job Title' },
                            { key: 'job_code', label: 'Job Code' },
                            { key: 'department', label: 'Department' },
                            { key: 'division', label: 'Division' },
                            { key: 'location', label: 'Location' },
                            { key: 'status', label: 'Status' },
                            { key: 'employee_count', label: 'Employees' },
                          ]}
                          onRowClick={(row) => console.log('Job row clicked:', row)}
                          onViewFacsimile={handleViewFacsimile}
                          onPrintFacsimile={handlePrintFacsimile}
                          viewMode={getViewMode('jobs')}
                          loading={loading}
                          error={error}
                        />
                      );
                    }
                    case 'tax-records': {
                      const filtered = filterDataBySearch(taxData, filters.searchTerm);
                      return (
                        <TraditionalReportTable
                          title="Tax Records"
                          data={filtered}
                          columns={[
                            { key: 'employee_name', label: 'Employee Name' },
                            { key: 'tax_year', label: 'Tax Year' },
                            { key: 'form_type', label: 'Form Type' },
                            { key: 'filing_status', label: 'Filing Status' },
                            { key: 'document_status', label: 'Document Status' },
                            { key: 'issue_date', label: 'Issue Date' },
                          ]}
                          onRowClick={(row) => openFacsimile(row as FacsimileTaxRecord, 'tax_w2')}
                          onViewFacsimile={handleViewFacsimile}
                          onPrintFacsimile={handlePrintFacsimile}
                          viewMode={getViewMode('tax-records')}
                          loading={loading}
                          error={error}
                        />
                      );
                    }
                    case 'benefits-deductions': {
                      const filtered = filterDataBySearch(benefitData, filters.searchTerm);
                      return (
                        <TraditionalReportTable
                          title="Benefits & Deductions"
                          data={filtered}
                          columns={[
                            { key: 'employee_name', label: 'Employee Name' },
                            { key: 'deduction_type', label: 'Type' },
                            { key: 'deduction_code', label: 'Code' },
                            { key: 'amount', label: 'Amount', render: (i) => `$${(i.amount || 0).toFixed(2)}` },
                            { key: 'frequency', label: 'Frequency' },
                            { key: 'effective_date', label: 'Effective Date' },
                          ]}
                          onRowClick={(row) => console.log('Benefit row clicked:', row)}
                          onViewFacsimile={handleViewFacsimile}
                          onPrintFacsimile={handlePrintFacsimile}
                          viewMode={getViewMode('benefits-deductions')}
                          loading={loading}
                          error={error}
                        />
                      );
                    }
                    case 'compliance': {
                      const filtered = filterDataBySearch(complianceData, filters.searchTerm);
                      return (
                        <TraditionalReportTable
                          title="Compliance"
                          data={filtered}
                          columns={[
                            { key: 'employee_name', label: 'Employee Name' },
                            { key: 'compliance_type', label: 'Type' },
                            { key: 'reporting_period', label: 'Period' },
                            { key: 'status', label: 'Status' },
                            { key: 'filing_date', label: 'Filing Date' },
                            { key: 'due_date', label: 'Due Date' },
                          ]}
                          onRowClick={(row) => console.log('Compliance row clicked:', row)}
                          onViewFacsimile={handleViewFacsimile}
                          onPrintFacsimile={handlePrintFacsimile}
                          viewMode={getViewMode('compliance')}
                          loading={loading}
                          error={error}
                        />
                      );
                    }
                    default: return null;
                  }
                })()}
              </CardContent>
            </Card>
          </Tabs>
        </main>
      </div>

      {showFacsimileModal && (
        <PreviewModal
          isOpen={showFacsimileModal}
          onClose={closeFacsimile}
          data={facsimileData}
          type={facsimileType}
          employee={selectedEmployee}
        />
      )}

      {showNewFacsimileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <Button variant="ghost" size="icon" onClick={closeNewFacsimile} className="absolute top-4 right-4">
              <XCircle />
            </Button>
            <h2 className="text-2xl font-bold mb-4 capitalize">{newFacsimileType?.replace('_', ' ')} Facsimile</h2>
            <pre>{JSON.stringify(newFacsimileRecord, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}




