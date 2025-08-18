import { supabase } from '@/lib/supabase'

/**
 * HR Report Query Service (Fixed for TypeScript)
 * 
 * Provides centralized database query functionality for all HR report types
 * with comprehensive customer isolation, parameter binding, error handling,
 * and audit logging capabilities.
 * 
 * @author Manus AI
 * @version 1.0.1
 * @created 2025-08-18
 * @fixed TypeScript compilation issues
 */

export interface QueryParameters {
  customer_id: string
  date_from?: string
  date_to?: string
  include_sensitive?: boolean
  active_only?: boolean
  include_terminated?: boolean
  departments?: string[]
  positions?: string[]
  employee_codes?: string[]
  status_filter?: string[]
  pay_types?: string[]
  field_names?: string[]
  states?: string[]
  include_historical?: boolean
  limit?: number
  offset?: number
}

export interface QueryResult {
  data: any[]
  error: string | null
  count: number
  execution_time: number
  query_metadata: {
    report_type: string
    customer_id: string
    parameters_used: QueryParameters
    timestamp: string
    user_id?: string
  }
}

export interface FilterOptions {
  departments: string[]
  positions: string[]
  statuses: string[]
  payTypes: string[]
  states: string[]
  employees: Array<{ code: string; name: string }>
  customFields: string[]
}

export interface QueryValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class HRReportQueryService {
  
  /**
   * Validate query parameters before execution
   */
  static validateParameters(params: QueryParameters): QueryValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required parameters
    if (!params.customer_id) {
      errors.push('customer_id is required')
    }

    // Date validation
    if (params.date_from && params.date_to) {
      const fromDate = new Date(params.date_from)
      const toDate = new Date(params.date_to)
      
      if (fromDate > toDate) {
        errors.push('date_from must be before or equal to date_to')
      }
      
      if (fromDate > new Date()) {
        warnings.push('date_from is in the future')
      }
    }

    // Array parameter validation
    if (params.departments && params.departments.length === 0) {
      warnings.push('departments array is empty, consider removing filter')
    }

    if (params.positions && params.positions.length === 0) {
      warnings.push('positions array is empty, consider removing filter')
    }

    // Limit validation
    if (params.limit && (params.limit < 1 || params.limit > 10000)) {
      errors.push('limit must be between 1 and 10000')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Execute Current Demographics Report Query
   * Returns the most recent demographic record for each employee
   */
  static async getCurrentDemographics(params: QueryParameters): Promise<QueryResult> {
    const startTime = Date.now()
    const reportType = 'demographics'
    
    try {
      // Validate parameters
      const validation = this.validateParameters(params)
      if (!validation.isValid) {
        return {
          data: [],
          error: `Parameter validation failed: ${validation.errors.join(', ')}`,
          count: 0,
          execution_time: Date.now() - startTime,
          query_metadata: {
            report_type: reportType,
            customer_id: params.customer_id,
            parameters_used: params,
            timestamp: new Date().toISOString()
          }
        }
      }

      // Use the stored procedure for better performance and type safety
      const { data, error } = await supabase.rpc('get_current_demographics', {
        p_customer_id: params.customer_id,
        p_date_from: params.date_from || null,
        p_date_to: params.date_to || null,
        p_include_sensitive: params.include_sensitive || false,
        p_active_only: params.active_only || false,
        p_include_terminated: params.include_terminated !== false,
        p_departments: params.departments || null,
        p_positions: params.positions || null,
        p_employee_codes: params.employee_codes || null,
        p_limit: params.limit || null,
        p_offset: params.offset || null
      })

      const result: QueryResult = {
        data: data || [],
        error: error?.message || null,
        count: (data || []).length,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      // Log query execution
      await this.logQueryExecution(reportType, params.customer_id, params, result)

      return result

    } catch (err) {
      const result: QueryResult = {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        count: 0,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result
    }
  }

  /**
   * Execute Custom Fields Report Query
   * Returns all custom field values for employees within specified criteria
   */
  static async getCustomFields(params: QueryParameters): Promise<QueryResult> {
    const startTime = Date.now()
    const reportType = 'custom_fields'
    
    try {
      const validation = this.validateParameters(params)
      if (!validation.isValid) {
        return {
          data: [],
          error: `Parameter validation failed: ${validation.errors.join(', ')}`,
          count: 0,
          execution_time: Date.now() - startTime,
          query_metadata: {
            report_type: reportType,
            customer_id: params.customer_id,
            parameters_used: params,
            timestamp: new Date().toISOString()
          }
        }
      }

      const { data, error } = await supabase.rpc('get_custom_fields_validated', {
        p_customer_id: params.customer_id,
        p_date_from: params.date_from || null,
        p_date_to: params.date_to || null,
        p_field_names: params.field_names || null,
        p_employee_codes: params.employee_codes || null,
        p_limit: params.limit || null,
        p_offset: params.offset || null
      })

      const result: QueryResult = {
        data: data || [],
        error: error?.message || null,
        count: (data || []).length,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result

    } catch (err) {
      const result: QueryResult = {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        count: 0,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result
    }
  }

  /**
   * Execute Employee Status History Report Query
   * Returns chronological status changes for employees
   */
  static async getStatusHistory(params: QueryParameters): Promise<QueryResult> {
    const startTime = Date.now()
    const reportType = 'status_history'
    
    try {
      const validation = this.validateParameters(params)
      if (!validation.isValid) {
        return {
          data: [],
          error: `Parameter validation failed: ${validation.errors.join(', ')}`,
          count: 0,
          execution_time: Date.now() - startTime,
          query_metadata: {
            report_type: reportType,
            customer_id: params.customer_id,
            parameters_used: params,
            timestamp: new Date().toISOString()
          }
        }
      }

      const { data, error } = await supabase.rpc('get_status_history_with_duration', {
        p_customer_id: params.customer_id,
        p_date_from: params.date_from || null,
        p_date_to: params.date_to || null,
        p_status_filter: params.status_filter || null,
        p_employee_codes: params.employee_codes || null,
        p_limit: params.limit || null,
        p_offset: params.offset || null
      })

      const result: QueryResult = {
        data: data || [],
        error: error?.message || null,
        count: (data || []).length,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result

    } catch (err) {
      const result: QueryResult = {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        count: 0,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result
    }
  }

  /**
   * Execute Pay History Report Query
   * Returns compensation changes with calculated fields
   */
  static async getPayHistory(params: QueryParameters): Promise<QueryResult> {
    const startTime = Date.now()
    const reportType = 'pay_history'
    
    try {
      const validation = this.validateParameters(params)
      if (!validation.isValid) {
        return {
          data: [],
          error: `Parameter validation failed: ${validation.errors.join(', ')}`,
          count: 0,
          execution_time: Date.now() - startTime,
          query_metadata: {
            report_type: reportType,
            customer_id: params.customer_id,
            parameters_used: params,
            timestamp: new Date().toISOString()
          }
        }
      }

      const { data, error } = await supabase.rpc('get_pay_history_with_calculations', {
        p_customer_id: params.customer_id,
        p_date_from: params.date_from || null,
        p_date_to: params.date_to || null,
        p_pay_types: params.pay_types || null,
        p_employee_codes: params.employee_codes || null,
        p_limit: params.limit || null,
        p_offset: params.offset || null
      })

      const result: QueryResult = {
        data: data || [],
        error: error?.message || null,
        count: (data || []).length,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result

    } catch (err) {
      const result: QueryResult = {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        count: 0,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result
    }
  }

  /**
   * Execute Position History Report Query
   * Returns organizational and position changes with supervisor information
   */
  static async getPositionHistory(params: QueryParameters): Promise<QueryResult> {
    const startTime = Date.now()
    const reportType = 'position_history'
    
    try {
      const validation = this.validateParameters(params)
      if (!validation.isValid) {
        return {
          data: [],
          error: `Parameter validation failed: ${validation.errors.join(', ')}`,
          count: 0,
          execution_time: Date.now() - startTime,
          query_metadata: {
            report_type: reportType,
            customer_id: params.customer_id,
            parameters_used: params,
            timestamp: new Date().toISOString()
          }
        }
      }

      const { data, error } = await supabase.rpc('get_position_history_with_supervisors', {
        p_customer_id: params.customer_id,
        p_date_from: params.date_from || null,
        p_date_to: params.date_to || null,
        p_departments: params.departments || null,
        p_positions: params.positions || null,
        p_employee_codes: params.employee_codes || null,
        p_limit: params.limit || null,
        p_offset: params.offset || null
      })

      const result: QueryResult = {
        data: data || [],
        error: error?.message || null,
        count: (data || []).length,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result

    } catch (err) {
      const result: QueryResult = {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        count: 0,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result
    }
  }

  /**
   * Execute Tax Information Report Query
   * Returns comprehensive tax configuration data
   */
  static async getTaxInformation(params: QueryParameters): Promise<QueryResult> {
    const startTime = Date.now()
    const reportType = 'tax_information'
    
    try {
      const validation = this.validateParameters(params)
      if (!validation.isValid) {
        return {
          data: [],
          error: `Parameter validation failed: ${validation.errors.join(', ')}`,
          count: 0,
          execution_time: Date.now() - startTime,
          query_metadata: {
            report_type: reportType,
            customer_id: params.customer_id,
            parameters_used: params,
            timestamp: new Date().toISOString()
          }
        }
      }

      const { data, error } = await supabase.rpc('get_tax_information_validated', {
        p_customer_id: params.customer_id,
        p_date_from: params.date_from || null,
        p_date_to: params.date_to || null,
        p_states: params.states || null,
        p_employee_codes: params.employee_codes || null,
        p_limit: params.limit || null,
        p_offset: params.offset || null
      })

      const result: QueryResult = {
        data: data || [],
        error: error?.message || null,
        count: (data || []).length,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result

    } catch (err) {
      const result: QueryResult = {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        count: 0,
        execution_time: Date.now() - startTime,
        query_metadata: {
          report_type: reportType,
          customer_id: params.customer_id,
          parameters_used: params,
          timestamp: new Date().toISOString()
        }
      }

      await this.logQueryExecution(reportType, params.customer_id, params, result)
      return result
    }
  }

  /**
   * Execute report query based on report type
   */
  static async executeReport(reportType: string, params: QueryParameters): Promise<QueryResult> {
    switch (reportType) {
      case 'demographics':
        return this.getCurrentDemographics(params)
      case 'custom_fields':
        return this.getCustomFields(params)
      case 'status_history':
        return this.getStatusHistory(params)
      case 'pay_history':
        return this.getPayHistory(params)
      case 'position_history':
        return this.getPositionHistory(params)
      case 'tax_information':
        return this.getTaxInformation(params)
      default:
        return {
          data: [],
          error: `Unknown report type: ${reportType}`,
          count: 0,
          execution_time: 0,
          query_metadata: {
            report_type: reportType,
            customer_id: params.customer_id,
            parameters_used: params,
            timestamp: new Date().toISOString()
          }
        }
    }
  }

  /**
   * Get available filter options for a specific customer
   */
  static async getFilterOptions(customerId: string): Promise<FilterOptions> {
    try {
      const [departments, positions, statuses, payTypes, states, employees, customFields] = await Promise.all([
        // Get unique departments
        supabase
          .from('employee_demographics')
          .select('home_department')
          .eq('customer_id', customerId)
          .not('home_department', 'is', null)
          .then(({ data }) => {
            const depts = data?.map(d => d.home_department).filter(Boolean) || []
            return [...new Set(depts)]
          }),

        // Get unique positions
        supabase
          .from('employee_demographics')
          .select('position')
          .eq('customer_id', customerId)
          .not('position', 'is', null)
          .then(({ data }) => {
            const positions = data?.map(d => d.position).filter(Boolean) || []
            return [...new Set(positions)]
          }),

        // Get unique statuses
        supabase
          .from('employee_status_history')
          .select('status')
          .eq('customer_id', customerId)
          .then(({ data }) => {
            const statuses = data?.map(d => d.status).filter(Boolean) || []
            return [...new Set(statuses)]
          }),

        // Get unique pay types
        supabase
          .from('employee_pay_history')
          .select('pay_type')
          .eq('customer_id', customerId)
          .then(({ data }) => {
            const payTypes = data?.map(d => d.pay_type).filter(Boolean) || []
            return [...new Set(payTypes)]
          }),

        // Get unique states
        supabase
          .from('employee_tax_information')
          .select('works_in_state')
          .eq('customer_id', customerId)
          .not('works_in_state', 'is', null)
          .then(({ data }) => {
            const states = data?.map(d => d.works_in_state).filter(Boolean) || []
            return [...new Set(states)]
          }),

        // Get employee list
        supabase
          .from('employee_demographics')
          .select('employee_code, first_name, last_name')
          .eq('customer_id', customerId)
          .eq('employee_status', 'Active')
          .order('last_name')
          .then(({ data }) => (data || []).map(d => ({
            code: d.employee_code,
            name: `${d.first_name} ${d.last_name}`
          }))),

        // Get custom field names
        supabase
          .from('employee_custom_fields')
          .select('field_name')
          .eq('customer_id', customerId)
          .then(({ data }) => {
            const fieldNames = data?.map(d => d.field_name).filter(Boolean) || []
            return [...new Set(fieldNames)]
          })
      ])

      return {
        departments: departments.sort(),
        positions: positions.sort(),
        statuses: statuses.sort(),
        payTypes: payTypes.sort(),
        states: states.sort(),
        employees: employees,
        customFields: customFields.sort()
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
      return {
        departments: [],
        positions: [],
        statuses: [],
        payTypes: [],
        states: [],
        employees: [],
        customFields: []
      }
    }
  }

  /**
   * Log query execution for audit trail
   */
  static async logQueryExecution(
    reportType: string,
    customerId: string,
    params: QueryParameters,
    result: QueryResult
  ): Promise<void> {
    try {
      await supabase
        .from('data_import_audit')
        .insert({
          customer_id: customerId,
          import_type: `query_${reportType}`,
          records_processed: result.count,
          records_successful: result.error ? 0 : result.count,
          records_failed: result.error ? result.count : 0,
          error_summary: result.error,
          import_status: result.error ? 'failed' : 'completed',
          notes: JSON.stringify({
            execution_time_ms: result.execution_time,
            parameters: params,
            query_metadata: result.query_metadata
          })
        })
    } catch (error) {
      console.error('Error logging query execution:', error)
      // Don't throw error here as it would interfere with the main query result
    }
  }

  /**
   * Get query execution statistics for a customer
   */
  static async getQueryStatistics(customerId: string, days: number = 30): Promise<{
    totalQueries: number
    successfulQueries: number
    failedQueries: number
    averageExecutionTime: number
    reportTypeBreakdown: Record<string, number>
  }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await supabase
        .from('data_import_audit')
        .select('import_type, import_status, notes')
        .eq('customer_id', customerId)
        .like('import_type', 'query_%')
        .gte('import_date', cutoffDate.toISOString())

      if (error || !data) {
        return {
          totalQueries: 0,
          successfulQueries: 0,
          failedQueries: 0,
          averageExecutionTime: 0,
          reportTypeBreakdown: {}
        }
      }

      const totalQueries = data.length
      const successfulQueries = data.filter(d => d.import_status === 'completed').length
      const failedQueries = totalQueries - successfulQueries

      // Calculate average execution time
      const executionTimes = data
        .map(d => {
          try {
            const notes = JSON.parse(d.notes || '{}')
            return notes.execution_time_ms || 0
          } catch {
            return 0
          }
        })
        .filter(time => time > 0)

      const averageExecutionTime = executionTimes.length > 0
        ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
        : 0

      // Report type breakdown
      const reportTypeBreakdown: Record<string, number> = {}
      data.forEach(d => {
        const reportType = d.import_type.replace('query_', '')
        reportTypeBreakdown[reportType] = (reportTypeBreakdown[reportType] || 0) + 1
      })

      return {
        totalQueries,
        successfulQueries,
        failedQueries,
        averageExecutionTime,
        reportTypeBreakdown
      }
    } catch (error) {
      console.error('Error fetching query statistics:', error)
      return {
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        averageExecutionTime: 0,
        reportTypeBreakdown: {}
      }
    }
  }
}

