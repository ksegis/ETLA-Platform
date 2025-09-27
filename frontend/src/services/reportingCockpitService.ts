import { supabase, isSupabaseDemoMode } from '@/lib/supabase'

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

      // Get unique departments
      const uniqueDepartments = new Set(data?.map((item: any) => item.department).filter(Boolean))
      const departments = Array.from(uniqueDepartments) as string[]
      return departments.sort()
    } catch (error) {
      console.error('Error in getDepartments:', error)
      return isDemoMode ? ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'] : []
    }
  }

  /**
   * Search employees by name or employee ID
   */
  async searchEmployees(searchTerm: string, tenantId?: string): Promise<Employee[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return mockEmployees.filter(emp => 
          emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (emp.employee_code && emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      let query = supabase
        .from('employees')
        .select('*')
        .in('status', ['active', 'Active'])

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      // Search in multiple fields
      query = query.or(`
        full_name.ilike.%${searchTerm}%,
        first_name.ilike.%${searchTerm}%,
        last_name.ilike.%${searchTerm}%,
        employee_id.ilike.%${searchTerm}%,
        employee_code.ilike.%${searchTerm}%,
        email.ilike.%${searchTerm}%
      `)

      query = query.order('full_name').limit(50)

      const { data, error } = await query

      if (error) {
        console.error('Error searching employees:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in searchEmployees:', error)
      return isDemoMode ? mockEmployees : []
    }
  }

  /**
   * Calculate age from birth date
   */
  calculateAge(birthDate: string | null | undefined): number | null {
    if (!birthDate) return null
    
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  /**
   * Format currency values
   */
  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Format hours
   */
  formatHours(hours: number | null | undefined): string {
    if (hours === null || hours === undefined) return '0'
    return hours.toLocaleString('en-US', { maximumFractionDigits: 1 })
  }

  /**
   * Get benefit records for an employee
   */
  async getBenefitRecords(employeeId?: string, tenantId?: string): Promise<BenefitRecord[]> {
    try {
      // Return mock data in demo mode
      if (isDemoMode) {
        return [
          {
            id: 'ben1',
            employee_id: 'emp1',
            benefit_type: 'Health Insurance',
            plan_name: 'PPO Gold',
            coverage_type: 'Family',
            enrollment_date: '2023-01-15',
            effective_date: '2023-02-01',
            employee_contribution: 250,
            employer_contribution: 500,
            coverage_amount: 10000,
            status: 'active',
            created_at: '2023-01-15T00:00:00Z'
          },
          {
            id: 'ben2',
            employee_id: 'emp1',
            benefit_type: '401k',
            plan_name: 'Retirement Plus',
            coverage_type: 'N/A',
            enrollment_date: '2023-01-15',
            effective_date: '2023-02-01',
            employee_contribution: 500,
            employer_contribution: 250,
            coverage_amount: 0,
            status: 'active',
            created_at: '2023-01-15T00:00:00Z'
          }
        ];
      }

      let query = supabase
        .from('benefits')
        .select('*')

      if (employeeId) {
        query = query.eq('employee_id', employeeId)
      }

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
}

export const reportingCockpitService = new ReportingCockpitService()


// Additional interfaces for Phase 3 - Interactive Data Grids
export interface PayStatement {
  id: string
  check_number: string
  employee_id: string
  employee_name: string
  pay_date: string
  pay_period_start: string
  pay_period_end: string
  gross_pay: number
  net_pay: number
  regular_hours: number
  overtime_hours: number
  regular_pay: number
  overtime_pay: number
  bonus_amount?: number
  commission_amount?: number
  federal_tax_withheld: number
  state_tax_withheld: number
  social_security_tax: number
  medicare_tax: number
  pretax_deductions_total?: number
  posttax_deductions_total?: number
  ytd_gross: number
  ytd_net: number
  check_status: string
}

export interface TaxRecord {
  id: string
  tax_record_id: string
  employee_id: string
  tax_year: number
  form_type: string
  wages_tips_compensation: number
  federal_income_tax_withheld: number
  social_security_wages: number
  social_security_tax_withheld: number
  medicare_wages: number
  medicare_tax_withheld: number
  state_wages: number
  state_income_tax: number
  document_status: string
  issue_date: string
  created_at: string
}

export interface BenefitRecord {
  id: string
  employee_id: string
  benefit_type: string
  plan_name: string
  coverage_type: string
  enrollment_date: string
  effective_date: string
  termination_date?: string
  employee_contribution: number
  employer_contribution: number
  coverage_amount: number
  status: string
  created_at: string
}

export interface TimecardRecord {
  id: string
  employee_id: string
  work_date: string
  clock_in: string
  clock_out: string
  break_minutes: number
  regular_hours: number
  overtime_hours: number
  total_hours: number
  hourly_rate: number
  total_pay: number
  status: string
  created_at: string
}

export interface JobPosition {
  id: string
  job_code: string
  job_title: string
  department: string
  job_family: string
  job_level: string
  pay_grade: string
  min_salary: number
  max_salary: number
  job_description: string
  requirements: string[]
  status: string
  created_at: string
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
  created_at: string
}

