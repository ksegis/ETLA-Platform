import { supabase } from '@/lib/supabase'

// Interface for the v2 view data structure
export interface TimecardDailySummaryV2 {
  tenant_id: string
  employee_ref: string
  employee_name: string
  work_date: string
  first_clock_in: string | null
  mid_clock_out: string | null
  mid_clock_in: string | null
  last_clock_out: string | null
  total_hours: number
  regular_hours: number
  ot_hours: number
  dt_hours: number
  is_corrected: boolean
  corrected_by: string | null
  corrected_at: string | null
  correction_reason: string | null
  employee_id?: string
  employee_code?: string
}

// Interface for correction data
export interface TimecardCorrectionData {
  override_first_clock_in?: string | null
  override_mid_clock_out?: string | null
  override_mid_clock_in?: string | null
  override_last_clock_out?: string | null
  override_total_hours?: number | null
  override_regular_hours?: number | null
  override_ot_hours?: number | null
  override_dt_hours?: number | null
  correction_reason: string
  corrected_by: string
}

// Interface for filters
export interface TimecardFilters {
  tenant_id: string
  start_date: string
  end_date: string
  employee_id?: string
  employee_ref?: string
  employee_code?: string
}

class TimecardService {
  // Get daily summaries from v_timecard_daily_effective_v2
  async getDailySummaries(filters: TimecardFilters): Promise<TimecardDailySummaryV2[]> {
    try {
      let query = supabase
        .from('v_timecard_daily_effective_v2')
        .select('*')
        .eq('tenant_id', filters.tenant_id)
        .gte('work_date', filters.start_date)
        .lte('work_date', filters.end_date)
        .order('work_date', { ascending: false })
        .order('employee_name', { ascending: true })

      // Apply optional filters
      if (filters.employee_id) {
        query = query.eq('employee_id', filters.employee_id)
      }
      if (filters.employee_ref) {
        query = query.eq('employee_ref', filters.employee_ref)
      }
      if (filters.employee_code) {
        query = query.eq('employee_code', filters.employee_code)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching daily summaries:', error)
        throw new Error('Failed to fetch timecard daily summaries')
      }

      return data || []
    } catch (error) {
      console.error('Error in getDailySummaries:', error)
      throw error
    }
  }

  // Apply correction to timecard_daily table
  async correctDailySummary(
    tenant_id: string,
    employee_ref: string,
    work_date: string,
    correctionData: TimecardCorrectionData
  ): Promise<void> {
    try {
      const updateData = {
        ...correctionData,
        corrected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('timecard_daily')
        .update(updateData)
        .eq('tenant_id', tenant_id)
        .eq('employee_ref', employee_ref)
        .eq('work_date', work_date)

      if (error) {
        console.error('Error applying correction:', error)
        throw new Error('Failed to apply timecard correction')
      }
    } catch (error) {
      console.error('Error in correctDailySummary:', error)
      throw error
    }
  }

  // Recalculate timecard summaries for a date range
  async recalculateTimecardDailyRange(
    tenant_id: string,
    start_date: string,
    end_date: string
  ): Promise<void> {
    try {
      // Call the stored procedure or function to recalculate
      const { error } = await supabase.rpc('recalculate_timecard_daily_range', {
        p_tenant_id: tenant_id,
        p_start_date: start_date,
        p_end_date: end_date
      })

      if (error) {
        console.error('Error recalculating timecard summaries:', error)
        throw new Error('Failed to recalculate timecard summaries')
      }
    } catch (error) {
      console.error('Error in recalculateTimecardDailyRange:', error)
      throw error
    }
  }

  // Get tenants for host admin dropdown
  async getTenants(): Promise<Array<{ id: string; name: string; legal_name: string }>> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, legal_name')
        .eq('is_active', true)
        .order('legal_name')

      if (error) {
        console.error('Error fetching tenants:', error)
        throw new Error('Failed to fetch tenants')
      }

      return data || []
    } catch (error) {
      console.error('Error in getTenants:', error)
      throw error
    }
  }

  // Get employees for filter dropdown
  async getEmployees(tenant_id: string): Promise<Array<{
    employee_ref: string
    employee_name: string
    employee_id?: string
    employee_code?: string
  }>> {
    try {
      const { data, error } = await supabase
        .from('v_timecard_daily_effective_v2')
        .select('employee_ref, employee_name, employee_id, employee_code')
        .eq('tenant_id', tenant_id)

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
    } catch (error) {
      console.error('Error in getEmployees:', error)
      throw error
    }
  }

  // Get audit history for a specific record
  async getAuditHistory(
    tenant_id: string,
    employee_ref: string,
    work_date: string
  ): Promise<Array<{
    corrected_by: string
    corrected_at: string
    correction_reason: string | null
    changes: Record<string, any>
  }>> {
    try {
      // This would typically query an audit log table
      // For now, we'll return the current correction info from the view
      const { data, error } = await supabase
        .from('v_timecard_daily_effective_v2')
        .select('corrected_by, corrected_at, correction_reason')
        .eq('tenant_id', tenant_id)
        .eq('employee_ref', employee_ref)
        .eq('work_date', work_date)
        .eq('is_corrected', true)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching audit history:', error)
        throw new Error('Failed to fetch audit history')
      }

      if (!data) {
        return []
      }

      return [{
        corrected_by: data.corrected_by || 'Unknown',
        corrected_at: data.corrected_at || new Date().toISOString(),
        correction_reason: data.correction_reason,
        changes: {} // Would contain specific field changes in a full audit system
      }]
    } catch (error) {
      console.error('Error in getAuditHistory:', error)
      throw error
    }
  }

  // Export data to CSV format
  async exportToCSV(filters: TimecardFilters): Promise<string> {
    try {
      const data = await this.getDailySummaries(filters)
      
      const headers = [
        'Employee Name',
        'Employee Ref',
        'Work Date',
        'Clock In',
        'Clock Out',
        'Clock In',
        'Clock Out',
        'Total Hours',
        'Regular Hours',
        'OT Hours',
        'DT Hours',
        'Is Corrected',
        'Corrected By',
        'Corrected At',
        'Correction Reason'
      ]

      const csvRows = [
        headers.join(','),
        ...data.map(row => [
          `"${row.employee_name || ''}"`,
          `"${row.employee_ref || ''}"`,
          `"${row.work_date || ''}"`,
          `"${row.first_clock_in || ''}"`,
          `"${row.mid_clock_out || ''}"`,
          `"${row.mid_clock_in || ''}"`,
          `"${row.last_clock_out || ''}"`,
          row.total_hours?.toFixed(2) || '0.00',
          row.regular_hours?.toFixed(2) || '0.00',
          row.ot_hours?.toFixed(2) || '0.00',
          row.dt_hours?.toFixed(2) || '0.00',
          row.is_corrected ? 'Yes' : 'No',
          `"${row.corrected_by || ''}"`,
          `"${row.corrected_at || ''}"`,
          `"${row.correction_reason || ''}"`
        ].join(','))
      ]

      return csvRows.join('\n')
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      throw error
    }
  }

  // Export data to Excel format (returns data for client-side Excel generation)
  async exportToExcel(filters: TimecardFilters): Promise<TimecardDailySummaryV2[]> {
    try {
      return await this.getDailySummaries(filters)
    } catch (error) {
      console.error('Error preparing Excel export:', error)
      throw error
    }
  }
}

// Export singleton instance
export const timecardService = new TimecardService()
export default timecardService

