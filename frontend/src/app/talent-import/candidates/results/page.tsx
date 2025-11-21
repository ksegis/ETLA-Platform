'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertTriangle, Download, RotateCcw, Home } from 'lucide-react';
import ProgressStepper, { Step } from '@/components/ProgressStepper';

const steps: Step[] = [
  { id: 1, title: 'Upload Data', shortTitle: 'Upload' },
  { id: 2, title: 'Map Documents', shortTitle: 'Map' },
  { id: 3, title: 'Review & Configure', shortTitle: 'Review' },
  { id: 4, title: 'Import Progress', shortTitle: 'Progress' },
  { id: 5, title: 'Results', shortTitle: 'Results' },
];

export default function ImportResultsPage() {
  const router = useRouter();

  const totalCandidates = 150;
  const successfulCandidates = 148;
  const failedCandidates = 2;
  const totalDocuments = 285;
  const successfulDocuments = 283;
  const failedDocuments = 2;

  const handleNewImport = () => {
    router.push('/talent-import');
  };

  const handleViewCandidates = () => {
    router.push('/talent/candidates');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Import Complete
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Review the results of your import
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="mt-4 sm:mt-6">
            <ProgressStepper steps={steps} currentStep={5} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Success Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-green-900 mb-1">
                Import Successful!
              </h2>
              <p className="text-sm sm:text-base text-green-700">
                {successfulCandidates} of {totalCandidates} candidates and {successfulDocuments} of {totalDocuments} documents were imported successfully.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Candidates Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Candidates
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="text-sm sm:text-base text-gray-700">Successful</span>
                </div>
                <span className="text-base sm:text-lg font-semibold text-green-600">
                  {successfulCandidates}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  <span className="text-sm sm:text-base text-gray-700">Failed</span>
                </div>
                <span className="text-base sm:text-lg font-semibold text-red-600">
                  {failedCandidates}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium text-gray-900">Total</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900">
                    {totalCandidates}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Documents
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="text-sm sm:text-base text-gray-700">Successful</span>
                </div>
                <span className="text-base sm:text-lg font-semibold text-green-600">
                  {successfulDocuments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  <span className="text-sm sm:text-base text-gray-700">Failed</span>
                </div>
                <span className="text-base sm:text-lg font-semibold text-red-600">
                  {failedDocuments}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium text-gray-900">Total</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900">
                    {totalDocuments}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Errors (if any) */}
        {failedCandidates > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-1">
                  {failedCandidates} Candidates Failed to Import
                </h3>
                <p className="text-xs sm:text-sm text-red-700">
                  Download the error report below to see details and retry.
                </p>
              </div>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-red-800">
              <div>• Row 15: Invalid email format (john.doe@invalid)</div>
              <div>• Row 87: Duplicate email address (jane.smith@example.com)</div>
            </div>
          </div>
        )}

        {/* Download Reports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            📥 Download Reports
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Download className="w-4 h-4" />
              Success Report (CSV)
            </button>
            {failedCandidates > 0 && (
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <Download className="w-4 h-4" />
                Error Report (CSV)
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={handleViewCandidates}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            View Candidates
          </button>

          <button
            onClick={handleNewImport}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            New Import
          </button>
        </div>
      </div>
    </div>
  );
}
