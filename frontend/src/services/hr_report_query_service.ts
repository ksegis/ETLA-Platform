import { createSupabaseServerClient } from '../lib/supabase/server'

/**
 * HR Report Query Service
 * 
 * Provides centralized database query functionality for all HR report types
 * with comprehensive customer isolation, parameter binding, error handling,
 * and audit logging capabilities.
 * 
 * @author Manus AI
 * @version 1.0.2
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

      // Use the stored procedure for better performance and type safety
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.rpc("get_current_demographics", {
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

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.rpc("get_custom_fields_validated", {
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

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.rpc("get_status_history_with_duration", {
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

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.rpc("get_pay_history_with_calculations", {
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

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.rpc("get_position_history_with_supervisors", {
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

      const supabase = await createSupabaseServerClient();
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
   * Centralized function to execute any report type.
   * This function acts as a dispatcher to the specific report query functions.
   */
  static async executeReport(reportType: string, params: QueryParameters): Promise<QueryResult> {
    switch (reportType) {
      case 'demographics':
        return this.getCurrentDemographics(params);
      case 'custom_fields':
        return this.getCustomFields(params);
      case 'status_history':
        return this.getStatusHistory(params);
      case 'pay_history':
        return this.getPayHistory(params);
      case 'position_history':
        return this.getPositionHistory(params);
      case 'tax_information':
        return this.getTaxInformation(params);
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
        };
    }
  }

  /**
   * Helper to get unique values from an array, case-insensitive for strings.
   * @param values Array of values to process.
   * @returns Array of unique string values.
   */
  private static getUniqueValues(values: any[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const value of values) {
      if (value && typeof value === 'string') {
        const lowerCaseValue = value.toLowerCase();
        if (!seen.has(lowerCaseValue)) {
          seen.add(lowerCaseValue);
          unique.push(value);
        }
      } else if (value !== null && value !== undefined) {
        // Handle non-string values by converting to string and checking uniqueness
        const stringValue = String(value);
        if (!seen.has(stringValue)) {
          seen.add(stringValue);
          unique.push(stringValue);
        }
      }
    }
    return unique.sort();
  }

  /**
   * Get filter options for a given customer.
   * This fetches all possible values for departments, positions, etc.,
   * that are present in the customer's data.
   */
  static async getFilterOptions(customerId: string): Promise<FilterOptions> {
    const supabase = await createSupabaseServerClient();
    const [departmentsRes, positionsRes, statusesRes, payTypesRes, statesRes, employeesRes, customFieldsRes] = await Promise.all([
      supabase.rpc('get_unique_departments', { p_customer_id: customerId }),
      supabase.rpc('get_unique_positions', { p_customer_id: customerId }),
      supabase.rpc('get_unique_statuses', { p_customer_id: customerId }),
      supabase.rpc('get_unique_pay_types', { p_customer_id: customerId }),
      supabase.rpc('get_unique_states', { p_customer_id: customerId }),
      supabase.rpc('get_unique_employees', { p_customer_id: customerId }),
      supabase.rpc('get_unique_custom_field_names', { p_customer_id: customerId }),
    ]);

    const departments = departmentsRes.data ? this.getUniqueValues(departmentsRes.data.map((d: { department: string }) => d.department)) : [];
    const positions = positionsRes.data ? this.getUniqueValues(positionsRes.data.map((d: { position: string }) => d.position)) : [];
    const statuses = statusesRes.data ? this.getUniqueValues(statusesRes.data.map((d: { status: string }) => d.status)) : [];
    const payTypes = payTypesRes.data ? this.getUniqueValues(payTypesRes.data.map((d: { pay_type: string }) => d.pay_type)) : [];
    const states = statesRes.data ? this.getUniqueValues(statesRes.data.map((d: { state: string }) => d.state)) : [];
    const employees = employeesRes.data ? employeesRes.data.map((d: { employee_code: string; first_name: string; last_name: string }) => ({
      code: d.employee_code,
      name: `${d.first_name} ${d.last_name}`,
    })).sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)) : [];
    const customFields = customFieldsRes.data ? this.getUniqueValues(customFieldsRes.data.map((d: { field_name: string }) => d.field_name)) : [];

    return {
      departments,
      positions,
      statuses,
      payTypes,
      states,
      employees,
      customFields,
    };
  }

  /**
   * Log query execution details for auditing and performance monitoring.
   */
  static async logQueryExecution(
    reportType: string,
    customerId: string,
    params: QueryParameters,
    result: QueryResult
  ): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('query_log').insert({
      report_type: reportType,
      customer_id: customerId,
      parameters_used: params,
      execution_time: result.execution_time,
      record_count: result.count,
      error_message: result.error,
      executed_at: new Date().toISOString(),
      user_id: result.query_metadata.user_id, // Assuming user_id is passed in query_metadata
    });

    if (error) {
      console.error('Failed to log query execution:', error.message);
    }
  }
}








