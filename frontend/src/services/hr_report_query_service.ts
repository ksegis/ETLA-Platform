import { supabase } from '@/lib/supabase'

/**
 * HR Report Query Service
 * 
 * Provides centralized database query functionality for all HR report types
 * with comprehensive customer isolation, parameter binding, error handling,
 * and audit logging capabilities.
 * 
 * @author Manus AI
 * @version 1.0.0
 * @created 2025-08-18
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

      // Build the query with customer isolation
      let query = supabase
        .from('employee_demographics')
        .select(`
          effective_date,
          employee_code,
          ${params.include_sensitive ? 'ssn' : `
            CASE 
              WHEN ssn IS NOT NULL THEN 'XXX-XX-' || RIGHT(ssn, 4)
              ELSE NULL 
            END as ssn
          `},
          first_name,
          middle_name,
          last_name,
          address_1,
          address_2,
          city,
          state,
          zip_code,
          work_phone,
          personal_phone,
          work_email,
          personal_email,
          gender,
          marital_status,
          birth_date,
          ethnic_background,
          employee_status,
          hire_date,
          termination_date,
          rehire_date,
          "position",
          eeoc_class,
          home_department,
          labor_allocation,
          pay_type,
          pay_frequency,
          pay_period_salary,
          hourly_rate,
          workers_compensation_code,
          employment_status,
          employment_type,
          work_location,
          created_at,
          updated_at
        `)
        .eq('customer_id', params.customer_id)

      // Apply date filters
      if (params.date_from) {
        query = query.gte('effective_date', params.date_from)
      }
      if (params.date_to) {
        query = query.lte('effective_date', params.date_to)
      }

      // Apply status filters
      if (params.active_only) {
        query = query.eq('employee_status', 'Active')
      }
      if (!params.include_terminated) {
        query = query.neq('employee_status', 'Terminated')
      }

      // Apply department filters
      if (params.departments && params.departments.length > 0) {
        query = query.in('home_department', params.departments)
      }

      // Apply position filters
      if (params.positions && params.positions.length > 0) {
        query = query.in('"position"', params.positions)
      }

      // Apply employee code filters
      if (params.employee_codes && params.employee_codes.length > 0) {
        query = query.in('employee_code', params.employee_codes)
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit)
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 1000) - 1)
      }

      // Execute query with ordering to get most recent records per employee
      const { data, error, count } = await query
        .order('employee_code')
        .order('effective_date', { ascending: false })

      // If not including historical data, get only the most recent record per employee
      let processedData = data || []
      if (!params.include_historical && processedData.length > 0) {
        const latestRecords = new Map()
        processedData.forEach(record => {
          const key = record.employee_code
          if (!latestRecords.has(key) || 
              new Date(record.effective_date) > new Date(latestRecords.get(key).effective_date)) {
            latestRecords.set(key, record)
          }
        })
        processedData = Array.from(latestRecords.values())
      }

      const result: QueryResult = {
        data: processedData,
        error: error?.message || null,
        count: processedData.length,
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

      let query = supabase
        .from('employee_custom_fields')
        .select(`
          effective_date,
          employee_code,
          employee_name,
          field_name,
          field_value,
          field_type,
          created_at,
          updated_at
        `)
        .eq('customer_id', params.customer_id)

      // Apply date filters
      if (params.date_from) {
        query = query.gte('effective_date', params.date_from)
      }
      if (params.date_to) {
        query = query.lte('effective_date', params.date_to)
      }

      // Apply field name filters
      if (params.field_names && params.field_names.length > 0) {
        query = query.in('field_name', params.field_names)
      }

      // Apply employee code filters
      if (params.employee_codes && params.employee_codes.length > 0) {
        query = query.in('employee_code', params.employee_codes)
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit)
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 1000) - 1)
      }

      const { data, error, count } = await query
        .order('employee_code')
        .order('field_name')
        .order('effective_date', { ascending: false })

      const result: QueryResult = {
        data: data || [],
        error: error?.message || null,
        count: count || 0,
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

      let query = supabase
        .from('employee_status_history')
        .select(`
          effective_date,
          employee_code,
          employee_name,
          status,
          termination_type,
          termination_reason,
          notes,
          created_at,
          updated_at
        `)
        .eq('customer_id', params.customer_id)

      // Apply date filters
      if (params.date_from) {
        query = query.gte('effective_date', params.date_from)
      }
      if (params.date_to) {
        query = query.lte('effective_date', params.date_to)
      }

      // Apply status filters
      if (params.status_filter && params.status_filter.length > 0) {
        query = query.in('status', params.status_filter)
      }

      // Apply employee code filters
      if (params.employee_codes && params.employee_codes.length > 0) {
        query = query.in('employee_code', params.employee_codes)
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit)
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 1000) - 1)
      }

      const { data, error, count } = await query
        .order('employee_code')
        .order('effective_date', { ascending: false })

      const result: QueryResult = {
        data: data || [],
        error: error?.message || null,
        count: count || 0,
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

      let query = supabase
        .from('employee_pay_history')
        .select(`
          effective_date,
          employee_code,
          employee_name,
          change_reason,
          pay_type,
          pay_frequency,
          new_hourly_rate,
          new_salary_rate,
          new_annual_amount,
          amount_change,
          percentage_change,
          previous_rate,
          created_at,
          updated_at
        `)
        .eq('customer_id', params.customer_id)

      // Apply date filters
      if (params.date_from) {
        query = query.gte('effective_date', params.date_from)
      }
      if (params.date_to) {
        query = query.lte('effective_date', params.date_to)
      }

      // Apply pay type filters
      if (params.pay_types && params.pay_types.length > 0) {
        query = query.in('pay_type', params.pay_types)
      }

      // Apply employee code filters
      if (params.employee_codes && params.employee_codes.length > 0) {
        query = query.in('employee_code', params.employee_codes)
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit)
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 1000) - 1)
      }

      const { data, error, count } = await query
        .order('employee_code')
        .order('effective_date', { ascending: false })

      // Post-process data to add calculated fields
      const processedData = (data || []).map(record => {
        // Calculate annual equivalent for hourly rates
        let calculatedAnnualAmount = record.new_annual_amount
        if (record.pay_type === 'Hourly' && record.new_hourly_rate) {
          const hoursPerYear = this.getAnnualHours(record.pay_frequency)
          calculatedAnnualAmount = record.new_hourly_rate * hoursPerYear
        } else if (record.pay_type === 'Salary' && record.new_salary_rate) {
          calculatedAnnualAmount = record.new_salary_rate
        }

        // Calculate percentage change if not provided
        let calculatedPercentageChange = record.percentage_change
        if (!calculatedPercentageChange && record.amount_change && record.previous_rate && record.previous_rate > 0) {
          calculatedPercentageChange = (record.amount_change / record.previous_rate) * 100
        }

        return {
          ...record,
          calculated_annual_amount: calculatedAnnualAmount,
          calculated_percentage_change: calculatedPercentageChange
        }
      })

      const result: QueryResult = {
        data: processedData,
        error: error?.message || null,
        count: count || 0,
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

      // Use a more complex query to join with supervisor information
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

      if (error) {
        // Fallback to basic query if stored procedure doesn't exist
        let query = supabase
          .from('employee_position_history')
          .select(`
            effective_date,
            employee_code,
            employee_name,
            department,
            labor_allocation,
            work_location,
            "position",
            position_level,
            position_family,
            eeoc_class,
            workers_compensation_code,
            dol_status,
            exempt_status,
            supervisor_employee_code,
            created_at,
            updated_at
          `)
          .eq('customer_id', params.customer_id)

        // Apply filters
        if (params.date_from) {
          query = query.gte('effective_date', params.date_from)
        }
        if (params.date_to) {
          query = query.lte('effective_date', params.date_to)
        }
        if (params.departments && params.departments.length > 0) {
          query = query.in('department', params.departments)
        }
        if (params.positions && params.positions.length > 0) {
          query = query.in('"position"', params.positions)
        }
        if (params.employee_codes && params.employee_codes.length > 0) {
          query = query.in('employee_code', params.employee_codes)
        }
        if (params.limit) {
          query = query.limit(params.limit)
        }
        if (params.offset) {
          query = query.range(params.offset, params.offset + (params.limit || 1000) - 1)
        }

        const fallbackResult = await query
          .order('employee_code')
          .order('effective_date', { ascending: false })

        const result: QueryResult = {
          data: fallbackResult.data || [],
          error: fallbackResult.error?.message || null,
          count: (fallbackResult.data || []).length,
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

      const result: QueryResult = {
        data: data || [],
        error: null,
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

      let query = supabase
        .from('employee_tax_information')
        .select(`
          effective_date,
          employee_code,
          employee_name,
          work_location,
          lives_in_state,
          works_in_state,
          sui_agency,
          employee_local_tax_agency_1,
          employee_local_tax_agency_2,
          employee_local_tax_agency_3,
          federal_filing_status,
          federal_allowances,
          federal_additional_withholding,
          state_1_code,
          state_1_filing_status,
          state_1_allowances,
          state_1_additional_withholding,
          state_2_code,
          state_2_filing_status,
          state_2_allowances,
          state_2_additional_withholding,
          local_1_code,
          local_1_filing_status,
          local_1_allowances,
          local_1_additional_withholding,
          local_2_code,
          local_2_filing_status,
          local_2_allowances,
          local_2_additional_withholding,
          local_3_code,
          local_3_filing_status,
          local_3_allowances,
          local_3_additional_withholding,
          created_at,
          updated_at
        `)
        .eq('customer_id', params.customer_id)

      // Apply date filters
      if (params.date_from) {
        query = query.gte('effective_date', params.date_from)
      }
      if (params.date_to) {
        query = query.lte('effective_date', params.date_to)
      }

      // Apply state filters
      if (params.states && params.states.length > 0) {
        query = query.in('works_in_state', params.states)
      }

      // Apply employee code filters
      if (params.employee_codes && params.employee_codes.length > 0) {
        query = query.in('employee_code', params.employee_codes)
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit)
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 1000) - 1)
      }

      const { data, error, count } = await query
        .order('employee_code')
        .order('effective_date', { ascending: false })

      const result: QueryResult = {
        data: data || [],
        error: error?.message || null,
        count: count || 0,
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
          .then(({ data }) => [...new Set(data?.map(d => d.home_department).filter(Boolean) || [])]),

        // Get unique positions
        supabase
          .from('employee_demographics')
          .select('"position"')
          .eq('customer_id', customerId)
          .not('"position"', 'is', null)
          .then(({ data }) => [...new Set(data?.map(d => d.position).filter(Boolean) || [])]),

        // Get unique statuses
        supabase
          .from('employee_status_history')
          .select('status')
          .eq('customer_id', customerId)
          .then(({ data }) => [...new Set(data?.map(d => d.status).filter(Boolean) || [])]),

        // Get unique pay types
        supabase
          .from('employee_pay_history')
          .select('pay_type')
          .eq('customer_id', customerId)
          .then(({ data }) => [...new Set(data?.map(d => d.pay_type).filter(Boolean) || [])]),

        // Get unique states
        supabase
          .from('employee_tax_information')
          .select('works_in_state')
          .eq('customer_id', customerId)
          .not('works_in_state', 'is', null)
          .then(({ data }) => [...new Set(data?.map(d => d.works_in_state).filter(Boolean) || [])]),

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
          .then(({ data }) => [...new Set(data?.map(d => d.field_name).filter(Boolean) || [])])
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
   * Get annual hours based on pay frequency
   */
  private static getAnnualHours(payFrequency: string): number {
    switch (payFrequency?.toLowerCase()) {
      case 'weekly': return 2080 // 40 hours * 52 weeks
      case 'biweekly': return 2080
      case 'semimonthly': return 2080
      case 'monthly': return 2080
      default: return 2080
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

