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
export default reportingCockpitService
