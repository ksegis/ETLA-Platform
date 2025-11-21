'use client';

import { useState } from 'react';
import { X, AlertTriangle, Building2, Users, FileText } from 'lucide-react';
import TenantConfirmation from './TenantConfirmation';

interface FinalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenant: {
    id: string;
    name: string;
  };
  importType: string;
  recordCount: number;
  documentCount?: number;
}

export default function FinalConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  tenant,
  importType,
  recordCount,
  documentCount,
}: FinalConfirmationModalProps) {
  const [finalConfirmed, setFinalConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!finalConfirmed) {
      alert('You must check the confirmation box to proceed');
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-red-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold">FINAL CONFIRMATION REQUIRED</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-red-700 rounded-lg p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Warning Banner */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-900 font-bold text-lg mb-2">
                ⚠️ THIS IS YOUR LAST CHANCE TO VERIFY
              </p>
              <p className="text-red-800 text-sm">
                You are about to permanently import data into the system. This action cannot be undone.
                All records will be assigned to the tenant shown below.
              </p>
            </div>

            {/* Import Summary */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-5 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Import Summary</h3>
              
              <div className="space-y-3">
                {/* Import Type */}
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Import Type:</span>
                  <span className="text-gray-900 font-bold capitalize">{importType}</span>
                </div>

                {/* Record Count */}
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Records:
                  </span>
                  <span className="text-gray-900 font-bold text-xl">{recordCount}</span>
                </div>

                {/* Document Count */}
                {documentCount !== undefined && documentCount > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Total Documents:
                    </span>
                    <span className="text-gray-900 font-bold text-xl">{documentCount}</span>
                  </div>
                )}

                {/* Target Tenant */}
                <div className="pt-3">
                  <div className="bg-white border-2 border-blue-500 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">TARGET TENANT:</p>
                        <p className="text-2xl font-bold text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Tenant ID: {tenant.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Confirmation Component */}
            <TenantConfirmation
              stage="final"
              selectedTenant={tenant}
              onConfirm={setFinalConfirmed}
              isConfirmed={finalConfirmed}
              recordCount={recordCount}
              documentCount={documentCount}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!finalConfirmed}
                className="flex-1 px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold transition-colors"
              >
                {finalConfirmed ? 'PROCEED WITH IMPORT' : 'Confirm to Enable'}
              </button>
            </div>

            {/* Audit Notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>Audit Trail:</strong> This confirmation, along with your user ID, IP address, and timestamp,
                will be permanently logged in the database for compliance and audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
