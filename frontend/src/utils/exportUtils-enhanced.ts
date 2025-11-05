/**
 * Enhanced Export Utilities
 * Provides robust functions for exporting data to various formats
 * Fixes previous corruption issues by using proper libraries
 */

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  fileName?: string;
}

/**
 * Validate export data before processing
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateExportData(data: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data || data.length === 0) {
    errors.push('No data to export');
    return { isValid: false, errors, warnings };
  }

  // Check for consistent structure
  const firstRowKeys = Object.keys(data[0]);
  if (firstRowKeys.length === 0) {
    errors.push('Data rows have no properties');
    return { isValid: false, errors, warnings };
  }

  // Check for large datasets
  if (data.length > 10000) {
    warnings.push('Large dataset may take time to export');
  }

  // Check for complex nested objects
  let hasNestedData = false;
  data.slice(0, 10).forEach((row, index) => {
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        hasNestedData = true;
      }
    });
  });

  if (hasNestedData) {
    warnings.push('Some fields contain nested data that will be flattened');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Flatten nested objects and arrays for export
 */
function flattenValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  if (Array.isArray(value)) {
    return value.map(v => flattenValue(v)).join(', ');
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Prepare data for export by flattening and cleaning
 */
function prepareDataForExport(data: any[]): any[] {
  return data.map(row => {
    const flatRow: any = {};
    Object.entries(row).forEach(([key, value]) => {
      flatRow[key] = flattenValue(value);
    });
    return flatRow;
  });
}

/**
 * Export data to Excel format using ExcelJS
 * Creates proper XLSX files that won't be corrupted
 */
export async function exportToExcel(
  data: any[],
  filename: string,
  options?: ExportOptions
): Promise<void> {
  // Validate data
  const validation = validateExportData(data);
  if (!validation.isValid) {
    throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
  }

  // Show warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Export warnings:', validation.warnings);
  }

  try {
    // Prepare data
    const preparedData = prepareDataForExport(data);
    const headers = Object.keys(preparedData[0]);

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = options?.creator || 'ETLA Platform';
    workbook.lastModifiedBy = options?.author || 'ETLA Platform';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    const worksheet = workbook.addWorksheet('Data', {
      properties: { tabColor: { argb: 'FF0066CC' } }
    });

    // Add title if provided
    if (options?.title) {
      worksheet.mergeCells('A1', `${String.fromCharCode(64 + headers.length)}1`);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = options.title;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 30;
    }

    // Add headers
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0066CC' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;

    // Add data rows
    preparedData.forEach(row => {
      const values = headers.map(header => row[header]);
      worksheet.addRow(values);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column, index) => {
      let maxLength = headers[index].length;
      preparedData.forEach(row => {
        const cellValue = String(row[headers[index]] || '');
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Freeze header row
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: options?.title ? 2 : 1 }
    ];

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create blob and download
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(link.href);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel. Please try again.');
  }
}

/**
 * Export data to PDF format using jsPDF
 * Creates proper PDF files with tables
 */
export function exportToPDF(
  data: any[],
  filename: string,
  options?: ExportOptions
): void {
  // Validate data
  const validation = validateExportData(data);
  if (!validation.isValid) {
    throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
  }

  // Show warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Export warnings:', validation.warnings);
  }

  try {
    // Prepare data
    const preparedData = prepareDataForExport(data);
    const headers = Object.keys(preparedData[0]);

    // Create PDF document
    const doc = new jsPDF({
      orientation: headers.length > 6 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    let startY = 15;
    if (options?.title) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(options.title, doc.internal.pageSize.getWidth() / 2, startY, {
        align: 'center'
      });
      startY += 10;
    }

    // Add metadata
    if (options?.author) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated by: ${options.author}`, 14, startY);
      startY += 5;
    }

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, startY);
    startY += 10;

    // Prepare table data
    const tableHeaders = headers.map(h => ({
      header: h,
      dataKey: h
    }));

    const tableRows = preparedData.map(row =>
      headers.reduce((acc, header) => {
        acc[header] = row[header] || '';
        return acc;
      }, {} as any)
    );

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableRows.map(row => headers.map(h => row[h])),
      startY: startY,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          data.settings.margin.left,
          pageHeight - 10
        );
      }
    });

    // Save PDF
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF. Please try again.');
  }
}

/**
 * Export data to CSV format (improved version)
 * Properly handles special characters and encoding
 */
export function exportToCSV(data: any[], filename: string): void {
  // Validate data
  const validation = validateExportData(data);
  if (!validation.isValid) {
    throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
  }

  try {
    // Prepare data
    const preparedData = prepareDataForExport(data);
    const headers = Object.keys(preparedData[0]);

    // Create CSV content with UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvRows: string[] = [];

    // Add headers
    csvRows.push(headers.map(escapeCSVValue).join(','));

    // Add data rows
    preparedData.forEach(row => {
      const values = headers.map(header => escapeCSVValue(row[header] || ''));
      csvRows.push(values.join(','));
    });

    const csvContent = BOM + csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export to CSV. Please try again.');
  }
}

/**
 * Escape CSV values properly
 */
function escapeCSVValue(value: any): string {
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Get appropriate filename with timestamp
 */
export function getTimestampedFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${baseName}_${timestamp}.${extension}`;
}
