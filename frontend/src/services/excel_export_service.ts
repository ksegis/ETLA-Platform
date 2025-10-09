import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

interface ExportConfig {
  reportType: string
  customerId: string
  dateRange: {
    from: string
    to: string
  }
  includeHistorical: boolean
  filters: {
    activeOnly: boolean
    includeTerminated: boolean
    departments: string[]
    positions: string[]
  }
  options: {
    includeSensitive: boolean
    includeCalculated: boolean
    addValidation: boolean
  }
}

interface ColumnDefinition {
  key: string
  header: string
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage'
  width?: number
  format?: string
}

// Excel template column definitions matching the original spreadsheet structure
const TEMPLATE_COLUMNS = {
  demographics: [
    { key: 'effective_date', header: 'Effective Date', type: 'date', width: 12 },
    { key: 'employee_code', header: 'Employee Code', type: 'text', width: 15 },
    { key: 'ssn', header: 'SSN', type: 'text', width: 12 },
    { key: 'first_name', header: 'First Name', type: 'text', width: 15 },
    { key: 'middle_name', header: 'Middle Name', type: 'text', width: 15 },
    { key: 'last_name', header: 'Last Name', type: 'text', width: 15 },
    { key: 'address_1', header: 'Address 1', type: 'text', width: 25 },
    { key: 'address_2', header: 'Address 2', type: 'text', width: 25 },
    { key: 'city', header: 'City', type: 'text', width: 15 },
    { key: 'state', header: 'State', type: 'text', width: 10 },
    { key: 'zip_code', header: 'Zip Code', type: 'text', width: 10 },
    { key: 'work_phone', header: 'Work Phone', type: 'text', width: 15 },
    { key: 'personal_phone', header: 'Personal Phone', type: 'text', width: 15 },
    { key: 'work_email', header: 'Work Email', type: 'text', width: 25 },
    { key: 'personal_email', header: 'Personal Email', type: 'text', width: 25 },
    { key: 'gender', header: 'Gender', type: 'text', width: 10 },
    { key: 'marital_status', header: 'Marital Status', type: 'text', width: 15 },
    { key: 'birth_date', header: 'Birth Date', type: 'date', width: 12 },
    { key: 'ethnic_background', header: 'Ethnic Background', type: 'text', width: 20 },
    { key: 'employee_status', header: 'Employee Status', type: 'text', width: 15 },
    { key: 'hire_date', header: 'Hire Date', type: 'date', width: 12 },
    { key: 'termination_date', header: 'Termination Date', type: 'date', width: 15 },
    { key: 'rehire_date', header: 'Rehire Date', type: 'date', width: 12 },
    { key: 'position', header: 'Position', type: 'text', width: 20 },
    { key: 'eeoc_class', header: 'EEOC Class', type: 'text', width: 15 },
    { key: 'home_department', header: 'Home Department', type: 'text', width: 20 },
    { key: 'labor_allocation', header: 'Labor Allocation', type: 'text', width: 20 },
    { key: 'pay_type', header: 'Pay Type', type: 'text', width: 12 },
    { key: 'pay_frequency', header: 'Pay Frequency', type: 'text', width: 15 },
    { key: 'pay_period_salary', header: 'Pay Period Salary', type: 'currency', width: 15 },
    { key: 'hourly_rate', header: 'Hourly Rate', type: 'currency', width: 12 },
    { key: 'workers_compensation_code', header: 'Workers Comp Code', type: 'text', width: 18 },
    { key: 'employment_status', header: 'Employment Status', type: 'text', width: 15 },
    { key: 'employment_type', header: 'Employment Type', type: 'text', width: 15 },
    { key: 'work_location', header: 'Work Location', type: 'text', width: 20 }
  ] as ColumnDefinition[],

  custom_fields: [
    { key: 'effective_date', header: 'Effective Date', type: 'date', width: 12 },
    { key: 'employee_code', header: 'Employee Code', type: 'text', width: 15 },
    { key: 'employee_name', header: 'Employee Name', type: 'text', width: 25 },
    { key: 'field_name', header: 'Custom Field Name', type: 'text', width: 25 },
    { key: 'field_value', header: 'Custom Field Value', type: 'text', width: 30 }
  ] as ColumnDefinition[],

  status_history: [
    { key: 'effective_date', header: 'Effective Date', type: 'date', width: 12 },
    { key: 'employee_code', header: 'Employee Code', type: 'text', width: 15 },
    { key: 'employee_name', header: 'Employee Name', type: 'text', width: 25 },
    { key: 'status', header: 'Status', type: 'text', width: 15 },
    { key: 'termination_type', header: 'Termination Type', type: 'text', width: 20 },
    { key: 'termination_reason', header: 'Termination Reason', type: 'text', width: 30 }
  ] as ColumnDefinition[],

  pay_history: [
    { key: 'effective_date', header: 'Effective Date', type: 'date', width: 12 },
    { key: 'employee_code', header: 'Employee Code', type: 'text', width: 15 },
    { key: 'employee_name', header: 'Employee Name', type: 'text', width: 25 },
    { key: 'change_reason', header: 'Change Reason', type: 'text', width: 25 },
    { key: 'pay_type', header: 'Pay Type', type: 'text', width: 12 },
    { key: 'pay_frequency', header: 'Pay Frequency', type: 'text', width: 15 },
    { key: 'new_hourly_rate', header: 'New Hourly Rate', type: 'currency', width: 15 },
    { key: 'new_salary_rate', header: 'New Salary Rate', type: 'currency', width: 15 },
    { key: 'amount_change', header: 'Amount Change', type: 'currency', width: 15 },
    { key: 'percentage_change', header: 'Percentage Change', type: 'percentage', width: 15 }
  ] as ColumnDefinition[],

  position_history: [
    { key: 'effective_date', header: 'Effective Date', type: 'date', width: 12 },
    { key: 'employee_code', header: 'Employee Code', type: 'text', width: 15 },
    { key: 'employee_name', header: 'Employee Name', type: 'text', width: 25 },
    { key: 'department', header: 'Department', type: 'text', width: 20 },
    { key: 'labor_allocation', header: 'Labor Allocation', type: 'text', width: 20 },
    { key: 'work_location', header: 'Work Location', type: 'text', width: 20 },
    { key: 'position', header: 'Position', type: 'text', width: 20 },
    { key: 'position_level', header: 'Position Level', type: 'text', width: 15 },
    { key: 'position_family', header: 'Position Family', type: 'text', width: 20 },
    { key: 'eeoc_class', header: 'EEOC Class', type: 'text', width: 15 },
    { key: 'workers_compensation_code', header: 'Workers Comp Code', type: 'text', width: 18 },
    { key: 'dol_status', header: 'DOL Status', type: 'text', width: 15 },
    { key: 'exempt_status', header: 'Exempt Status', type: 'text', width: 15 }
  ] as ColumnDefinition[],

  tax_information: [
    { key: 'effective_date', header: 'Effective Date', type: 'date', width: 12 },
    { key: 'employee_code', header: 'Employee Code', type: 'text', width: 15 },
    { key: 'employee_name', header: 'Employee Name', type: 'text', width: 25 },
    { key: 'work_location', header: 'Work Location', type: 'text', width: 20 },
    { key: 'lives_in_state', header: 'Lives In State', type: 'text', width: 15 },
    { key: 'works_in_state', header: 'Works In State', type: 'text', width: 15 },
    { key: 'sui_agency', header: 'SUI Agency', type: 'text', width: 20 },
    { key: 'employee_local_tax_agency_1', header: 'Employee Local Tax Agency 1', type: 'text', width: 25 },
    { key: 'employee_local_tax_agency_2', header: 'Employee Local Tax Agency 2', type: 'text', width: 25 },
    { key: 'employee_local_tax_agency_3', header: 'Employee Local Tax Agency 3', type: 'text', width: 25 },
    { key: 'federal_filing_status', header: 'Federal Filing Status', type: 'text', width: 20 },
    { key: 'federal_allowances', header: 'Federal Allowances', type: 'number', width: 15 },
    { key: 'federal_additional_withholding', header: 'Federal Additional Withholding', type: 'currency', width: 25 },
    { key: 'state_1_code', header: 'State 1 Code', type: 'text', width: 12 },
    { key: 'state_1_filing_status', header: 'State 1 Filing Status', type: 'text', width: 20 },
    { key: 'state_1_allowances', header: 'State 1 Allowances', type: 'number', width: 15 },
    { key: 'state_1_additional_withholding', header: 'State 1 Additional Withholding', type: 'currency', width: 25 },
    { key: 'state_2_code', header: 'State 2 Code', type: 'text', width: 12 },
    { key: 'state_2_filing_status', header: 'State 2 Filing Status', type: 'text', width: 20 },
    { key: 'state_2_allowances', header: 'State 2 Allowances', type: 'number', width: 15 },
    { key: 'state_2_additional_withholding', header: 'State 2 Additional Withholding', type: 'currency', width: 25 },
    { key: 'local_1_code', header: 'Local 1 Code', type: 'text', width: 15 },
    { key: 'local_1_filing_status', header: 'Local 1 Filing Status', type: 'text', width: 20 },
    { key: 'local_1_allowances', header: 'Local 1 Allowances', type: 'number', width: 15 },
    { key: 'local_1_additional_withholding', header: 'Local 1 Additional Withholding', type: 'currency', width: 25 },
    { key: 'local_2_code', header: 'Local 2 Code', type: 'text', width: 15 }
  ] as ColumnDefinition[]
}

export class ExcelExportService {
  
  static async generateReport(config: ExportConfig): Promise<Blob> {
    try {
      // Get data from database with customer isolation
      const data = await this.fetchReportData(config)
      
      // Get column definitions for the report type
      const columns = TEMPLATE_COLUMNS[config.reportType as keyof typeof TEMPLATE_COLUMNS]
      if (!columns) {
        throw new Error(`Unknown report type: ${config.reportType}`)
      }

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = this.createWorksheet(data, columns, config)
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, this.getSheetName(config.reportType))
      
      // Apply formatting and styling
      this.applyFormatting(worksheet, columns, data.length)
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true
      })
      
      return new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
    } catch (error) {
      console.error('Error generating Excel report:', error)
      throw error
    }
  }

  private static async fetchReportData(config: ExportConfig): Promise<any[]> {
    const tableName = this.getTableName(config.reportType)
    
    let query = supabase
      .from(tableName)
      .select('*')
      .eq('customer_id', config.customerId)

    // Apply date range filters
    if (config.includeHistorical && config.dateRange.from && config.dateRange.to) {
      query = query
        .gte('effective_date', config.dateRange.from)
        .lte('effective_date', config.dateRange.to)
    }

    // Apply status filters
    if (config.filters.activeOnly && config.reportType === 'demographics') {
      query = query.eq('employee_status', 'Active')
    }

    if (!config.filters.includeTerminated && config.reportType === 'demographics') {
      query = query.neq('employee_status', 'Terminated')
    }

    // Apply department filters
    if (config.filters.departments.length > 0) {
      query = query.in('home_department', config.filters.departments)
    }

    // Apply position filters
    if (config.filters.positions.length > 0) {
      query = query.in('position', config.filters.positions)
    }

    const { data, error } = await query.order('effective_date', { ascending: false })

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    return data || []
  }

  private static createWorksheet(data: any[], columns: ColumnDefinition[], config: ExportConfig): XLSX.WorkSheet {
    // Create header row
    const headers = columns.map(col => col.header)
    
    // Prepare data rows
    const rows = data.map(row => {
      return columns.map(col => {
        let value = row[col.key]
        
        // Handle sensitive data masking
        if (!config.options.includeSensitive && col.key === 'ssn' && value) {
          value = 'XXX-XX-' + value.slice(-4)
        }
        
        // Apply calculated fields
        if (config.options.includeCalculated) {
          value = this.applyCalculations(col.key, value, row)
        }
        
        // Format values based on column type
        return this.formatValue(value, col.type)
      })
    })

    // Combine headers and data
    const worksheetData = [headers, ...rows]
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    
    // Set column widths
    const columnWidths = columns.map(col => ({ wch: col.width || 15 }))
    worksheet['!cols'] = columnWidths
    
    return worksheet
  }

  private static applyFormatting(worksheet: XLSX.WorkSheet, columns: ColumnDefinition[], dataRowCount: number): void {
    // Apply header formatting
    const headerRange = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: columns.length - 1, r: 0 } })
    
    // Apply data validation if requested
    // This would include dropdown lists for status fields, date validation, etc.
    
    // Apply conditional formatting for different data types
    columns.forEach((col, colIndex) => {
      for (let rowIndex = 1; rowIndex <= dataRowCount; rowIndex++) {
        const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex })
        const cell = worksheet[cellAddress]
        
        if (cell) {
          switch (col.type) {
            case 'currency':
              cell.z = '$#,##0.00'
              break
            case 'percentage':
              cell.z = '0.00%'
              break
            case 'date':
              cell.z = 'mm/dd/yyyy'
              break
            case 'number':
              cell.z = '#,##0'
              break
          }
        }
      }
    })
  }

  private static formatValue(value: any, type: string): any {
    if (value === null || value === undefined) {
      return ''
    }

    switch (type) {
      case 'date':
        return value instanceof Date ? value : new Date(value)
      case 'currency':
      case 'number':
        return typeof value === 'string' ? parseFloat(value) || 0 : value
      case 'percentage':
        return typeof value === 'string' ? parseFloat(value) / 100 || 0 : value / 100
      default:
        return value.toString()
    }
  }

  private static applyCalculations(key: string, value: any, row: any): any {
    // Apply calculated fields based on the key
    switch (key) {
      case 'percentage_change':
        if (row.amount_change && row.previous_rate) {
          return (row.amount_change / row.previous_rate) * 100
        }
        break
      case 'new_annual_amount':
        if (row.new_salary_rate) {
          return row.new_salary_rate
        } else if (row.new_hourly_rate && row.pay_frequency) {
          // Calculate annual amount based on hourly rate and frequency
          const hoursPerYear = this.getAnnualHours(row.pay_frequency)
          return row.new_hourly_rate * hoursPerYear
        }
        break
    }
    
    return value
  }

  private static getAnnualHours(payFrequency: string): number {
    switch (payFrequency?.toLowerCase()) {
      case 'weekly': return 2080 // 40 hours * 52 weeks
      case 'biweekly': return 2080
      case 'semimonthly': return 2080
      case 'monthly': return 2080
      default: return 2080
    }
  }

  private static getTableName(reportType: string): string {
    const tableMap: { [key: string]: string } = {
      'demographics': 'employee_demographics',
      'custom_fields': 'employee_custom_fields',
      'status_history': 'employee_status_history',
      'pay_history': 'employee_pay_history',
      'position_history': 'employee_position_history',
      'tax_information': 'employee_tax_information'
    }
    
    return tableMap[reportType] || reportType
  }

  private static getSheetName(reportType: string): string {
    const sheetNames: { [key: string]: string } = {
      'demographics': 'Current Demographic Data',
      'custom_fields': 'Current Custom Fields - if appl',
      'status_history': 'Status History',
      'pay_history': 'Pay History',
      'position_history': 'Position History',
      'tax_information': 'Taxes'
    }
    
    return sheetNames[reportType] || reportType
  }

  static async logExportActivity(config: ExportConfig, success: boolean, error?: string): Promise<void> {
    try {
      await supabase
        .from('data_import_audit')
        .insert({
          customer_id: config.customerId,
          import_type: `export_${config.reportType}`,
          import_status: success ? 'completed' : 'failed',
          error_summary: error,
          notes: `Excel export: ${config.reportType} report`
        })
    } catch (auditError) {
      console.error('Error logging export activity:', auditError)
    }
  }
}

