// Enhanced Export utilities for CSV, Excel, PDF, and JSON functionality

export interface ExportColumn<T extends object> {
  key: keyof T;
  title: string;
  width?: number;
  formatter?: (value: any) => string;
  type?: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
  includeHeaders?: boolean;
  dateFormat?: string;
  currencySymbol?: string;
  locale?: string;
  customHeaders?: Record<string, string>;
  filters?: Record<string, any>;
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    company?: string;
    exportDate?: string;
    totalRecords?: number;
  };
}

export interface BulkExportOptions extends ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  compression?: boolean;
  splitByCategory?: boolean;
  maxRecordsPerFile?: number;
}

export interface ExportProgress {
  current: number;
  total: number;
  percentage: number;
  status: 'preparing' | 'processing' | 'finalizing' | 'complete' | 'error';
  message?: string;
}

// Enhanced CSV Export Function with advanced formatting
export function exportToCSV<T extends object>(
  data: T[],
  filename?: string,
  options: ExportOptions = {},
  columns?: ExportColumn<T>[]
): void {
  if (!data || data.length === 0) {
    console.warn('No data provided for CSV export');
    return;
  }

  const {
    includeTimestamp = true,
    includeHeaders = true,
    dateFormat = 'YYYY-MM-DD',
    currencySymbol = '$',
    locale = 'en-US',
    customHeaders = {},
    metadata
  } = options;

  const finalFilename = filename || generateExportFilename('export', 'csv', includeTimestamp);
  
  // Determine columns to export
  const exportColumns = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    title: customHeaders[key] || key,
    type: 'string' as const
  }));

  // Format data according to column specifications
  const formattedData = data.map(row => {
    const formattedRow: Record<string, any> = {};
    exportColumns.forEach(col => {
      const value = (row as any)[col.key];
      formattedRow[col.title] = formatValueForExport(value, col, { dateFormat, currencySymbol, locale });
    });
    return formattedRow;
  });

  // Create CSV content
  const csvLines: string[] = [];

  // Add metadata as comments if provided
  if (metadata) {
    if (metadata.title) csvLines.push(`# ${metadata.title}`);
    if (metadata.description) csvLines.push(`# ${metadata.description}`);
    if (metadata.company) csvLines.push(`# Company: ${metadata.company}`);
    if (metadata.author) csvLines.push(`# Author: ${metadata.author}`);
    csvLines.push(`# Export Date: ${metadata.exportDate || new Date().toISOString()}`);
    if (metadata.totalRecords) csvLines.push(`# Total Records: ${metadata.totalRecords}`);
    csvLines.push(''); // Empty line after metadata
  }

  // Add headers
  if (includeHeaders) {
    const headers = exportColumns.map(col => col.title);
    csvLines.push(headers.join(','));
  }

  // Add data rows
  formattedData.forEach(row => {
    const values = exportColumns.map(col => {
      const value = row[col.title];
      return escapeCsvValue(value);
    });
    csvLines.push(values.join(','));
  });

  const csvContent = csvLines.join('\n');

  // Create and trigger download
  downloadFile(csvContent, finalFilename, 'text/csv;charset=utf-8;');
}

// Enhanced JSON Export Function
export function exportToJSON<T extends object>(
  data: T[],
  filename?: string,
  options: ExportOptions = {},
  columns?: ExportColumn<T>[]
): void {
  if (!data || data.length === 0) {
    console.warn('No data provided for JSON export');
    return;
  }

  const {
    includeTimestamp = true,
    metadata
  } = options;

  const finalFilename = filename || generateExportFilename('export', 'json', includeTimestamp);

  // Prepare export data
  const exportData = columns ? prepareDataForExport(data, columns) : data;

  // Create JSON structure with metadata
  const jsonOutput = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      ...metadata
    },
    data: exportData
  };

  const jsonContent = JSON.stringify(jsonOutput, null, 2);
  downloadFile(jsonContent, finalFilename, 'application/json;charset=utf-8;');
}

// Bulk Export Function for multiple formats
export async function bulkExport<T extends object>(
  data: T[],
  options: BulkExportOptions,
  columns?: ExportColumn<T>[],
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  if (!data || data.length === 0) {
    throw new Error('No data provided for bulk export');
  }

  const {
    format,
    filename = 'bulk_export',
    compression = false,
    splitByCategory = false,
    maxRecordsPerFile = 10000
  } = options;

  // Report progress
  const reportProgress = (current: number, total: number, status: ExportProgress['status'], message?: string) => {
    if (onProgress) {
      onProgress({
        current,
        total,
        percentage: Math.round((current / total) * 100),
        status,
        message
      });
    }
  };

  try {
    reportProgress(0, 100, 'preparing', 'Preparing export...');

    // Split data if needed
    const dataSets = splitByCategory || data.length > maxRecordsPerFile
      ? splitDataForExport(data, maxRecordsPerFile, splitByCategory)
      : [{ name: filename, data }];

    reportProgress(25, 100, 'processing', 'Processing data...');

    // Export each dataset
    for (let i = 0; i < dataSets.length; i++) {
      const dataset = dataSets[i];
      const datasetFilename = dataSets.length > 1 
        ? `${dataset.name}_part_${i + 1}` 
        : dataset.name;

      switch (format) {
        case 'csv':
          exportToCSV(dataset.data, datasetFilename, options, columns);
          break;
        case 'json':
          exportToJSON(dataset.data, datasetFilename, options, columns);
          break;
        case 'excel':
          exportToExcel(dataset.data, datasetFilename, options, columns);
          break;
        case 'pdf':
          await exportToPDF(dataset.data, datasetFilename, options, columns);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      reportProgress(25 + (50 * (i + 1) / dataSets.length), 100, 'processing', 
        `Exported ${i + 1} of ${dataSets.length} files...`);
    }

    reportProgress(90, 100, 'finalizing', 'Finalizing export...');

    // Handle compression if requested
    if (compression && dataSets.length > 1) {
      // Note: In a real implementation, you would zip the files here
      console.log('Compression requested but not implemented in this demo');
    }

    reportProgress(100, 100, 'complete', 'Export completed successfully');

  } catch (error) {
    reportProgress(0, 100, 'error', `Export failed: ${error}`);
    throw error;
  }
}

// PDF Export Function (basic implementation)
export async function exportToPDF<T extends object>(
  data: T[],
  filename?: string,
  options: ExportOptions = {},
  columns?: ExportColumn<T>[]
): Promise<void> {
  if (!data || data.length === 0) {
    console.warn('No data provided for PDF export');
    return;
  }

  const {
    includeTimestamp = true,
    metadata
  } = options;

  const finalFilename = filename || generateExportFilename('export', 'pdf', includeTimestamp);

  // Create HTML table for PDF conversion
  const exportColumns = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    title: key,
    type: 'string' as const
  }));

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${metadata?.title || 'Export Report'}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { margin-bottom: 20px; }
        .metadata { color: #666; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 20px; font-size: 10px; color: #666; }
      </style>
    </head>
    <body>
  `;

  // Add metadata header
  if (metadata) {
    htmlContent += `<div class="header">`;
    if (metadata.title) htmlContent += `<h1>${metadata.title}</h1>`;
    if (metadata.description) htmlContent += `<p>${metadata.description}</p>`;
    htmlContent += `</div>`;

    htmlContent += `<div class="metadata">`;
    if (metadata.company) htmlContent += `<p>Company: ${metadata.company}</p>`;
    if (metadata.author) htmlContent += `<p>Author: ${metadata.author}</p>`;
    htmlContent += `<p>Export Date: ${metadata.exportDate || new Date().toISOString()}</p>`;
    htmlContent += `<p>Total Records: ${data.length}</p>`;
    htmlContent += `</div>`;
  }

  // Add table
  htmlContent += `<table><thead><tr>`;
  exportColumns.forEach(col => {
    htmlContent += `<th>${col.title}</th>`;
  });
  htmlContent += `</tr></thead><tbody>`;

  data.forEach(row => {
    htmlContent += `<tr>`;
    exportColumns.forEach(col => {
      const value = (row as any)[col.key];
      const formattedValue = formatValueForExport(value, col, options);
      htmlContent += `<td>${escapeHtml(formattedValue)}</td>`;
    });
    htmlContent += `</tr>`;
  });

  htmlContent += `</tbody></table>`;
  htmlContent += `<div class="footer">Generated by ETLA Platform on ${new Date().toLocaleString()}</div>`;
  htmlContent += `</body></html>`;

  // Convert HTML to PDF (simplified - in production you'd use a proper PDF library)
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  downloadFile(htmlContent, finalFilename.replace('.pdf', '.html'), 'text/html;charset=utf-8;');
  
  console.log('PDF export: Generated HTML version. For true PDF, integrate a PDF library like jsPDF or Puppeteer.');
}



// Utility function to format data for export
export function prepareDataForExport<T extends object>(
  data: T[],
  columns?: ExportColumn<T>[]
): Record<string, any>[] {
  if (!columns) {
    return data as Record<string, any>[];
  }

  return data.map(item => {
    const exportItem: Record<string, any> = {};
    columns.forEach(col => {
      exportItem[col.title] = (item as any)[col.key];
    });
    return exportItem;
  });
}

// Utility function to validate export data
export function validateExportData<T extends object>(
  data: T[],
  columns?: ExportColumn<T>[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || !Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('Data array is empty');
    return { isValid: false, errors };
  }

  if (columns) {
    const sampleRow = data[0];
    if (!sampleRow || typeof sampleRow !== 'object') {
      errors.push('Data items must be objects');
      return { isValid: false, errors };
    }

    // Check if all specified columns exist in the data
    const missingKeys = columns
      .map(col => col.key)
      .filter(key => !(key in sampleRow));

    if (missingKeys.length > 0) {
      errors.push(`Missing data keys: ${missingKeys.join(', ')}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Utility function to generate filename with timestamp
export function generateExportFilename(
  baseName: string,
  extension: string = 'csv',
  includeTimestamp: boolean = true
): string {
  const timestamp = includeTimestamp 
    ? `_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}`
    : '';
  
  return `${baseName}${timestamp}.${extension}`;
}

// Utility function to sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_');
}

// Specialized export functions
export function exportTimecardGrid(data: TimecardGridRow[], filename?: string): void {
  exportToCSV(data, filename || 'timecard_grid.csv');
}

export function exportEmployeeDocuments(data: any[], filename?: string): void {
  exportToCSV(data, filename || 'employee_documents.csv');
}



// TimecardGridRow interface for timecard exports
export interface TimecardGridRow {
  workDate: string;
  date: string;
  clockIn: string;
  clockOut: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  notes?: string;
}


// Utility Functions

// Format value according to column type and options
export function formatValueForExport<T extends object>(
  value: any,
  column: ExportColumn<T>,
  options: Partial<ExportOptions> = {}
): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Use custom formatter if provided
  if (column.formatter) {
    return column.formatter(value);
  }

  const { dateFormat = 'YYYY-MM-DD', currencySymbol = '$', locale = 'en-US' } = options;

  switch (column.type) {
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString(locale);
      } else if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
      }
      return String(value);

    case 'currency':
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(numValue)) return String(value);
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD'
      }).format(numValue);

    case 'percentage':
      const pctValue = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(pctValue)) return String(value);
      return `${(pctValue * 100).toFixed(2)}%`;

    case 'number':
      const numberValue = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(numberValue)) return String(value);
      return new Intl.NumberFormat(locale).format(numberValue);

    case 'boolean':
      return value ? 'Yes' : 'No';

    default:
      return String(value);
  }
}

// Escape CSV values
export function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

// Escape HTML entities
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Download file utility
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Split data for export
export function splitDataForExport<T extends object>(
  data: T[],
  maxRecordsPerFile: number,
  splitByCategory: boolean = false
): Array<{ name: string; data: T[] }> {
  if (!splitByCategory) {
    // Simple split by record count
    const chunks: Array<{ name: string; data: T[] }> = [];
    for (let i = 0; i < data.length; i += maxRecordsPerFile) {
      chunks.push({
        name: `export_chunk_${Math.floor(i / maxRecordsPerFile) + 1}`,
        data: data.slice(i, i + maxRecordsPerFile)
      });
    }
    return chunks;
  }

  // Split by category (assuming there's a 'category' field)
  const categories = new Map<string, T[]>();
  
  data.forEach(item => {
    const category = (item as any).category || (item as any).type || 'uncategorized';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(item);
  });

  return Array.from(categories.entries()).map(([category, items]) => ({
    name: `export_${category}`,
    data: items
  }));
}

// Enhanced Excel Export Function
export function exportToExcel<T extends object>(
  data: T[],
  filename?: string,
  options: ExportOptions = {},
  columns?: ExportColumn<T>[]
): void {
  if (!data || data.length === 0) {
    console.warn('No data provided for Excel export');
    return;
  }

  const {
    includeTimestamp = true,
    sheetName = 'Sheet1',
    metadata
  } = options;

  const finalFilename = filename || generateExportFilename('export', 'xlsx', includeTimestamp);
  
  // For now, create an enhanced CSV that can be opened in Excel
  // In production, you would use a library like SheetJS (xlsx) for true Excel format
  
  const exportColumns = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    title: key,
    type: 'string' as const
  }));

  // Create tab-separated values for better Excel compatibility
  const tsvLines: string[] = [];

  // Add metadata
  if (metadata) {
    if (metadata.title) tsvLines.push(metadata.title);
    if (metadata.description) tsvLines.push(metadata.description);
    if (metadata.company) tsvLines.push(`Company: ${metadata.company}`);
    tsvLines.push(`Export Date: ${metadata.exportDate || new Date().toISOString()}`);
    tsvLines.push(`Total Records: ${data.length}`);
    tsvLines.push(''); // Empty line
  }

  // Add headers
  const headers = exportColumns.map(col => col.title);
  tsvLines.push(headers.join('\t'));

  // Add data
  data.forEach(row => {
    const values = exportColumns.map(col => {
      const value = (row as any)[col.key];
      const formattedValue = formatValueForExport(value, col, options);
      return formattedValue.replace(/\t/g, ' '); // Replace tabs with spaces
    });
    tsvLines.push(values.join('\t'));
  });

  const tsvContent = tsvLines.join('\n');
  downloadFile(tsvContent, finalFilename.replace('.xlsx', '.tsv'), 'text/tab-separated-values;charset=utf-8;');
  
  console.log('Excel export: Generated TSV version. For true Excel format, integrate SheetJS library.');
}

// Enhanced export utilities object
export const exportUtils = {
  // Core export functions
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportToPDF,
  bulkExport,

  // Utility functions
  formatValueForExport,
  escapeCsvValue,
  escapeHtml,
  downloadFile,
  splitDataForExport,
  prepareDataForExport,
  validateExportData,
  generateExportFilename,
  sanitizeFilename,

  // Specialized export functions
  exportTimecardGrid: (data: TimecardGridRow[], filename?: string) => {
    const columns: ExportColumn<TimecardGridRow>[] = [
      { key: 'workDate', title: 'Work Date', type: 'date' },
      { key: 'clockIn', title: 'Clock In', type: 'string' },
      { key: 'clockOut', title: 'Clock Out', type: 'string' },
      { key: 'regularHours', title: 'Regular Hours', type: 'number' },
      { key: 'overtimeHours', title: 'Overtime Hours', type: 'number' },
      { key: 'totalHours', title: 'Total Hours', type: 'number' },
      { key: 'notes', title: 'Notes', type: 'string' }
    ];
    
    exportToCSV(data, filename || 'timecard_grid.csv', {
      metadata: {
        title: 'Timecard Grid Export',
        description: 'Employee timecard data with hours tracking',
        totalRecords: data.length
      }
    }, columns);
  },

  exportEmployeeDocuments: (data: any[], filename?: string) => {
    exportToCSV(data, filename || 'employee_documents.csv', {
      metadata: {
        title: 'Employee Documents Export',
        description: 'Employee document management data',
        totalRecords: data.length
      }
    });
  },

  exportTaxRecords: (data: any[], filename?: string) => {
    exportToCSV(data, filename || 'tax_records.csv', {
      metadata: {
        title: 'Tax Records Export',
        description: 'Employee tax records and compliance data',
        totalRecords: data.length
      }
    });
  },

  exportATSData: (data: any[], filename?: string) => {
    exportToCSV(data, filename || 'ats_data.csv', {
      metadata: {
        title: 'ATS Data Export',
        description: 'Applicant Tracking System data',
        totalRecords: data.length
      }
    });
  },

  exportQuestionnaireResponses: (data: any[], filename?: string) => {
    exportToCSV(data, filename || 'questionnaire_responses.csv', {
      metadata: {
        title: 'Questionnaire Responses Export',
        description: 'ROM questionnaire responses and analytics',
        totalRecords: data.length
      }
    });
  }
};
