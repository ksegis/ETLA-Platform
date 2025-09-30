/**
 * Export Utilities
 * Provides functions for exporting data to various formats
 */

import { TimecardDailySummaryV2 } from '@/services/timecardService'

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export timecard data to CSV with proper formatting
 */
export const exportTimecardToCSV = (data: TimecardDailySummaryV2[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No timecard data to export');
    return;
  }

  const headers = [
    'Employee Name',
    'Employee Ref',
    'Employee ID',
    'Employee Code',
    'Work Date',
    'First Clock In',
    'Mid Clock Out',
    'Mid Clock In',
    'Last Clock Out',
    'Total Hours',
    'Regular Hours',
    'OT Hours',
    'DT Hours',
    'Is Corrected',
    'Corrected By',
    'Corrected At',
    'Correction Reason'
  ];

  const csvRows = [
    headers.join(','),
    ...data.map(row => [
      `"${row.employee_name || ''}"`,
      `"${row.employee_ref || ''}"`,
      `"${row.employee_id || ''}"`,
      `"${row.employee_code || ''}"`,
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
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToExcel = (data: any[], filename: string) => {
  // For now, export as CSV since we don't have xlsx library
  // In production, you would use a library like xlsx or exceljs
  const excelFilename = filename.replace('.xlsx', '.csv');
  exportToCSV(data, excelFilename);
  
  console.warn('Excel export not implemented, exported as CSV instead');
};

/**
 * Export timecard data to Excel format (currently CSV)
 */
export const exportTimecardToExcel = (data: TimecardDailySummaryV2[], filename: string) => {
  const excelFilename = filename.replace('.xlsx', '.csv');
  exportTimecardToCSV(data, excelFilename);
  
  console.warn('Excel export not implemented, exported as CSV instead');
};

export interface ExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
}

export const exportToPDF = (data: any[], filename: string, options?: ExportOptions) => {
  // Mock PDF export - in production, you would use a library like jsPDF or puppeteer
  console.warn('PDF export not implemented, exporting as CSV instead');
  const pdfFilename = filename.replace('.pdf', '.csv');
  exportToCSV(data, pdfFilename);
};

/**
 * Export timecard data to PDF format (currently CSV)
 */
export const exportTimecardToPDF = (data: TimecardDailySummaryV2[], filename: string, options?: ExportOptions) => {
  console.warn('PDF export not implemented, exporting as CSV instead');
  const pdfFilename = filename.replace('.pdf', '.csv');
  exportTimecardToCSV(data, pdfFilename);
};

