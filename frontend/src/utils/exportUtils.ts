/**
 * Export Utilities
 * Provides functions for exporting data to various formats
 */

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

export const exportToExcel = (data: any[], filename: string) => {
  // For now, export as CSV since we don't have xlsx library
  // In production, you would use a library like xlsx or exceljs
  const excelFilename = filename.replace('.xlsx', '.csv');
  exportToCSV(data, excelFilename);
  
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
