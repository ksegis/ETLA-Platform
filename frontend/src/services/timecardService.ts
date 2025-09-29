import { supabase } from "@/lib/supabase"

export interface TimecardDailySummary {
  tenant_id: string
  employee_ref: string
  employee_name: string
  employee_code: string
  work_date: string
  first_clock_in: string | null
  last_clock_out: string | null
  regular_hours: number
  ot_hours: number
  dt_hours: number
  total_hours: number
  is_corrected: boolean
  corrected_by?: string
  corrected_at?: string
  correction_reason?: string
}

export interface TimecardDailyRecord {
  tenant_id: string
  employee_ref: string
  work_date: string
  first_clock_in: string | null
  last_clock_out: string | null
  total_hours: number
  regular_hours: number
  ot_hours: number
  dt_hours: number
  override_first_clock_in?: string | null
  override_last_clock_out?: string | null
  override_total_hours?: number | null
  override_regular_hours?: number | null
  override_ot_hours?: number | null
  override_dt_hours?: number | null
  corrected_by?: string | null
  corrected_at?: string | null
  correction_reason?: string | null
}

export interface CorrectionData {
  override_first_clock_in?: string | null
  override_last_clock_out?: string | null
  override_total_hours?: number | null
  override_regular_hours?: number | null
  override_ot_hours?: number | null
  override_dt_hours?: number | null
  correction_reason: string
}

export interface TimecardDailyAudit {
  id: string
  tenant_id: string
  employee_ref: string
  work_date: string
  before_values: Record<string, any>
  after_values: Record<string, any>
  changed_by: string
  changed_at: string
  change_reason: string
}

export interface GetDailySummariesParams {
  tenant_id: string
  start_date: string
  end_date: string
  employee_ref?: string
}

class TimecardService {
  private supabaseClient = supabase

  // Get daily summaries from the effective view
  async getDailySummaries(params: GetDailySummariesParams): Promise<TimecardDailySummary[]> {
    let query = this.supabaseClient
      .from('v_timecard_daily_effective')
      .select('*')
      .eq('tenant_id', params.tenant_id)
      .gte('work_date', params.start_date)
      .lte('work_date', params.end_date)
      .order('work_date', { ascending: false })
      .order('employee_name', { ascending: true })

    if (params.employee_ref) {
      query = query.eq('employee_ref', params.employee_ref)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching daily summaries:', error)
      throw new Error('Failed to fetch timecard daily summaries')
    }

    return data || []
  }

  // Get a single daily record for correction (from the base table, not the view)
  async getDailyRecord(tenant_id: string, employee_ref: string, work_date: string): Promise<TimecardDailyRecord | null> {
    const { data, error } = await this.supabaseClient
      .from('timecard_daily')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('employee_ref', employee_ref)
      .eq('work_date', work_date)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found
        return null
      }
      console.error('Error fetching daily record:', error)
      throw new Error('Failed to fetch timecard daily record')
    }

    return data
  }

  // Correct a daily summary
  async correctDailySummary(
    tenant_id: string,
    employee_ref: string,
    work_date: string,
    correctionData: CorrectionData,
    user_id: string
  ): Promise<void> {
    // First, get the current record to capture before_values
    const currentRecord = await this.getDailyRecord(tenant_id, employee_ref, work_date)
    
    if (!currentRecord) {
      throw new Error('Timecard daily record not found')
    }

    // Prepare the update data
    const updateData = {
      ...correctionData,
      corrected_by: user_id,
      corrected_at: new Date().toISOString()
    }

    // Update the timecard_daily record
    const { error: updateError } = await this.supabaseClient
      .from('timecard_daily')
      .update(updateData)
      .eq('tenant_id', tenant_id)
      .eq('employee_ref', employee_ref)
      .eq('work_date', work_date)

    if (updateError) {
      console.error('Error updating daily record:', updateError)
      throw new Error('Failed to update timecard daily record')
    }

    // Create audit record
    const auditData: Omit<TimecardDailyAudit, 'id'> = {
      tenant_id,
      employee_ref,
      work_date,
      before_values: {
        override_first_clock_in: currentRecord.override_first_clock_in,
        override_last_clock_out: currentRecord.override_last_clock_out,
        override_total_hours: currentRecord.override_total_hours,
        override_regular_hours: currentRecord.override_regular_hours,
        override_ot_hours: currentRecord.override_ot_hours,
        override_dt_hours: currentRecord.override_dt_hours,
        corrected_by: currentRecord.corrected_by,
        corrected_at: currentRecord.corrected_at,
        correction_reason: currentRecord.correction_reason
      },
      after_values: updateData,
      changed_by: user_id,
      changed_at: new Date().toISOString(),
      change_reason: correctionData.correction_reason
    }

    const { error: auditError } = await this.supabaseClient
      .from('timecard_daily_audit')
      .insert(auditData)

    if (auditError) {
      console.error('Error creating audit record:', auditError)
      // Don't throw here as the main update succeeded
      // But log the error for investigation
    }
  }

  // Recalculate timecard daily range (admin function)
  async recalculateTimecardDailyRange(
    tenant_id: string,
    start_date: string,
    end_date: string
  ): Promise<void> {
    const { error } = await this.supabaseClient
      .rpc('recalc_timecard_daily_range', {
        tenant_id,
        start_date,
        end_date
      })

    if (error) {
      console.error('Error recalculating timecard daily range:', error)
      throw new Error('Failed to recalculate timecard daily summaries')
    }
  }

  // Get employees for filtering (helper method)
  async getEmployees(tenant_id: string): Promise<Array<{
    employee_ref: string
    employee_name: string
    employee_code: string
  }>> {
    const { data, error } = await this.supabaseClient
      .from('v_timecard_daily_effective')
      .select('employee_ref, employee_name, employee_code')
      .eq('tenant_id', tenant_id)
      .order('employee_name')

    if (error) {
      console.error('Error fetching employees:', error)
      throw new Error('Failed to fetch employees')
    }

    // Remove duplicates
    const uniqueEmployees = new Map()
    data?.forEach((emp: any) => {
      if (!uniqueEmployees.has(emp.employee_ref)) {
        uniqueEmployees.set(emp.employee_ref, emp)
      }
    })

    return Array.from(uniqueEmployees.values())
  }

  // Get audit history for a specific record
  async getAuditHistory(
    tenant_id: string,
    employee_ref: string,
    work_date: string
  ): Promise<TimecardDailyAudit[]> {
    const { data, error } = await this.supabaseClient
      .from('timecard_daily_audit')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('employee_ref', employee_ref)
      .eq('work_date', work_date)
      .order('changed_at', { ascending: false })

    if (error) {
      console.error('Error fetching audit history:', error)
      throw new Error('Failed to fetch audit history')
    }

    return data || []
  }

  // Search employees by name, code, or ID
  async searchEmployees(
    tenant_id: string,
    searchTerm: string
  ): Promise<Array<{
    employee_ref: string
    employee_name: string
    employee_code: string
  }>> {
    const { data, error } = await this.supabaseClient
      .from('v_timecard_daily_effective')
      .select('employee_ref, employee_name, employee_code')
      .eq('tenant_id', tenant_id)
      .or(`employee_name.ilike.%${searchTerm}%,employee_code.ilike.%${searchTerm}%,employee_ref.ilike.%${searchTerm}%`)
      .order('employee_name')
      .limit(50)

    if (error) {
      console.error('Error searching employees:', error)
      throw new Error('Failed to search employees')
    }

    // Remove duplicates
    const uniqueEmployees = new Map()
    data?.forEach((emp: any) => {
      if (!uniqueEmployees.has(emp.employee_ref)) {
        uniqueEmployees.set(emp.employee_ref, emp)
      }
    })

    return Array.from(uniqueEmployees.values())
  }

  // Get tenants (for host_admin users)
  async getTenants(): Promise<Array<{
    id: string
    name: string
    legal_name: string
  }>> {
    const { data, error } = await this.supabaseClient
      .from('tenants')
      .select('id, name, legal_name')
      .order('name')

    if (error) {
      console.error('Error fetching tenants:', error)
      throw new Error('Failed to fetch tenants')
    }

    return data || []
  }
}

export const timecardService = new TimecardService()
