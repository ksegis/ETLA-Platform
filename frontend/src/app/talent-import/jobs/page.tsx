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
    target: '[data-tour="job-data-upload"]',
    title: 'Upload Job Data',
    content: 'Upload a CSV or Excel file containing your job requisitions. The file should include job titles, descriptions, requirements, and other job details.',
    position: 'bottom',
  },
  {
    target: '[data-tour="job-documents-upload"]',
    title: 'Upload Job Documents',
    content: 'Upload job descriptions, requirement documents, or other files related to job postings. These will be associated with the jobs during import.',
    position: 'bottom',
  },
  {
    target: '[data-tour="template-download"]',
    title: 'Download Template',
    content: 'Not sure about the format? Download our template CSV file to see the required columns and example data.',
    position: 'top',
  },
  {
    target: '[data-tour="next-button"]',
    title: 'Continue to Review',
    content: 'Once you\'ve uploaded your files, click Next to review and configure your import settings.',
    position: 'top',
  },
];

export default function JobsUploadPage() {
  const router = useRouter();
  const { isTourOpen, startTour, closeTour } = useTour('talent-import-jobs');
  
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const handleDataFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setDataFile(files[0]);
    }
  };

  const handleDocumentFilesSelected = (files: File[]) => {
    setDocumentFiles(files);
  };

  const handleNext = () => {
    if (!dataFile) return;
    router.push('/talent-import/jobs/review');
  };

  const handleBack = () => {
    router.push('/talent-import');
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const template = `job_id,title,department,location,employment_type,salary_min,salary_max,description,requirements,posted_date,closing_date,status
JOB-001,Senior Software Engineer,Engineering,San Francisco,Full-time,120000,180000,"We are seeking an experienced software engineer...","5+ years of experience, Bachelor's degree",2024-01-15,2024-02-15,open
JOB-002,Product Manager,Product,Remote,Full-time,100000,150000,"Join our product team...","3+ years in product management",2024-01-20,2024-02-20,open`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs_template.csv';
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
                Import Jobs
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Upload job requisitions and related documents
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
        {/* Job Data Upload */}
        <div data-tour="job-data-upload" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                📊 Job Data File
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Upload a CSV or Excel file with job information
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
            onFilesSelected={handleDataFileSelected}
          />

          {dataFile && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✓ File uploaded: <span className="font-medium">{dataFile.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Job Documents Upload */}
        <div data-tour="job-documents-upload" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
            📎 Job Documents (Optional)
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Upload job descriptions, requirement documents, or other related files
          </p>

          <FileUpload
            accept=".pdf,.doc,.docx,.txt"
            maxSize={5}
            multiple={true}
            onFilesSelected={handleDocumentFilesSelected}
          />

          {documentFiles.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                ✓ {documentFiles.length} document{documentFiles.length > 1 ? 's' : ''} uploaded
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">
            💡 Required Fields
          </h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Job Title</li>
            <li>• Department</li>
            <li>• Location</li>
            <li>• Employment Type (Full-time, Part-time, Contract)</li>
            <li>• Description</li>
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
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
        tourKey="talent-import-jobs"
      />
    </div>
  );
}
