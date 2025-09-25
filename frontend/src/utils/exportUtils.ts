// Export utilities for CSV and Excel functionality

export interface ExportColumn<T extends object> {
  key: keyof T;
  title: string;
  width?: number;
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
}

// CSV Export Function
export function exportToCSV<T extends object>(
  data: T[],
  filename?: string,
  options: ExportOptions = {}
): void {
  if (!data || data.length === 0) {
    console.warn('No data provided for CSV export');
    return;
  }

  const finalFilename = filename || `export_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = (row as any)[header];
        // Handle values that might contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Excel Export Function (simplified - creates CSV with .xlsx extension)
// For full Excel functionality, you would need a library like xlsx or exceljs
export function exportToExcel<T extends object>(
  data: T[],
  filename?: string,
  options: ExportOptions = {}
): void {
  if (!data || data.length === 0) {
    console.warn('No data provided for Excel export');
    return;
  }

  const finalFilename = filename || `export_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // For now, we'll create a CSV file with .xlsx extension
  // In a production environment, you'd want to use a proper Excel library
  exportToCSV(data, finalFilename.replace('.xlsx', '.csv'), options);
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
