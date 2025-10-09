import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useMultiTenantMode } from "@/contexts/MultiTenantModeContext";
import { useAccessibleTenantIds } from "@/hooks/useAccessibleTenantIds";
import BackNav from "./_components/BackNav";
import ReportTable from "./_components/ReportTable";
import PreviewModal from "./_components/PreviewModal";
import TraditionalReportTable from "@/components/reporting/TraditionalReportTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, RefreshCcw, Users, DollarSign, Clock, Briefcase, FileText, Heart, Shield, ChevronDown, ChevronUp, LayoutDashboard, Settings, HelpCircle, XCircle } from "lucide-react";
import { type ReportType } from "./_data";

// Define types for enhanced data structures
interface EnhancedEmployee {
  id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  position: string;
  home_department: string;
  division: string;
  cost_center: string;
  employment_status: string;
  hire_date: string;
  pay_type: string;
  manager: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  date_of_birth: string;
  gender: string;
  ethnicity: string;
  ssn: string;
  salary: number;
  hourly_rate: number;
  flsa_status: string;
  union_member: boolean;
  eeo_category: string;
  work_location: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  tenant_id: string;
}

interface EnhancedPayStatement {
  id: string;
  check_number: string;
  employee_name: string;
  employee_code: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  gross_pay: number;
  net_pay: number;
  check_status: string;
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

// Facsimile types (assuming these are defined elsewhere or need to be defined)
interface FacsimileEmployee {
  id: string;
  employee_name: string;
  employee_id: string;
  // ... other employee fields
}

interface FacsimilePayStatement {
  id: string;
  check_number: string;
  employee_id: string;
  // ... other pay statement fields
}

interface FacsimileTimecard {
  id: string;
  employee_id: string;
  work_date: string;
  // ... other timecard fields
}

interface FacsimileTaxRecord {
  id: string;
  employee_id: string;
  tax_year: number;
  // ... other tax record fields
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

export default function EnhancedReportingPage() {
  const { selectedTenant, isDemoMode, isLoading: tenantLoading } = useTenant();
  const accessibleTenantIds = useAccessibleTenantIds();
  const { isMultiTenant, availableTenants } = useMultiTenantMode();
  const [activeTab, setActiveTab] = useState<string>("employees");
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
  const [facsimileType, setFacsimileType] = useState<"pay_statement" | "timecard" | "tax_w2" | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<FacsimileEmployee | null>(null);
  
  // New FacsimileModal states
  const [showNewFacsimileModal, setShowNewFacsimileModal] = useState<boolean>(false);
  const [newFacsimileRecord, setNewFacsimileRecord] = useState<any>(null);
  const [newFacsimileType, setNewFacsimileType] = useState<string>("");
  
  // Enhanced view mode state - separate for each tab
  const [viewModes, setViewModes] = useState<Record<string, "list" | "grid">>({
    employees: "list",
    "pay-statements": "list",
    timecards: "list",
    jobs: "list",
    "tax-records": "list",
    "benefits-deductions": "list",
    compliance: "list"
  });

  // Enhanced filters
  const [filters, setFilters] = useState<EnhancedFilters>({
    startDate: "",
    endDate: "",
    department: "",
    location: "",
    employeeStatus: "",
    jobTitle: "",
    salaryMin: "",
    salaryMax: "",
    payType: "",
    flsaStatus: "",
    division: "",
    costCenter: "",
    unionStatus: "",
    eeoCategory: "",
    approvalStatus: "",
    taxYear: "",
    formType: "",
    deductionType: "",
    complianceType: "",
    searchTerm: ""
  });
  
  // Tenant filter for multi-tenant users
  const [tenantFilter, setTenantFilter] = useState<string>("");

  const getSearchableFields = (tabId: string): string[] => {
    switch (tabId) {
      case "employees":
        return ["Employee Name", "Employee Code", "Position", "Department", "Division", "Cost Center", "Manager"];
      case "pay-statements":
        return ["Employee Name", "Employee Code", "Check Number", "Pay Date"];
      case "timecards":
        return ["Employee Name", "Employee Code", "Department", "Supervisor", "Work Date"];
      case "jobs":
        return ["Job Title", "Job Code", "Department", "Division", "Job Family", "Job Level"];
      case "tax-records":
        return ["Employee Name", "Tax Record ID", "Form Type", "Tax Year"];
      case "benefits-deductions":
        return ["Employee Name", "Deduction Type", "Deduction Code", "Benefit ID"];
      case "compliance":
        return ["Employee Name", "Compliance Type", "Compliance ID", "Reporting Period"];
      default:
        return ["Employee Name", "Employee Code"];
    }
  };

  const handleExport = (r: ReportType) => {
    // keep the same export route you already have
    window.location.href = `/api/reports/${r.id}/export`;
  };

  const setViewMode = (tabId: string, mode: "list" | "grid") => {
    setViewModes(prev => ({ ...prev, [tabId]: mode }));
  };

  const getViewMode = (tabId: string): "list" | "grid" => {
    return viewModes[tabId] || "list";
  };

  const openFacsimile = async (data: any, type: "pay_statement" | "timecard" | "tax_w2") => {
    setFacsimileData(data);
    setFacsimileType(type);
    
    if (data.employee_id) {
      try {
        const { data: employee, error } = await supabase
          .from("employees")
          .select("*")
          .eq("employee_id", data.employee_id)
          .single();
        
        if (!error && employee) {
          setSelectedEmployee(employee);
        }
      } catch (err) {
        console.log("Could not load employee data for facsimile");
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
      activeTab === "timecards" ? "timecard" :
      activeTab === "pay-statements" ? "pay_statement" :
      activeTab === "tax-records" ? "tax_w2" :
      activeTab === "jobs" ? "job" :
      activeTab === "benefits-deductions" ? "benefit" :
      activeTab === "compliance" ? "compliance" :
      activeTab === "employees" ? "employee" :
      "expense"
    );
    setShowNewFacsimileModal(true);
  };

  const handlePrintFacsimile = (record: any) => {
    setNewFacsimileRecord(record);
    setNewFacsimileType(
      activeTab === "timecards" ? "timecard" :
      activeTab === "pay-statements" ? "pay_statement" :
      activeTab === "tax-records" ? "tax_w2" :
      activeTab === "jobs" ? "job" :
      activeTab === "benefits-deductions" ? "benefit" :
      activeTab === "compliance" ? "compliance" :
      activeTab === "employees" ? "employee" :
      "expense"
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
    setNewFacsimileType("");
  };

  const renderDataTypeContent = () => {
    switch (activeTab) {
      case "employees":
        const filteredData = filterDataBySearch(employeeData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Employees"
            data={filteredData}
            columns={[
              { key: "employee_name", label: "Employee Name" },
              { key: "employee_code", label: "Employee Code" },
              { key: "position", label: "Position" },
              { key: "home_department", label: "Department" },
              { key: "division", label: "Division" },
              { key: "employment_status", label: "Status" },
              { key: "hire_date", label: "Hire Date" },
              { key: "pay_type", label: "Pay Type" },
            ]}
            onRowClick={(row) => setSelectedEmployee(row as FacsimileEmployee)}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode("employees")}
            loading={loading}
            error={error}
          />
        );
      case "pay-statements":
        const filteredPayStatements = filterDataBySearch(payStatementData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Pay Statements"
            data={filteredPayStatements}
            columns={[
              { key: "employee_name", label: "Employee Name" },
              { key: "pay_date", label: "Pay Date" },
              { key: "check_number", label: "Check #" },
              { key: "pay_period_start", label: "Period Start" },
              { key: "pay_period_end", label: "Period End" },
              { key: "gross_pay", label: "Gross Pay", render: (item) => `$${(item.gross_pay || 0).toFixed(2)}` },
              { key: "net_pay", label: "Net Pay", render: (item) => `$${(item.net_pay || 0).toFixed(2)}` },
              { key: "check_status", label: "Status" },
            ]}
            onRowClick={(row) => openFacsimile(row as FacsimilePayStatement, "pay_statement")}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode("pay-statements")}
            loading={loading}
            error={error}
          />
        );
      case "timecards":
        const filteredTimecards = filterDataBySearch(timecardData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Timecards"
            data={filteredTimecards}
            columns={[
              { key: "employee_name", label: "Employee Name" },
              { key: "work_date", label: "Date" },
              { key: "first_clock_in", label: "Clock In" },
              { key: "last_clock_out", label: "Clock Out" },
              { key: "total_hours", label: "Total Hours" },
              { key: "regular_hours", label: "Regular" },
              { key: "ot_hours", label: "Overtime" },
              { key: "dt_hours", label: "Double Time" },
              { key: "is_corrected", label: "Status", render: (item) => item.is_corrected ? "Corrected" : "Calculated" },
            ]}
            onRowClick={(row) => openFacsimile(row as FacsimileTimecard, "timecard")}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode="list"
            loading={loading}
            error={error}
          />
        );
      case "tax-records":
        const filteredTaxRecords = filterDataBySearch(taxData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Tax Records"
            data={filteredTaxRecords}
            columns={[
              { key: "employee_name", label: "Employee Name" },
              { key: "tax_year", label: "Year" },
              { key: "form_type", label: "Form Type" },
              { key: "wages_tips_compensation", label: "Wages", render: (item) => `$${(item.wages_tips_compensation || 0).toFixed(2)}` },
              { key: "federal_income_tax_withheld", label: "Fed Tax", render: (item) => `$${(item.federal_income_tax_withheld || 0).toFixed(2)}` },
              { key: "document_status", label: "Status" },
            ]}
            onRowClick={(row) => openFacsimile(row as FacsimileTaxRecord, "tax_w2")}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode("tax-records")}
            loading={loading}
            error={error}
          />
        );
      case "benefits-deductions":
        const filteredBenefits = filterDataBySearch(benefitData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Benefits & Deductions"
            data={filteredBenefits}
            columns={[
              { key: "employee_name", label: "Employee Name" },
              { key: "deduction_type", label: "Type" },
              { key: "amount", label: "Amount", render: (item) => `$${(item.amount || 0).toFixed(2)}` },
              { key: "frequency", label: "Frequency" },
              { key: "effective_date", label: "Effective Date" },
              { key: "employer_contribution", label: "Employer Contrib.", render: (item) => `$${(item.employer_contribution || 0).toFixed(2)}` },
            ]}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode("benefits-deductions")}
            loading={loading}
            error={error}
          />
        );
      case "compliance":
        const filteredCompliance = filterDataBySearch(complianceData, filters.searchTerm);
        return (
          <TraditionalReportTable
            title="Compliance Records"
            data={filteredCompliance}
            columns={[
              { key: "employee_name", label: "Employee Name" },
              { key: "compliance_type", label: "Type" },
              { key: "reporting_period", label: "Period" },
              { key: "status", label: "Status" },
              { key: "due_date", label: "Due Date" },
            ]}
            onViewFacsimile={handleViewFacsimile}
            onPrintFacsimile={handlePrintFacsimile}
            viewMode={getViewMode("compliance")}
            loading={loading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  const loadTabData = useCallback(async (tabId: string) => {
    // Don\'t load if tenant context is still loading
    if (tenantLoading) return;
    
    setLoading(true);
    setError(null);

    // Get tenant IDs with proper fallback logic
    let tenantIds: string[] = [];
    
    if (isDemoMode) {
      tenantIds = ["99883779-9517-4ca9-a3f8-7fdc59051f0e"]; // Demo tenant ID
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
        case "employees":
          query = supabase.from("employee_comprehensive_report").select("*").in("tenant_id", tenantIds);
          const { data: employees, error: empError } = await query;
          if (empError) throw empError;
          setEmployeeData(employees || []);
          break;
        case "pay-statements":
          query = supabase.from("pay_statements_comprehensive_report").select("*").in("tenant_id", tenantIds);
          const { data: payStatements, error: psError } = await query;
          if (psError) throw psError;
          setPayStatementData(payStatements || []);
          break;
        case "timecards":
          query = supabase.from("v_timecard_daily_effective_v2").select("*").in("tenant_id", tenantIds);
          const { data: timecards, error: tcError } = await query;
          if (tcError) throw tcError;
          setTimecardData(timecards || []);
          break;
        case "jobs":
          query = supabase.from("jobs_comprehensive_report").select("*").in("tenant_id", tenantIds);
          const { data: jobs, error: jobError } = await query;
          if (jobError) throw jobError;
          setJobData(jobs || []);
          break;
        case "tax-records":
          try {
            query = supabase.from("tax_records_comprehensive_report").select("*").in("tenant_id", tenantIds);
            const { data: taxes, error: taxError } = await query;
            if (taxError) {
              console.error("Tax records query error:", taxError);
              throw taxError;
            }
            console.log("Tax records data:", taxes);
            setTaxData(taxes || []);
          } catch (taxErr) {
            console.error("Tax records loading error:", taxErr);
            setTaxData([]);
          }
          break;
        case "benefits-deductions":
          query = supabase.from("benefits").select("*").in("tenant_id", tenantIds);
          const { data: benefits, error: benefitError } = await query;
          if (benefitError) throw benefitError;
          setBenefitData(benefits || []);
          break;
        case "compliance":
          // Assuming a compliance table exists
          query = supabase.from("compliance_records").select("*").in("tenant_id", tenantIds);
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
        typeof value === "string" && value.toLowerCase().includes(term)
      );
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      department: "",
      location: "",
      employeeStatus: "",
      jobTitle: "",
      salaryMin: "",
      salaryMax: "",
      payType: "",
      flsaStatus: "",
      division: "",
      costCenter: "",
      unionStatus: "",
      eeoCategory: "",
      approvalStatus: "",
      taxYear: "",
      formType: "",
      deductionType: "",
      complianceType: "",
      searchTerm: ""
    });
    loadTabData(activeTab);
  };

  const reportTabs = [
    { id: "employees", label: "Employees", icon: Users },
    { id: "pay-statements", label: "Pay Statements", icon: DollarSign },
    { id: "timecards", label: "Timecards", icon: Clock },
    { id: "jobs", label: "Job History", icon: Briefcase },
    { id: "tax-records", label: "Tax Records", icon: FileText },
    { id: "benefits-deductions", label: "Benefits", icon: Heart },
    { id: "compliance", label: "Compliance", icon: Shield },
  ];

  return (
    <div className="p-6">
      {/* <- Back button */}
      <BackNav href="/" label="Back to app" />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">All Reports</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            {reportTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                <tab.icon className="mr-2 h-4 w-4" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowSearchHelp(!showSearchHelp)}>
              <HelpCircle className="h-4 w-4 mr-2" /> Search Help
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Clear Filters
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDashboardCollapsed(!isDashboardCollapsed)}>
              {isDashboardCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {showSearchHelp && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Search & Filter Help</CardTitle>
              <CardDescription>Use the search bar to filter data within the active tab. You can search by employee name, code, and other relevant fields. Filters below apply across all tabs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchTerm">Search Term</Label>
                  <Input id="searchTerm" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder="Search all fields..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" value={filters.department} onChange={handleFilterChange} placeholder="e.g., Sales" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={filters.location} onChange={handleFilterChange} placeholder="e.g., New York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeStatus">Employee Status</Label>
                  <Select onValueChange={(value) => setFilters(prev => ({ ...prev, employeeStatus: value }))} value={filters.employeeStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" name="jobTitle" value={filters.jobTitle} onChange={handleFilterChange} placeholder="e.g., Software Engineer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payType">Pay Type</Label>
                  <Select onValueChange={(value) => setFilters(prev => ({ ...prev, payType: value }))} value={filters.payType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pay type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isMultiTenant && availableTenants.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="tenantFilter">Tenant</Label>
                    <Select onValueChange={setTenantFilter} value={tenantFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by Tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Tenants</SelectItem>
                        {availableTenants.map(tenant => (
                          <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" /> Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {reportTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {loading && <div className="text-center py-8">Loading {tab.label} data...</div>}
            {error && <div className="text-center py-8 text-red-500">Error loading {tab.label} data: {error}</div>}
            {!loading && !error && renderDataTypeContent()}
          </TabsContent>
        ))}

        {showFacsimileModal && facsimileData && facsimileType && (
          <PreviewModal
            open={showFacsimileModal}
            report={facsimileData}
            reportType={facsimileType}
            onClose={closeFacsimile}
          />
        )}

        {showNewFacsimileModal && newFacsimileRecord && newFacsimileType && (
          <PreviewModal
            open={showNewFacsimileModal}
            report={newFacsimileRecord}
            reportType={newFacsimileType}
            onClose={closeNewFacsimile}
          />
        )}
      </Tabs>
    </div>
  );
}
