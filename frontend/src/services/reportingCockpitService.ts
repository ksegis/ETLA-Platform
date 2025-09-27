import { supabase } from '@/lib/supabase'

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

class ReportingCockpitService {
  /**
   * Get all active employees with basic information
   */
  async getEmployees(tenantId?: string): Promise<Employee[]> {
    try {
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
      return []
    }
  }

  /**
   * Get employee demographics by employee code
   */
  async getEmployeeDemographics(employeeCode: string, tenantId?: string): Promise<EmployeeDemographics | null> {
    try {
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
      // TODO: Implement based on actual document storage system
      // This could be from a documents table, file system, or external service
      
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
      return 0
    }
  }

  /**
   * Get enhanced employee data with demographics, payroll summary, and document count
   */
  async getEnhancedEmployeeData(employeeId: string, tenantId?: string): Promise<EnhancedEmployeeData | null> {
    try {
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
      return null
    }
  }

  /**
   * Get departments for filtering
   */
  async getDepartments(tenantId?: string): Promise<string[]> {
    try {
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
      return []
    }
  }

  /**
   * Search employees by name or employee ID
   */
  async searchEmployees(searchTerm: string, tenantId?: string): Promise<Employee[]> {
    try {
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
      return []
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
  reason_for_change: string
  status: string
}

// Extend the ReportingCockpitService class with Phase 3 methods
class ReportingCockpitServiceExtended extends ReportingCockpitService {
  
  /**
   * Get pay statements for an employee with optional date filtering
   */
  async getPayStatements(
    employeeId: string, 
    tenantId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PayStatement[]> {
    try {
      let query = supabase
        .from('pay_statements')
        .select('*')
        .eq('employee_id', employeeId)
        .order('pay_date', { ascending: false })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      if (startDate) {
        query = query.gte('pay_date', startDate)
      }

      if (endDate) {
        query = query.lte('pay_date', endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching pay statements:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getPayStatements:', error)
      return []
    }
  }

  /**
   * Get tax records for an employee with optional year filtering
   */
  async getTaxRecords(
    employeeId: string,
    tenantId?: string,
    taxYear?: number
  ): Promise<TaxRecord[]> {
    try {
      let query = supabase
        .from('tax_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('tax_year', { ascending: false })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      if (taxYear) {
        query = query.eq('tax_year', taxYear)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tax records:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getTaxRecords:', error)
      return []
    }
  }

  /**
   * Get benefit records for an employee
   */
  async getBenefitRecords(
    employeeId: string,
    tenantId?: string,
    activeOnly: boolean = false
  ): Promise<BenefitRecord[]> {
    try {
      let query = supabase
        .from('benefits')
        .select('*')
        .eq('employee_id', employeeId)
        .order('enrollment_date', { ascending: false })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      if (activeOnly) {
        query = query.eq('status', 'active')
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching benefit records:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getBenefitRecords:', error)
      return []
    }
  }

  /**
   * Get timecard records for an employee with date filtering
   */
  async getTimecardRecords(
    employeeId: string,
    tenantId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<TimecardRecord[]> {
    try {
      // Note: Assuming timecards table exists - may need to be created
      let query = supabase
        .from('timecards')
        .select('*')
        .eq('employee_id', employeeId)
        .order('work_date', { ascending: false })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      if (startDate) {
        query = query.gte('work_date', startDate)
      }

      if (endDate) {
        query = query.lte('work_date', endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching timecard records:', error)
        // If timecards table doesn't exist, return empty array
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getTimecardRecords:', error)
      return []
    }
  }

  /**
   * Get job catalog/positions
   */
  async getJobCatalog(tenantId?: string): Promise<JobPosition[]> {
    try {
      // Note: Assuming job_positions table exists - may need to be created
      let query = supabase
        .from('job_positions')
        .select('*')
        .eq('status', 'active')
        .order('job_title')

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching job catalog:', error)
        // Return mock data if table doesn't exist
        return this.getMockJobCatalog()
      }

      return data || []
    } catch (error) {
      console.error('Error in getJobCatalog:', error)
      return this.getMockJobCatalog()
    }
  }

  /**
   * Get employee job history
   */
  async getEmployeeJobHistory(
    employeeId: string,
    tenantId?: string
  ): Promise<EmployeeJobHistory[]> {
    try {
      // Note: Assuming employee_job_history table exists
      let query = supabase
        .from('employee_job_history')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching employee job history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getEmployeeJobHistory:', error)
      return []
    }
  }

  /**
   * Mock job catalog data (fallback if table doesn't exist)
   */
  private getMockJobCatalog(): JobPosition[] {
    return [
      {
        id: '1',
        job_code: 'ENG001',
        job_title: 'Senior Software Engineer',
        department: 'Engineering',
        job_family: 'Technology',
        job_level: 'Senior',
        pay_grade: 'L5',
        min_salary: 120000,
        max_salary: 180000,
        job_description: 'Design and develop software applications',
        requirements: ['Bachelor\'s degree', '5+ years experience', 'JavaScript/TypeScript'],
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        job_code: 'MKT001',
        job_title: 'Marketing Manager',
        department: 'Marketing',
        job_family: 'Marketing',
        job_level: 'Manager',
        pay_grade: 'M3',
        min_salary: 80000,
        max_salary: 120000,
        job_description: 'Lead marketing campaigns and strategy',
        requirements: ['Bachelor\'s degree', '3+ years experience', 'Digital marketing'],
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]
  }

  /**
   * Export data to CSV format
   */
  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ''
        }).join(',')
      )
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

  /**
   * Format date for display
   */
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Calculate total compensation from pay statement
   */
  calculateTotalCompensation(payStatement: PayStatement): number {
    return (payStatement.gross_pay || 0) + 
           (payStatement.overtime_pay || 0) + 
           (payStatement.bonus_amount || 0) + 
           (payStatement.commission_amount || 0)
  }

  /**
   * Calculate total deductions from pay statement
   */
  calculateTotalDeductions(payStatement: PayStatement): number {
    return (payStatement.federal_tax_withheld || 0) +
           (payStatement.state_tax_withheld || 0) +
           (payStatement.social_security_tax || 0) +
           (payStatement.medicare_tax || 0) +
           (payStatement.pretax_deductions_total || 0) +
           (payStatement.posttax_deductions_total || 0)
  }
}

// Export the extended service
export const reportingCockpitServiceExtended = new ReportingCockpitServiceExtended()
export default reportingCockpitServiceExtended
