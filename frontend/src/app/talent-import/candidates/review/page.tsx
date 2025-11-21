'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Users, FileText, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import ProgressStepper, { Step } from '@/components/ProgressStepper';
import TourOverlay, { useTour, TourStep } from '@/components/TourOverlay';

const steps: Step[] = [
  { id: 1, title: 'Upload Data', shortTitle: 'Upload' },
  { id: 2, title: 'Map Documents', shortTitle: 'Map' },
  { id: 3, title: 'Review & Configure', shortTitle: 'Review' },
  { id: 4, title: 'Import Progress', shortTitle: 'Progress' },
  { id: 5, title: 'Results', shortTitle: 'Results' },
];

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="import-summary"]',
    title: 'Import Summary',
    content: 'Review the total number of candidates and documents that will be imported. Make sure these numbers match your expectations.',
    position: 'bottom',
  },
  {
    target: '[data-tour="tenant-selection"]',
    title: 'Select Target Tenant',
    content: 'Choose which tenant (client) these candidates will be imported into. This is important for data isolation.',
    position: 'bottom',
  },
  {
    target: '[data-tour="import-options"]',
    title: 'Import Options',
    content: 'Configure how to handle duplicates and errors. Choose whether to skip or update existing candidates.',
    position: 'bottom',
  },
  {
    target: '[data-tour="validation-results"]',
    title: 'Validation Results',
    content: 'Review any warnings or errors found during validation. Fix critical errors before proceeding.',
    position: 'top',
  },
];

interface ValidationIssue {
  type: 'error' | 'warning';
  row: number;
  field: string;
  message: string;
}

const mockValidation: ValidationIssue[] = [
  {
    type: 'warning',
    row: 15,
    field: 'mobile_phone',
    message: 'Invalid phone format, will be skipped',
  },
  {
    type: 'warning',
    row: 23,
    field: 'zip',
    message: 'Zip code too short, will be padded',
  },
];

export default function ReviewConfigurePage() {
  const router = useRouter();
  const { isTourOpen, startTour, closeTour } = useTour('talent-import-review');
  
  const [selectedTenant, setSelectedTenant] = useState('');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [validateEmails, setValidateEmails] = useState(true);

  const candidateCount = 150;
  const documentCount = 285;
  const errors = mockValidation.filter(v => v.type === 'error');
  const warnings = mockValidation.filter(v => v.type === 'warning');

  const canProceed = selectedTenant && errors.length === 0;

  const handleStartImport = () => {
    if (!canProceed) return;
    router.push('/talent-import/candidates/progress');
  };

  const handleBack = () => {
    router.push('/talent-import/candidates/map');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Review & Configure
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Final review before importing
              </p>
            </div>

            <button
              onClick={startTour}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Start Tour</span>
              <span className="sm:hidden">Tour</span>
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="mt-4 sm:mt-6">
            <ProgressStepper steps={steps} currentStep={3} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Import Summary */}
        <div data-tour="import-summary" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            📊 Import Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{candidateCount}</div>
                <div className="text-xs sm:text-sm text-gray-600">Candidates</div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{documentCount}</div>
                <div className="text-xs sm:text-sm text-gray-600">Documents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Selection */}
        <div data-tour="tenant-selection" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            🏢 Select Target Tenant
          </h2>

          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Choose which tenant these candidates will be imported into
          </p>

          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a tenant...</option>
            <option value="demo-company">Demo Company</option>
            <option value="alphies">Alphies</option>
            <option value="invictus-bpo">Invictus BPO (Sub Client)</option>
          </select>

          {!selectedTenant && (
            <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Please select a tenant to continue
            </p>
          )}
        </div>

        {/* Import Options */}
        <div data-tour="import-options" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            ⚙️ Import Options
          </h2>

          <div className="space-y-4">
            {/* Skip Duplicates */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm sm:text-base font-medium text-gray-900">
                  Skip Duplicate Candidates
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Skip candidates with existing email addresses in the system
                </div>
              </div>
            </label>

            {/* Update Existing */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={updateExisting}
                onChange={(e) => setUpdateExisting(e.target.checked)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm sm:text-base font-medium text-gray-900">
                  Update Existing Candidates
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Update candidate information if email already exists (overrides skip duplicates)
                </div>
              </div>
            </label>

            {/* Validate Emails */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={validateEmails}
                onChange={(e) => setValidateEmails(e.target.checked)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm sm:text-base font-medium text-gray-900">
                  Validate Email Addresses
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Skip candidates with invalid email formats
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Validation Results */}
        <div data-tour="validation-results" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            ✓ Validation Results
          </h2>

          {errors.length === 0 && warnings.length === 0 ? (
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-medium text-green-900">
                  All validation checks passed!
                </p>
                <p className="text-xs sm:text-sm text-green-700 mt-0.5">
                  Your data is ready to import
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Errors */}
              {errors.length > 0 && (
                <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm sm:text-base font-semibold text-red-900">
                      {errors.length} Error{errors.length > 1 ? 's' : ''} Found
                    </p>
                  </div>
                  <div className="space-y-2">
                    {errors.map((issue, index) => (
                      <div key={index} className="text-xs sm:text-sm text-red-700">
                        Row {issue.row}, {issue.field}: {issue.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm sm:text-base font-semibold text-yellow-900">
                      {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {warnings.map((issue, index) => (
                      <div key={index} className="text-xs sm:text-sm text-yellow-700">
                        Row {issue.row}, {issue.field}: {issue.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </button>

          <button
            onClick={handleStartImport}
            disabled={!canProceed}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Start Import
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Tour Overlay */}
      <TourOverlay
        steps={tourSteps}
        isOpen={isTourOpen}
        onClose={closeTour}
        tourKey="talent-import-review"
      />
    </div>
  );
}
