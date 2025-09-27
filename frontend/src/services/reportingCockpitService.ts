import { supabase, isSupabaseDemoMode } from '@/lib/supabase'
import Papa from 'papaparse';

// Types based on the actual database schema
export interface Employee {
  id: string
  employee_id: string
  employee_code?: string
  full_name: string
  first_name: string
  last_name: string
  email?: string
  job_title?: string
  department?: string
  position?: string
  hire_date: string
  termination_date?: string
  status: string
  employment_status?: string
  employment_type?: string
  work_location?: string
  manager_supervisor?: string
  annual_salary?: number
  hourly_rate?: number
  pay_type?: string
  pay_frequency?: string
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface EmployeeDemographics {
  id: string
  employee_code: string
  customer_id: string
  tenant_id?: string
  first_name?: string
  last_name?: string
  gender?: string
  marital_status?: string
  birth_date?: string
  date_of_birth?: string
  ethnic_background?: string
  ethnicity?: string
  race?: string
  veteran_status?: boolean
  has_disability?: boolean
  disability_category?: string
  work_authorization_status?: string
  citizenship_country?: string
  address_line1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  phone_mobile?: string
  email?: string
  languages?: string[]
  education_level?: string
  job_title?: string
  department?: string
  location?: string
  manager_id?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  dependent_count?: number
  created_at: string
  updated_at: string
}

export interface PayStatementSummary {
  employee_id: string
  ytd_gross?: number
  ytd_net?: number
  total_hours_ytd?: number
  latest_pay_date?: string
  total_statements?: number
}

export interface EmployeeDocumentCount {
  employee_id: string
  document_count: number
}

export interface PayStatement {
  id: string;
  check_number: string;
  employee_id: string;
  employee_name: string;
  pay_date: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  net_pay: number;
  regular_hours: number;
  overtime_hours: number;
  regular_pay: number;
  overtime_pay: number;
  federal_tax_withheld: number;
  state_tax_withheld: number;
  social_security_tax: number;
  medicare_tax: number;
  ytd_gross: number;
  ytd_net: number;
  check_status: string;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeJobHistory {
  id: string
  employee_id: string
  job_code: string
  job_title: string
  department: string
  start_date: string
  end_date?: string
  salary: number
  reason_for_change?: string
  is_current: boolean
  status: string; // Added status property
  created_at: string
}

export interface TaxRecord {
  id: string;
  employee_id: string;
  tax_year: number;
  form_type: string;
  document_url?: string;
  federal_wages: number;
  federal_tax_withheld: number;
  state_wages: number;
  state_tax_withheld: number;
  local_wages: number;
  local_tax_withheld: number;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BenefitRecord {
  id: string;
  employee_id: string;
  benefit_type: string;
  provider: string;
  plan_name?: string; // Added plan_name property
  coverage_type?: string; // Added coverage_type property
  start_date: string;
  end_date?: string;
  termination_date?: string; // Added termination_date property
  status: string;
  employee_contribution: number;
  employer_contribution: number;
  coverage_level: string;
  enrollment_date?: string; // Added enrollment_date property
  effective_date?: string; // Added effective_date property
  coverage_amount?: number; // Added coverage_amount property
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimecardRecord {
  id: string;
  employee_id: string;
  work_date: string;
  hours_worked: number;
  project?: string;
  task?: string;
  status: string;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnhancedEmployeeData {
  employee: Employee
  demographics?: EmployeeDemographics
  payrollSummary?: PayStatementSummary
  documentCount?: number
}

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

class ReportingCockpitService {
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

      if (!data || data.length === 0) {
        return null
      }

      // Get the most recent pay statement for YTD totals
      const latestStatement = data[0]
      
      // Calculate total hours from all statements
      const totalHours = data.reduce((sum: number, statement: any) => {
        return sum + (statement.regular_hours || 0) + (statement.overtime_hours || 0)
      }, 0)

      return {
        employee_id: employeeId,
        ytd_gross: latestStatement.ytd_gross || 0,
        ytd_net: latestStatement.ytd_net || 0,
        total_hours_ytd: totalHours,
        latest_pay_date: latestStatement.pay_date,
        total_statements: data.length
      }
    } catch (error) {
      console.error('Error in getPayrollSummary:', error)
      return null
    }
  }

  /**
   * Get document count for an employee
   * Note: This is a placeholder - actual implementation depends on document storage system
   */
  async getEmployeeDocumentCount(employeeId: string, tenantId?: string): Promise<number> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return 12;
      }
      
      // For now, return a calculated count based on related records
      const promises = [
        // Count pay statements
        supabase
          .from('pay_statements')
          .select('id', { count: 'exact', head: true })
          .eq('employee_id', employeeId)
          .then(({ count }: { count: number | null }) => count || 0),
        
        // Count tax records
        supabase
          .from('tax_records')
          .select('id', { count: 'exact', head: true })
          .eq('employee_id', employeeId)
          .then(({ count }: { count: number | null }) => count || 0),
        
        // Count benefits records
        supabase
          .from('benefits')
          .select('id', { count: 'exact', head: true })
          .eq('employee_id', employeeId)
          .then(({ count }: { count: number | null }) => count || 0)
      ]

      const counts = await Promise.all(promises)
      return counts.reduce((sum, count) => sum + count, 0)
    } catch (error) {
      console.error('Error in getEmployeeDocumentCount:', error)
      return isDemoMode ? 12 : 0
    }
  }

  /**
   * Get enhanced employee data with demographics, payroll summary, and document count
   */
  async getEnhancedEmployeeData(employeeId: string, tenantId?: string): Promise<EnhancedEmployeeData | null> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        const employee = mockEmployees.find(emp => emp.id === employeeId) || mockEmployees[0];
        return {
          employee,
          demographics: {
            id: 'demo1',
            employee_code: employee.employee_code || employee.employee_id,
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
          documentCount: 12
        };
      }

      // First get the employee record
      let employeeQuery = supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single()

      const { data: employee, error: employeeError } = await employeeQuery

      if (employeeError || !employee) {
        console.error('Error fetching employee:', employeeError)
        return null
      }

      // Get additional data in parallel
      const [demographics, payrollSummary, documentCount] = await Promise.all([
        this.getEmployeeDemographics(employee.employee_code || employee.employee_id, tenantId),
        this.getPayrollSummary(employeeId, tenantId),
        this.getEmployeeDocumentCount(employeeId, tenantId)
      ])

      return {
        employee,
        demographics: demographics || undefined,
        payrollSummary: payrollSummary || undefined,
        documentCount
      }
    } catch (error) {
      console.error('Error in getEnhancedEmployeeData:', error)
      
      if (isDemoMode) {
        const employee = mockEmployees.find(emp => emp.id === employeeId) || mockEmployees[0];
        return {
          employee,
          demographics: {
            id: 'demo1',
            employee_code: employee.employee_code || employee.employee_id,
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
          documentCount: 12
        };
      }
      
      return null
    }
  }

  /**
   * Get departments for filtering
   */
  async getDepartments(tenantId?: string): Promise<string[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'];
      }
      
      let query = supabase
        .from('employees')
        .select('department')
        .not('department', 'is', null)
        .in('status', ['active', 'Active'])

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching departments:', error)
        return []
      }

      return data.map(d => d.department) || []
    } catch (error) {
      console.error('Error in getDepartments:', error)
      return isDemoMode ? ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'] : []
    }
  }

  /**
   * Get pay statements for an employee within a date range
   */
  async getPayStatements(employeeId: string, tenantId?: string, startDate?: string, endDate?: string): Promise<PayStatement[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return [
          {
            id: 'ps1',
            check_number: '1001',
            employee_id: employeeId,
            employee_name: 'John Doe',
            pay_date: '2024-03-15',
            pay_period_start: '2024-03-01',
            pay_period_end: '2024-03-14',
            gross_pay: 2500,
            net_pay: 1800,
            regular_hours: 80,
            overtime_hours: 0,
            regular_pay: 2000,
            overtime_pay: 0,
            federal_tax_withheld: 200,
            state_tax_withheld: 50,
            social_security_tax: 100,
            medicare_tax: 25,
            ytd_gross: 15000,
            ytd_net: 10800,
            check_status: 'Paid'
          },
          {
            id: 'ps2',
            check_number: '1002',
            employee_id: employeeId,
            employee_name: 'John Doe',
            pay_date: '2024-03-29',
            pay_period_start: '2024-03-15',
            pay_period_end: '2024-03-28',
            gross_pay: 2500,
            net_pay: 1800,
            regular_hours: 80,
            overtime_hours: 0,
            regular_pay: 2000,
            overtime_pay: 0,
            federal_tax_withheld: 200,
            state_tax_withheld: 50,
            social_security_tax: 100,
            medicare_tax: 25,
            ytd_gross: 17500,
            ytd_net: 12600,
            check_status: 'Paid'
          }
        ];
      }

      let query = supabase
        .from('pay_statements')
        .select('*')
        .eq('employee_id', employeeId)

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }
      if (startDate) {
        query = query.gte('pay_date', startDate)
      }
      if (endDate) {
        query = query.lte('pay_date', endDate)
      }

      query = query.order('pay_date', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching pay statements:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getPayStatements:', error)
      return isDemoMode ? [] : []
    }
  }

  /**
   * Get benefit records for an employee
   */
  async getBenefitRecords(employeeId: string, tenantId?: string): Promise<BenefitRecord[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return [
          {
            id: 'b1',
            employee_id: employeeId,
            benefit_type: 'Health Insurance',
            provider: 'Blue Cross Blue Shield',
            plan_name: 'PPO Gold',
            coverage_type: 'Medical',
            start_date: '2023-01-01',
            end_date: '2024-12-31',
            termination_date: '2024-12-31',
            status: 'Active',
            employee_contribution: 150,
            employer_contribution: 450,
            coverage_level: 'Family',
            enrollment_date: '2022-12-01',
            effective_date: '2023-01-01',
            coverage_amount: 50000,
            created_at: '2023-01-01T00:00:00Z'
          },
          {
            id: 'b2',
            employee_id: employeeId,
            benefit_type: 'Dental Insurance',
            provider: 'Delta Dental',
            plan_name: 'Dental PPO',
            coverage_type: 'Dental',
            start_date: '2023-01-01',
            end_date: '2024-12-31',
            termination_date: '2024-12-31',
            status: 'Active',
            employee_contribution: 30,
            employer_contribution: 70,
            coverage_level: 'Individual',
            enrollment_date: '2022-12-01',
            effective_date: '2023-01-01',
            coverage_amount: 0,
            created_at: '2023-01-01T00:00:00Z'
          }
        ];
      }

      let query = supabase
        .from('benefits')
        .select('*')
        .eq('employee_id', employeeId)

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching benefit records:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getBenefitRecords:', error)
      return isDemoMode ? [] : []
    }
  }

  /**
   * Get employee job history
   */
  async getEmployeeJobHistory(employeeId: string, tenantId?: string): Promise<EmployeeJobHistory[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return [
          {
            id: 'job1',
            employee_id: employeeId,
            job_code: 'SSE',
            job_title: 'Software Engineer',
            department: 'Engineering',
            start_date: '2023-01-15',
            end_date: '2024-01-14',
            salary: 120000,
            reason_for_change: 'Promotion',
            is_current: false,
            status: 'inactive',
            created_at: '2023-01-15T00:00:00Z'
          },
          {
            id: 'job2',
            employee_id: employeeId,
            job_code: 'LDSSE',
            job_title: 'Lead Software Engineer',
            department: 'Engineering',
            start_date: '2024-01-15',
            salary: 140000,
            is_current: true,
            status: 'active',
            created_at: '2024-01-15T00:00:00Z'
          }
        ];
      }

      let query = supabase
        .from('job_history')
        .select('*')
        .eq('employee_id', employeeId)

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      query = query.order('start_date', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching job history:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getEmployeeJobHistory:', error)
      return isDemoMode ? [] : []
    }
  }

  /**
   * Get tax records for an employee
   */
  async getTaxRecords(employeeId: string, tenantId?: string): Promise<TaxRecord[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return [
          {
            id: 't1',
            employee_id: employeeId,
            tax_year: 2023,
            form_type: 'W-2',
            document_url: '#',
            federal_wages: 120000,
            federal_tax_withheld: 15000,
            state_wages: 120000,
            state_tax_withheld: 5000,
            local_wages: 120000,
            local_tax_withheld: 1000,
            created_at: '2024-01-20T00:00:00Z'
          },
          {
            id: 't2',
            employee_id: employeeId,
            tax_year: 2022,
            form_type: 'W-2',
            document_url: '#',
            federal_wages: 110000,
            federal_tax_withheld: 13000,
            state_wages: 110000,
            state_tax_withheld: 4500,
            local_wages: 110000,
            local_tax_withheld: 900,
            created_at: '2023-01-20T00:00:00Z'
          }
        ];
      }

      let query = supabase
        .from('tax_records')
        .select('*')
        .eq('employee_id', employeeId)

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      query = query.order('tax_year', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tax records:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getTaxRecords:', error)
      return isDemoMode ? [] : []
    }
  }

  /**
   * Get timecard records for an employee within a date range
   */
  async getTimecards(employeeId: string, tenantId?: string, startDate?: string, endDate?: string): Promise<TimecardRecord[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return [
          {
            id: 'tc1',
            employee_id: employeeId,
            work_date: '2024-03-10',
            hours_worked: 8,
            project: 'Project Alpha',
            task: 'Development',
            status: 'Approved',
            created_at: '2024-03-10T00:00:00Z'
          },
          {
            id: 'tc2',
            employee_id: employeeId,
            work_date: '2024-03-11',
            hours_worked: 8.5,
            project: 'Project Alpha',
            task: 'Testing',
            status: 'Approved',
            created_at: '2024-03-11T00:00:00Z'
          }
        ];
      }

      let query = supabase
        .from('timecards')
        .select('*')
        .eq('employee_id', employeeId)

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }
      if (startDate) {
        query = query.gte('work_date', startDate)
      }
      if (endDate) {
        query = query.lte('work_date', endDate)
      }

      query = query.order('work_date', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching timecards:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getTimecards:', error)
      return isDemoMode ? [] : []
    }
  }

  /**
   * Search employees by name, ID, or email
   */
  async searchEmployees(searchTerm: string, tenantId?: string): Promise<Employee[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return mockEmployees.filter(employee =>
          employee.full_name.toLowerCase().includes(lowerCaseSearchTerm) ||
          employee.employee_id.toLowerCase().includes(lowerCaseSearchTerm) ||
          (employee.email && employee.email.toLowerCase().includes(lowerCaseSearchTerm))
        );
      }

      let query = supabase
        .from('employees')
        .select('*')
        .in('status', ['active', 'Active']);

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      // Supabase doesn't directly support OR in filter for RLS, so we'll do a broader search and filter client-side if needed
      // For now, we'll search across multiple fields using `ilike` for case-insensitive search
      query = query.or(
        `full_name.ilike.%${searchTerm}%`,
        `employee_id.ilike.%${searchTerm}%`,
        `email.ilike.%${searchTerm}%`
      );

      const { data, error } = await query;

      if (error) {
        console.error('Error searching employees:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchEmployees:', error);
      return isDemoMode ? [] : [];
    }
  }
}

export const reportingCockpitService = new ReportingCockpitService();

export const exportToCSV = <T>(data: T[], filename: string) => {
  if (data.length === 0) {
    console.warn('No data to export.');
    return;
  }

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


// Added a comment to trigger a new commit

