'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, FileText, HelpCircle } from 'lucide-react';
import ProgressStepper, { Step } from '@/components/ProgressStepper';
import FileUpload from '@/components/FileUpload';
import TourOverlay, { useTour, TourStep } from '@/components/TourOverlay';

const steps: Step[] = [
  { id: 1, title: 'Upload Data', shortTitle: 'Upload' },
  { id: 2, title: 'Review & Configure', shortTitle: 'Review' },
  { id: 3, title: 'Import Progress', shortTitle: 'Progress' },
  { id: 4, title: 'Results', shortTitle: 'Results' },
];

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="application-data-upload"]',
    title: 'Upload Application Data',
    content: 'Upload a CSV or Excel file containing job applications. This links candidates to specific job openings with application status and dates.',
    position: 'bottom',
  },
  {
    target: '[data-tour="template-download"]',
    title: 'Download Template',
    content: 'Download our template CSV file to see the required columns. You\'ll need candidate IDs or emails and job IDs to link them together.',
    position: 'top',
  },
  {
    target: '[data-tour="requirements-info"]',
    title: 'Required Information',
    content: 'Applications require both candidate and job references. Make sure you\'ve already imported candidates and jobs before importing applications.',
    position: 'top',
  },
  {
    target: '[data-tour="next-button"]',
    title: 'Continue to Review',
    content: 'Once you\'ve uploaded your file, click Next to review and configure your import settings.',
    position: 'top',
  },
];

export default function ApplicationsUploadPage() {
  const router = useRouter();
  const { isTourOpen, startTour, closeTour } = useTour('talent-import-applications');
  
  const [dataFile, setDataFile] = useState<File | null>(null);

  const handleDataFileChange = (files: File[]) => {
    if (files.length > 0) {
      setDataFile(files[0]);
    }
  };

  const handleNext = () => {
    if (!dataFile) return;
    router.push('/talent-import/applications/review');
  };

  const handleBack = () => {
    router.push('/talent-import');
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const template = `application_id,candidate_email,job_id,status,applied_date,source,notes
APP-001,john.doe@example.com,JOB-001,applied,2024-01-15,LinkedIn,Strong technical background
APP-002,jane.smith@example.com,JOB-001,screening,2024-01-16,Company Website,Excellent communication skills
APP-003,john.doe@example.com,JOB-002,interview,2024-01-20,Referral,Referred by current employee`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applications_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Import Applications
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Link candidates to job openings with application data
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
            <ProgressStepper steps={steps} currentStep={1} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Application Data Upload */}
        <div data-tour="application-data-upload" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                📋 Application Data File
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Upload a CSV or Excel file with application information
              </p>
            </div>
            <button
              data-tour="template-download"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Download Template</span>
              <span className="sm:hidden">Template</span>
            </button>
          </div>

          <FileUpload
            accept=".csv,.xlsx,.xls"
            maxSize={10}
            multiple={false}
            onFilesChange={handleDataFileChange}
          />

          {dataFile && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✓ File uploaded: <span className="font-medium">{dataFile.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Important Info */}
        <div data-tour="requirements-info" className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm sm:text-base font-semibold text-yellow-900 mb-2">
            ⚠️ Prerequisites
          </h3>
          <p className="text-xs sm:text-sm text-yellow-800 mb-3">
            Before importing applications, make sure you have already imported:
          </p>
          <ul className="text-xs sm:text-sm text-yellow-800 space-y-1">
            <li>• <strong>Candidates</strong> - The people applying for jobs</li>
            <li>• <strong>Jobs</strong> - The job openings they're applying to</li>
          </ul>
          <p className="text-xs sm:text-sm text-yellow-800 mt-3">
            Applications link these together using candidate emails/IDs and job IDs.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">
            💡 Required Fields
          </h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Candidate Email or Candidate ID</li>
            <li>• Job ID</li>
            <li>• Application Status (applied, screening, interview, offer, hired, rejected)</li>
            <li>• Applied Date</li>
          </ul>
        </div>

        {/* Navigation Buttons */}
        <div data-tour="next-button" className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!dataFile}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Next: Review & Configure
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Tour Overlay */}
      <TourOverlay
        steps={tourSteps}
        isOpen={isTourOpen}
        onClose={closeTour}
        tourKey="talent-import-applications"
      />
    </div>
  );
}
