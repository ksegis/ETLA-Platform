'use client';

import { useState } from 'react';
import { AlertTriangle, Building2, CheckCircle } from 'lucide-react';

interface TenantConfirmationProps {
  stage: 'upload' | 'review' | 'final';
  selectedTenant: {
    id: string;
    name: string;
  } | null;
  onConfirm: (confirmed: boolean) => void;
  isConfirmed: boolean;
  recordCount?: number;
  documentCount?: number;
}

const CONFIRMATION_TEXT = {
  upload: {
    title: '⚠️ Tenant Assignment - Stage 1',
    warning: 'You are about to upload data that will be imported into a specific tenant. This action cannot be undone.',
    prompt: 'I understand that I will select the target tenant in the next steps and that all imported data will be permanently assigned to that tenant.',
  },
  review: {
    title: '⚠️ Tenant Verification - Stage 2',
    warning: 'CRITICAL: Please verify the tenant selection below. All imported records will be permanently assigned to this tenant.',
    prompt: 'I have verified the tenant selection above and confirm this is the correct destination for the import data.',
  },
  final: {
    title: '🚨 FINAL CONFIRMATION - Stage 3',
    warning: 'LAST CHANCE: This is your final opportunity to verify the tenant assignment. Once you proceed, the import will begin and data will be permanently assigned.',
    prompt: 'I acknowledge full responsibility for this import and confirm that all data should be assigned to the selected tenant. I understand this action is logged and cannot be undone.',
  },
};

export default function TenantConfirmation({
  stage,
  selectedTenant,
  onConfirm,
  isConfirmed,
  recordCount,
  documentCount,
}: TenantConfirmationProps) {
  const [checkboxChecked, setCheckboxChecked] = useState(isConfirmed);
  const text = CONFIRMATION_TEXT[stage];

  const handleCheckboxChange = (checked: boolean) => {
    setCheckboxChecked(checked);
    onConfirm(checked);
  };

  const getBorderColor = () => {
    if (stage === 'final') return 'border-red-300';
    if (stage === 'review') return 'border-orange-300';
    return 'border-yellow-300';
  };

  const getBgColor = () => {
    if (stage === 'final') return 'bg-red-50';
    if (stage === 'review') return 'bg-orange-50';
    return 'bg-yellow-50';
  };

  const getTextColor = () => {
    if (stage === 'final') return 'text-red-900';
    if (stage === 'review') return 'text-orange-900';
    return 'text-yellow-900';
  };

  const getIconColor = () => {
    if (stage === 'final') return 'text-red-600';
    if (stage === 'review') return 'text-orange-600';
    return 'text-yellow-600';
  };

  return (
    <div className={`border-2 ${getBorderColor()} ${getBgColor()} rounded-lg p-4 sm:p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className={`w-6 h-6 sm:w-8 sm:h-8 ${getIconColor()} flex-shrink-0 mt-1`} />
        <div className="flex-1">
          <h3 className={`text-base sm:text-lg font-bold ${getTextColor()} mb-2`}>
            {text.title}
          </h3>
          <p className={`text-sm sm:text-base ${getTextColor()} font-medium`}>
            {text.warning}
          </p>
        </div>
      </div>

      {/* Tenant Display (for review and final stages) */}
      {(stage === 'review' || stage === 'final') && selectedTenant && (
        <div className="mb-4 p-4 bg-white border-2 border-gray-300 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Target Tenant:</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{selectedTenant.name}</p>
              <p className="text-xs text-gray-500">ID: {selectedTenant.id}</p>
            </div>
          </div>
          
          {(recordCount !== undefined || documentCount !== undefined) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Import Summary:</strong>
              </p>
              <div className="flex gap-4 mt-1">
                {recordCount !== undefined && (
                  <span className="text-xs sm:text-sm text-gray-600">
                    📊 {recordCount} records
                  </span>
                )}
                {documentCount !== undefined && (
                  <span className="text-xs sm:text-sm text-gray-600">
                    📄 {documentCount} documents
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center mt-1">
          <input
            type="checkbox"
            checked={checkboxChecked}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 rounded border-2 border-gray-400 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          {checkboxChecked && (
            <CheckCircle className="absolute w-4 h-4 sm:w-5 sm:h-5 text-green-600 pointer-events-none" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm sm:text-base ${getTextColor()} font-medium leading-relaxed`}>
            {text.prompt}
          </p>
          {stage === 'final' && (
            <p className="text-xs sm:text-sm text-red-700 mt-2 font-semibold">
              ⚠️ This confirmation will be logged with your user ID, timestamp, and IP address for audit purposes.
            </p>
          )}
        </div>
      </label>

      {/* Confirmation Status */}
      {checkboxChecked && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">
              {stage === 'final' ? 'Final confirmation recorded' : 'Confirmation acknowledged'}
            </p>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Timestamp: {new Date().toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
