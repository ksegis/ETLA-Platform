import React from 'react';
import { X, Printer, Download } from 'lucide-react';

interface FacsimileModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  recordType: string;
  onPrint?: () => void;
  onDownload?: () => void;
}

export default function FacsimileModal({
  isOpen,
  onClose,
  record,
  recordType,
  onPrint,
  onDownload
}: FacsimileModalProps) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  const handleDownload = () => {
    // Create a printable version of the facsimile
    const printContent = document.getElementById('facsimile-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${recordType} Facsimile - ${record.id || 'Record'}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .company-name { font-size: 18px; font-weight: bold; }
                .sub-client { font-size: 14px; color: #666; margin-top: 5px; }
                .record-details { margin: 20px 0; }
                .field-group { margin: 15px 0; }
                .field-label { font-weight: bold; display: inline-block; width: 150px; }
                .field-value { display: inline-block; }
                .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 12px; color: #666; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
    onDownload?.();
  };

  const renderRecordDetails = () => {
    switch (recordType.toLowerCase()) {
      case 'timecard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Employee:</span>
                <div className="text-gray-900">{record.employee_name || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Employee ID:</span>
                <div className="text-gray-900">{record.employee_id || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Period:</span>
                <div className="text-gray-900">{record.period_start} - {record.period_end}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total Hours:</span>
                <div className="text-gray-900">{record.total_hours || 0}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Regular Hours:</span>
                <div className="text-gray-900">{record.regular_hours || 0}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Overtime Hours:</span>
                <div className="text-gray-900">{record.overtime_hours || 0}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <div className="text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.status === 'approved' ? 'bg-green-100 text-green-800' :
                    record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status || 'Unknown'}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Submitted Date:</span>
                <div className="text-gray-900">{record.submitted_date || 'N/A'}</div>
              </div>
            </div>
            {record.notes && (
              <div>
                <span className="font-semibold text-gray-700">Notes:</span>
                <div className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">{record.notes}</div>
              </div>
            )}
          </div>
        );

      case 'invoice':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Invoice Number:</span>
                <div className="text-gray-900">{record.invoice_number || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Client:</span>
                <div className="text-gray-900">{record.client_name || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Invoice Date:</span>
                <div className="text-gray-900">{record.invoice_date || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Due Date:</span>
                <div className="text-gray-900">{record.due_date || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Amount:</span>
                <div className="text-gray-900 font-semibold">${record.amount || '0.00'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <div className="text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.status === 'paid' ? 'bg-green-100 text-green-800' :
                    record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            {record.description && (
              <div>
                <span className="font-semibold text-gray-700">Description:</span>
                <div className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">{record.description}</div>
              </div>
            )}
          </div>
        );

      case 'expense':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Expense ID:</span>
                <div className="text-gray-900">{record.expense_id || record.id || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Employee:</span>
                <div className="text-gray-900">{record.employee_name || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Date:</span>
                <div className="text-gray-900">{record.expense_date || record.date || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Category:</span>
                <div className="text-gray-900">{record.category || 'N/A'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Amount:</span>
                <div className="text-gray-900 font-semibold">${record.amount || '0.00'}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <div className="text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.status === 'approved' ? 'bg-green-100 text-green-800' :
                    record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            {record.description && (
              <div>
                <span className="font-semibold text-gray-700">Description:</span>
                <div className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">{record.description}</div>
              </div>
            )}
            {record.receipt_url && (
              <div>
                <span className="font-semibold text-gray-700">Receipt:</span>
                <div className="text-gray-900 mt-1">
                  <a href={record.receipt_url} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:text-blue-800 underline">
                    View Receipt
                  </a>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(record).map(([key, value]) => (
                <div key={key}>
                  <span className="font-semibold text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <div className="text-gray-900">{String(value) || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 no-print">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {recordType} Facsimile
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Record ID: {record.id || record.invoice_number || record.expense_id || 'N/A'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div id="facsimile-content">
            {/* Company Header */}
            <div className="header mb-6 pb-4 border-b-2 border-gray-900">
              <div className="company-name text-xl font-bold text-gray-900">
                ETLA Platform Operations
              </div>
              <div className="sub-client text-sm text-gray-600 mt-1">
                {record.sub_client_company || record.client_name || 'Sub-Client Company Name'}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Generated on: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Record Details */}
            <div className="record-details">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {recordType} Details
              </h3>
              {renderRecordDetails()}
            </div>

            {/* Footer */}
            <div className="footer mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500">
              <p>This is an official facsimile generated by ETLA Platform Operations.</p>
              <p>For questions or concerns, please contact your account representative.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
