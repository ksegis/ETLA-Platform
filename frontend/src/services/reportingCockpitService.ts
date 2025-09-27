import { supabase, isSupabaseDemoMode } from '@/lib/supabase';
import Papa from 'papaparse';
import {
  Employee,
  EmployeeDemographics,
  PayStatementSummary,
  EmployeeDocumentCount,
  PayStatement,
  EmployeeJobHistory,
  TaxRecord,
  BenefitRecord,
  TimecardRecord,
  EnhancedEmployeeData,
  Department,
  DocumentRecord
} from '@/types/reporting';

const isDemoMode = isSupabaseDemoMode;

// Mock data for demo mode
const mockEmployees: Employee[] = [
  {
    id: 'emp1',
    employee_id: 'EMP001',
    employee_code: 'E001',
    full_name: 'John Smith',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@company.com',
    job_title: 'Senior Software Engineer',
    department: 'Engineering',
    position: 'Senior Developer',
    hire_date: '2023-01-15',
    status: 'active',
    employment_status: 'full-time',
    employment_type: 'regular',
    work_location: 'Remote',
    manager_supervisor: 'Jane Doe',
    annual_salary: 120000,
    pay_type: 'salary',
    pay_frequency: 'bi-weekly',
    tenant_id: 'tenant1',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z'
  },
  {
    id: 'emp2',
    employee_id: 'EMP002',
    employee_code: 'E002',
    full_name: 'Sarah Johnson',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@company.com',
    job_title: 'Marketing Manager',
    department: 'Marketing',
    position: 'Manager',
    hire_date: '2023-02-01',
    status: 'active',
    employment_status: 'full-time',
    employment_type: 'regular',
    work_location: 'Office',
    manager_supervisor: 'Michael Brown',
    annual_salary: 95000,
    pay_type: 'salary',
    pay_frequency: 'bi-weekly',
    tenant_id: 'tenant1',
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2023-02-01T00:00:00Z'
  }
];

const mockPayStatements: PayStatement[] = [
  {
    id: 'ps1',
    check_number: 'CHK001',
    employee_id: 'emp1',
    employee_name: 'John Smith',
    pay_date: '2023-09-15',
    pay_period_start: '2023-09-01',
    pay_period_end: '2023-09-15',
    gross_pay: 2500,
    net_pay: 1800,
    regular_hours: 80,
    overtime_hours: 0,
    regular_pay: 2500,
    overtime_pay: 0,
    federal_tax_withheld: 300,
    state_tax_withheld: 100,
    social_security_tax: 150,
    medicare_tax: 30,
    ytd_gross: 85000,
    ytd_net: 62000,
    check_status: 'Issued',
    tenant_id: 'tenant1',
    created_at: '2023-09-15T00:00:00Z',
    updated_at: '2023-09-15T00:00:00Z'
  },
  {
    id: 'ps2',
    check_number: 'CHK002',
    employee_id: 'emp1',
    employee_name: 'John Smith',
    pay_date: '2023-08-31',
    pay_period_start: '2023-08-16',
    pay_period_end: '2023-08-31',
    gross_pay: 2500,
    net_pay: 1800,
    regular_hours: 80,
    overtime_hours: 0,
    regular_pay: 2500,
    overtime_pay: 0,
    federal_tax_withheld: 300,
    state_tax_withheld: 100,
    social_security_tax: 150,
    medicare_tax: 30,
    ytd_gross: 82500,
    ytd_net: 60200,
    check_status: 'Issued',
    tenant_id: 'tenant1',
    created_at: '2023-08-31T00:00:00Z',
    updated_at: '2023-08-31T00:00:00Z'
  }
];

const mockTaxRecords: TaxRecord[] = [
  {
    id: 'tr1',
    employee_id: 'emp1',
    tax_year: 2022,
    form_type: 'W-2',
    document_url: '/documents/w2_john_2022.pdf',
    federal_wages: 80000,
    federal_tax_withheld: 8000,
    state_wages: 80000,
    state_tax_withheld: 4000,
    local_wages: 0,
    local_tax_withheld: 0,
    document_status: 'Issued',
    issue_date: '2023-01-20',
    tax_record_id: 'W2-EMP001-2022',
    wages_tips_compensation: 80000,
    social_security_wages: 80000,
    social_security_tax_withheld: 4960,
    medicare_wages: 80000,
    medicare_tax_withheld: 1160,
    state_income_tax: 4000,
    tenant_id: 'tenant1',
    created_at: '2023-01-20T00:00:00Z',
    updated_at: '2023-01-20T00:00:00Z'
  },
  {
    id: 'tr2',
    employee_id: 'emp1',
    tax_year: 2021,
    form_type: 'W-2',
    document_url: '/documents/w2_john_2021.pdf',
    federal_wages: 75000,
    federal_tax_withheld: 7500,
    state_wages: 75000,
    state_tax_withheld: 3750,
    local_wages: 0,
    local_tax_withheld: 0,
    document_status: 'Issued',
    issue_date: '2022-01-20',
    tax_record_id: 'W2-EMP001-2021',
    wages_tips_compensation: 75000,
    social_security_wages: 75000,
    social_security_tax_withheld: 4650,
    medicare_wages: 75000,
    medicare_tax_withheld: 1087.5,
    state_income_tax: 3750,
    tenant_id: 'tenant1',
    created_at: '2022-01-20T00:00:00Z',
    updated_at: '2022-01-20T00:00:00Z'
  }
];

const mockBenefits: BenefitRecord[] = [
  {
    id: 'b1',
    employee_id: 'emp1',
    benefit_type: 'Health Insurance',
    provider: 'Blue Cross Blue Shield',
    plan_name: 'PPO Platinum',
    coverage_type: 'Family',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    termination_date: undefined,
    status: 'Active',
    employee_contribution: 150,
    employer_contribution: 450,
    coverage_level: 'High',
    enrollment_date: '2022-11-15',
    effective_date: '2023-01-01',
    coverage_amount: 100000,
    tenant_id: 'tenant1',
    created_at: '2022-11-15T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'b2',
    employee_id: 'emp1',
    benefit_type: 'Dental Insurance',
    provider: 'Delta Dental',
    plan_name: 'PPO Basic',
    coverage_type: 'Individual',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    termination_date: undefined,
    status: 'Active',
    employee_contribution: 30,
    employer_contribution: 50,
    coverage_level: 'Medium',
    enrollment_date: '2022-11-15',
    effective_date: '2023-01-01',
    coverage_amount: 1500,
    tenant_id: 'tenant1',
    created_at: '2022-11-15T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

const mockTimecards: TimecardRecord[] = [
  {
    id: 'tc1',
    employee_id: 'emp1',
    work_date: '2023-09-15',
    hours_worked: 8,
    project: 'Project Alpha',
    task: 'Development',
    status: 'Approved',
    tenant_id: 'tenant1',
    created_at: '2023-09-15T17:00:00Z',
    updated_at: '2023-09-15T17:00:00Z'
  },
  {
    id: 'tc2',
    employee_id: 'emp1',
    work_date: '2023-09-14',
    hours_worked: 8.5,
    project: 'Project Alpha',
    task: 'Code Review',
    status: 'Approved',
    tenant_id: 'tenant1',
    created_at: '2023-09-14T17:30:00Z',
    updated_at: '2023-09-14T17:30:00Z'
  }
];

const mockJobHistory: EmployeeJobHistory[] = [
  {
    id: 'jh1',
    employee_id: 'emp1',
    job_code: 'SSE',
    job_title: 'Senior Software Engineer',
    department: 'Engineering',
    start_date: '2023-01-15',
    end_date: undefined,
    salary: 120000,
    reason_for_change: 'Promotion',
    is_current: true,
    status: 'Active',
    created_at: '2023-01-15T00:00:00Z'
  },
  {
    id: 'jh2',
    employee_id: 'emp1',
    job_code: 'JSE',
    job_title: 'Junior Software Engineer',
    department: 'Engineering',
    start_date: '2021-06-01',
    end_date: '2023-01-14',
    salary: 90000,
    reason_for_change: 'Initial Hire',
    is_current: false,
    status: 'Inactive',
    created_at: '2021-06-01T00:00:00Z'
  }
];

const mockDepartments: Department[] = [
  { id: 'dpt1', name: 'Engineering', tenant_id: 'tenant1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'dpt2', name: 'Marketing', tenant_id: 'tenant1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'dpt3', name: 'Sales', tenant_id: 'tenant1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockDocuments: DocumentRecord[] = [
  {
    id: 'doc1',
    document_name: 'Employee Handbook',
    document_type: 'pdf',
    document_category: 'HR Documents',
    file_path: '/documents/employee_handbook.pdf',
    file_size: 102400,
    upload_date: '2023-01-01',
    tags: ['handbook', 'policy'],
    access_level: 'public',
    status: 'Approved',
    employee_id: 'emp1',
    tenant_id: 'tenant1',
    created_by: 'HR Dept',
    last_accessed: '2023-09-27T10:00:00Z',
    metadata: { version: '1.0', author: 'HR Dept' },
    is_confidential: false
  },
  {
    id: 'doc2',
    document_name: 'Q3 Performance Review',
    document_type: 'doc',
    document_category: 'Performance',
    file_path: '/documents/q3_review_john.doc',
    file_size: 51200,
    upload_date: '2023-09-10',
    tags: ['review', 'performance'],
    access_level: 'restricted',
    status: 'Pending Approval',
    employee_id: 'emp1',
    tenant_id: 'tenant1',
    created_by: 'Manager',
    is_confidential: true,
    last_accessed: '2023-09-26T14:30:00Z',
    metadata: { quarter: 'Q3', year: '2023' }
  }
];

export class ReportingCockpitService {
  /**
   * Get all active employees with basic information
   */
  async getEmployees(tenantId?: string): Promise<Employee[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return mockEmployees;
      }

      let query = supabase
        .from('employees')
        .select('*')
        .in('status', ['active', 'Active'])
        .order('full_name')

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching employees:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getEmployees:', error)
      return isDemoMode ? mockEmployees : []
    }
  }

  /**
   * Search employees by name, ID, or email
   */
  async searchEmployees(searchTerm: string, tenantId?: string): Promise<Employee[]> {
    try {
      if (isDemoMode) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return mockEmployees.filter(employee =>
          employee.full_name.toLowerCase().includes(lowerCaseSearchTerm) ||
          employee.employee_id.toLowerCase().includes(lowerCaseSearchTerm) ||
          employee.email?.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }

      let query = supabase
        .from('employees')
        .select('*')
        .in('status', ['active', 'Active'])
        .ilike('full_name', `%${searchTerm}%`)
        .or(`employee_id.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('full_name');

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching employees:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchEmployees:', error);
      return isDemoMode ? mockEmployees.filter(emp => emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())) : [];
    }
  }

  /**
   * Get employee demographics by employee code
   */
  async getEmployeeDemographics(employeeCode: string, tenantId?: string): Promise<EmployeeDemographics | null> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return {
          id: 'demo1',
          employee_code: employeeCode,
          customer_id: 'cust1',
          first_name: 'John',
          last_name: 'Smith',
          gender: 'Male',
          marital_status: 'Married',
          birth_date: '1985-06-15',
          ethnic_background: 'Caucasian',
          veteran_status: false,
          has_disability: false,
          work_authorization_status: 'Citizen',
          citizenship_country: 'United States',
          address_line1: '123 Main St',
          city: 'Austin',
          state: 'TX',
          postal_code: '78701',
          country: 'USA',
          phone_mobile: '512-555-1234',
          email: 'john.smith@company.com',
          job_title: 'Senior Software Engineer',
          department: 'Engineering',
          created_at: '2023-01-15T00:00:00Z',
          updated_at: '2023-01-15T00:00:00Z'
        };
      }

      let query = supabase
        .from('employee_demographics')
        .select('*')
        .eq('employee_code', employeeCode)
        .order('effective_date', { ascending: false })
        .limit(1)

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching employee demographics:', error)
        throw error
      }

      return data && data.length > 0 ? data[0] : null
    } catch (error) {
      console.error('Error in getEmployeeDemographics:', error)
      return null
    }
  }

  /**
   * Get payroll summary for an employee (YTD totals, hours, etc.)
   */
  async getPayrollSummary(employeeId: string, tenantId?: string): Promise<PayStatementSummary | null> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return {
          employee_id: employeeId,
          ytd_gross: 85000,
          ytd_net: 62000,
          total_hours_ytd: 1520,
          latest_pay_date: '2023-09-15',
          total_statements: 18
        };
      }

      let query = supabase
        .from('pay_statements')
        .select(`
          employee_id,
          ytd_gross,
          ytd_net,
          regular_hours,
          overtime_hours,
          pay_date
        `)
        .eq('employee_id', employeeId)
        .order('pay_date', { ascending: false })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching payroll summary:', error)
        throw error
      }

      // Aggregate the data to get the latest YTD values and total statements
      if (data && data.length > 0) {
        const latestStatement = data[0]; // Assuming data is ordered by pay_date DESC
        return {
          employee_id: employeeId,
          ytd_gross: latestStatement.ytd_gross,
          ytd_net: latestStatement.ytd_net,
          total_hours_ytd: data.reduce((sum: number, s: any) => sum + (s.regular_hours || 0) + (s.overtime_hours || 0), 0),
          latest_pay_date: latestStatement.pay_date,
          total_statements: data.length
        };
      }
      return null;
    } catch (error) {
      console.error('Error in getPayrollSummary:', error);
      return isDemoMode ? {
        employee_id: employeeId,
        ytd_gross: 85000,
        ytd_net: 62000,
        total_hours_ytd: 1520,
        latest_pay_date: '2023-09-15',
        total_statements: 18
      } : null;
    }
  }

  /**
   * Get pay statements for an employee within a date range
   */
  async getPayStatements(employeeId: string, tenantId?: string, startDate?: string, endDate?: string): Promise<PayStatement[]> {
    try {
      if (isDemoMode) {
        return mockPayStatements.filter(ps => ps.employee_id === employeeId);
      }

      let query = supabase
        .from('pay_statements')
        .select('*')
        .eq('employee_id', employeeId)
        .order('pay_date', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      if (startDate) {
        query = query.gte('pay_date', startDate);
      }
      if (endDate) {
        query = query.lte('pay_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching pay statements:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPayStatements:', error);
      return isDemoMode ? mockPayStatements.filter(ps => ps.employee_id === employeeId) : [];
    }
  }

  /**
   * Get tax records for an employee by tax year or date range
   */
  async getTaxRecords(employeeId: string, tenantId?: string, taxYear?: number): Promise<TaxRecord[]> {
    try {
      if (isDemoMode) {
        return mockTaxRecords.filter(tr => tr.employee_id === employeeId);
      }

      let query = supabase
        .from('tax_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('tax_year', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      if (taxYear) {
        query = query.eq('tax_year', taxYear);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tax records:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTaxRecords:', error);
      return isDemoMode ? mockTaxRecords.filter(tr => tr.employee_id === employeeId) : [];
    }
  }

  /**
   * Get benefit records for an employee
   */
  async getBenefitRecords(employeeId: string, tenantId?: string): Promise<BenefitRecord[]> {
    try {
      if (isDemoMode) {
        return mockBenefits.filter(b => b.employee_id === employeeId);
      }

      let query = supabase
        .from('benefits')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching benefit records:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBenefitRecords:', error);
      return isDemoMode ? mockBenefits.filter(b => b.employee_id === employeeId) : [];
    }
  }

  /**
   * Get timecard records for an employee within a date range
   */
  async getTimecardRecords(employeeId: string, tenantId?: string, startDate?: string, endDate?: string): Promise<TimecardRecord[]> {
    try {
      if (isDemoMode) {
        return mockTimecards.filter(tc => tc.employee_id === employeeId);
      }

      let query = supabase
        .from('timecards')
        .select('*')
        .eq('employee_id', employeeId)
        .order('work_date', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      if (startDate) {
        query = query.gte('work_date', startDate);
      }
      if (endDate) {
        query = query.lte('work_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching timecard records:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTimecardRecords:', error);
      return isDemoMode ? mockTimecards.filter(tc => tc.employee_id === employeeId) : [];
    }
  }

  /**
   * Get employee job history
   */
  async getEmployeeJobHistory(employeeId: string, tenantId?: string): Promise<EmployeeJobHistory[]> {
    try {
      if (isDemoMode) {
        return mockJobHistory.filter(jh => jh.employee_id === employeeId);
      }

      let query = supabase
        .from('job_history')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching job history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEmployeeJobHistory:', error);
      return isDemoMode ? mockJobHistory.filter(jh => jh.employee_id === employeeId) : [];
    }
  }

  /**
   * Get enhanced employee data (employee, demographics, payroll summary, document count)
   */
  async getEnhancedEmployeeData(employeeId: string, tenantId?: string): Promise<EnhancedEmployeeData | null> {
    try {
      if (isDemoMode) {
        const employee = mockEmployees.find(emp => emp.id === employeeId);
        if (!employee) return null;
        return {
          employee,
          demographics: {
            id: 'demo1',
            employee_code: employee.employee_id,
            customer_id: 'cust1',
            first_name: employee.first_name,
            last_name: employee.last_name,
            gender: 'Male',
            marital_status: 'Married',
            birth_date: '1985-06-15',
            ethnic_background: 'Caucasian',
            veteran_status: false,
            has_disability: false,
            work_authorization_status: 'Citizen',
            citizenship_country: 'United States',
            address_line1: '123 Main St',
            city: 'Austin',
            state: 'TX',
            postal_code: '78701',
            country: 'USA',
            phone_mobile: '512-555-1234',
            email: employee.email,
            job_title: employee.job_title,
            department: employee.department,
            created_at: '2023-01-15T00:00:00Z',
            updated_at: '2023-01-15T00:00:00Z'
          },
          payrollSummary: {
            employee_id: employeeId,
            ytd_gross: 85000,
            ytd_net: 62000,
            total_hours_ytd: 1520,
            latest_pay_date: '2023-09-15',
            total_statements: 18
          },
          documentCount: 2
        };
      }

      const [employee, demographics, payrollSummary, documentCount] = await Promise.all([
        this.getEmployees(tenantId).then(emps => emps.find(emp => emp.id === employeeId) || null),
        this.getEmployeeDemographics(employeeId, tenantId),
        this.getPayrollSummary(employeeId, tenantId),
        supabase.from('documents').select('count', { count: 'exact' }).eq('employee_id', employeeId).eq('tenant_id', tenantId).then((res: any) => res.count)
      ]);

      if (!employee) return null;

      return {
        employee,
        demographics: demographics || undefined,
        payrollSummary: payrollSummary || undefined,
        documentCount: documentCount || 0
      };
    } catch (error) {
      console.error('Error in getEnhancedEmployeeData:', error);
      return isDemoMode ? {
        employee: mockEmployees[0],
        demographics: {
          id: 'demo1',
          employee_code: mockEmployees[0].employee_id,
          customer_id: 'cust1',
          first_name: mockEmployees[0].first_name,
          last_name: mockEmployees[0].last_name,
          gender: 'Male',
          marital_status: 'Married',
          birth_date: '1985-06-15',
          ethnic_background: 'Caucasian',
          veteran_status: false,
          has_disability: false,
          work_authorization_status: 'Citizen',
          citizenship_country: 'United States',
          address_line1: '123 Main St',
          city: 'Austin',
          state: 'TX',
          postal_code: '78701',
          country: 'USA',
          phone_mobile: '512-555-1234',
          email: mockEmployees[0].email,
          job_title: mockEmployees[0].job_title,
          department: mockEmployees[0].department,
          created_at: '2023-01-15T00:00:00Z',
          updated_at: '2023-01-15T00:00:00Z'
        },
        payrollSummary: {
          employee_id: employeeId,
          ytd_gross: 85000,
          ytd_net: 62000,
          total_hours_ytd: 1520,
          latest_pay_date: '2023-09-15',
          total_statements: 18
        },
        documentCount: 2
      } : null;
    }
  }

  /**
   * Get all departments
   */
  async getDepartments(tenantId?: string): Promise<Department[]> {
    try {
      if (isDemoMode) {
        return mockDepartments;
      }

      let query = supabase
        .from('employees') // Assuming departments are derived from employees table
        .select('department')
        .not('department', 'is', null)
        .distinct('department');

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }

      // Map distinct department names to Department interface
      return data ? data.map((d: any) => ({ 
        id: d.department.toLowerCase().replace(/\s/g, '-'), // Generate a simple ID
        name: d.department,
        tenant_id: tenantId || 'unknown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) : [];
    } catch (error) {
      console.error('Error in getDepartments:', error);
      return isDemoMode ? mockDepartments : [];
    }
  }
}

export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


// Force refresh: Ensure Department type is recognized

