/**
 * Export Utilities for ETLA Platform Reporting
 * Handles CSV, XLSX, and other export formats for reporting data
 */

import * as XLSX from 'xlsx';

export interface ExportColumn {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'currency' | 'time';
  format?: string;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  includeTimestamp?: boolean;
  customerName?: string;
  reportTitle?: string;
}

export interface TimecardGridRow {
  workDate: string;
  clockIn?: string;
  clockOut?: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  notes?: string;
}

class ExportUtils {
  /**
   * Export data to CSV format
   */
  exportToCSV<T extends Record<string, any>>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions
  ): void {
    const headers = columns.map(col => col.label);
    const csvContent = [
      // Add header row with report info if provided
      ...(options.reportTitle ? [`"${options.reportTitle}"`] : []),
      ...(options.customerName ? [`"Customer: ${options.customerName}"`] : []),
      ...(options.includeTimestamp ? [`"Generated: ${new Date().toLocaleString()}"`] : []),
      ...(options.reportTitle || options.customerName || options.includeTimestamp ? [''] : []),
      
      // Column headers
      headers.join(','),
      
      // Data rows
      ...data.map(row => 
        columns.map(col => this.formatCellValue(row[col.key], col.type, col.format)).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, `${options.filename}.csv`, 'text/csv');
  }

  /**
   * Export data to Excel (XLSX) format
   */
  exportToXLSX<T extends Record<string, any>>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions
  ): void {
    const workbook = XLSX.utils.book_new();
    const sheetName = options.sheetName || 'Data';

    // Prepare data with headers
    const headers = columns.map(col => col.label);
    const formattedData = data.map(row => 
      columns.map(col => this.formatCellValueForExcel(row[col.key], col.type))
    );

    // Create worksheet data
    const worksheetData = [
      // Add report info if provided
      ...(options.reportTitle ? [[options.reportTitle]] : []),
      ...(options.customerName ? [[`Customer: ${options.customerName}`]] : []),
      ...(options.includeTimestamp ? [[`Generated: ${new Date().toLocaleString()}`]] : []),
      ...(options.reportTitle || options.customerName || options.includeTimestamp ? [[]] : []),
      
      // Headers and data
      headers,
      ...formattedData
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = columns.map(col => ({ wch: this.getColumnWidth(col.type) }));
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadBlob(blob, `${options.filename}.xlsx`);
  }

  /**
   * Export timecard grid data with special formatting
   */
  exportTimecardGrid(
    timecardData: TimecardGridRow[],
    payPeriodInfo: {
      startDate: string;
      endDate: string;
      employeeName: string;
      employeeId: string;
    },
    options: ExportOptions
  ): void {
    const columns: ExportColumn[] = [
      { key: 'workDate', label: 'Work Date', type: 'date' },
      { key: 'clockIn', label: 'Clock In', type: 'time' },
      { key: 'clockOut', label: 'Clock Out', type: 'time' },
      { key: 'regularHours', label: 'Regular Hours', type: 'number', format: '0.00' },
      { key: 'overtimeHours', label: 'Overtime Hours', type: 'number', format: '0.00' },
      { key: 'totalHours', label: 'Total Hours', type: 'number', format: '0.00' },
      { key: 'notes', label: 'Notes', type: 'string' }
    ];

    // Calculate totals
    const totals = timecardData.reduce(
      (acc, row) => ({
        regularHours: acc.regularHours + (row.regularHours || 0),
        overtimeHours: acc.overtimeHours + (row.overtimeHours || 0),
        totalHours: acc.totalHours + (row.totalHours || 0),
      }),
      { regularHours: 0, overtimeHours: 0, totalHours: 0 }
    );

    // Add totals row
    const dataWithTotals = [
      ...timecardData,
      {
        workDate: 'TOTALS',
        clockIn: '',
        clockOut: '',
        regularHours: totals.regularHours,
        overtimeHours: totals.overtimeHours,
        totalHours: totals.totalHours,
        notes: ''
      }
    ];

    const enhancedOptions: ExportOptions = {
      ...options,
      reportTitle: `Timecard Report - ${payPeriodInfo.employeeName}`,
      customerName: options.customerName,
      includeTimestamp: true
    };

    // Export based on format preference
    if (options.filename.endsWith('.xlsx')) {
      this.exportToXLSX(dataWithTotals, columns, enhancedOptions);
    } else {
      this.exportToCSV(dataWithTotals, columns, enhancedOptions);
    }
  }

  /**
   * Export employee documents list
   */
  exportEmployeeDocuments(
    documents: any[],
    employeeInfo: { name: string; id: string },
    options: ExportOptions
  ): void {
    const columns: ExportColumn[] = [
      { key: 'documentName', label: 'Document Name', type: 'string' },
      { key: 'documentType', label: 'Type', type: 'string' },
      { key: 'uploadDate', label: 'Upload Date', type: 'date' },
      { key: 'fileSize', label: 'File Size', type: 'string' },
      { key: 'uploadedBy', label: 'Uploaded By', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' }
    ];

    const enhancedOptions: ExportOptions = {
      ...options,
      reportTitle: `Employee Documents - ${employeeInfo.name}`,
      includeTimestamp: true
    };

    this.exportToCSV(documents, columns, enhancedOptions);
  }

  /**
   * Format cell value based on type
   */
  private formatCellValue(value: any, type?: string, format?: string): string {
    if (value === null || value === undefined) {
      return '""';
    }

    switch (type) {
      case 'currency':
        return `"$${Number(value).toFixed(2)}"`;
      case 'number':
        if (format) {
          const decimals = format.includes('.') ? format.split('.')[1].length : 0;
          return `"${Number(value).toFixed(decimals)}"`;
        }
        return `"${Number(value)}"`;
      case 'date':
        return `"${new Date(value).toLocaleDateString()}"`;
      case 'time':
        if (!value) return '""';
        return `"${value}"`;
      default:
        return `"${String(value).replace(/"/g, '""')}"`;
    }
  }

  /**
   * Format cell value for Excel
   */
  private formatCellValueForExcel(value: any, type?: string): any {
    if (value === null || value === undefined) {
      return '';
    }

    switch (type) {
      case 'currency':
      case 'number':
        return Number(value);
      case 'date':
        return new Date(value);
      default:
        return String(value);
    }
  }

  /**
   * Get appropriate column width for Excel
   */
  private getColumnWidth(type?: string): number {
    switch (type) {
      case 'date':
        return 12;
      case 'time':
        return 10;
      case 'currency':
      case 'number':
        return 12;
      default:
        return 20;
    }
  }

  /**
   * Download file with given content
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  /**
   * Download blob as file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(baseName: string, extension: string = 'csv'): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    return `${baseName}_${timestamp}.${extension}`;
  }

  /**
   * Validate export data
   */
  validateExportData<T extends object>(data: T[], columns: ExportColumn[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || data.length === 0) {
      errors.push('No data to export');
    }

    if (!columns || columns.length === 0) {
      errors.push('No columns defined for export');
    }

    // Check if all column keys exist in data
    if (data.length > 0 && columns.length > 0) {
      const sampleRow = data[0];
      const missingKeys = columns
        .map(col => col.key)
        .filter(key => !(key in sampleRow));
      
      if (missingKeys.length > 0) {
        errors.push(`Missing data keys: ${missingKeys.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const exportUtils = new ExportUtils();

// Export utility functions
export const {
  exportToCSV,
  exportToXLSX,
  exportTimecardGrid,
  exportEmployeeDocuments,
  generateFilename,
  validateExportData
} = exportUtils;

export default exportUtils;
