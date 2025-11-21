'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import ProgressStepper, { Step } from '@/components/ProgressStepper';
import FileUpload from '@/components/FileUpload';
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
    target: '[data-tour="data-upload"]',
    title: 'Upload Candidate Data',
    content: 'Start by uploading a CSV or Excel file containing your candidate data. You can download a template below to see the required format.',
    position: 'bottom',
  },
  {
    target: '[data-tour="template-download"]',
    title: 'Download Template',
    content: 'Click here to download a pre-formatted CSV template with all the required and optional columns. This ensures your data is structured correctly.',
    position: 'top',
  },
  {
    target: '[data-tour="documents-upload"]',
    title: 'Upload Documents (Optional)',
    content: 'Upload resumes, certificates, and other documents. Name files with candidate email or ID for auto-matching (e.g., john.doe@example.com_resume.pdf).',
    position: 'bottom',
  },
  {
    target: '[data-tour="naming-convention"]',
    title: 'File Naming Tips',
    content: 'Follow these naming patterns for automatic document matching. The system will intelligently link documents to candidates in the next step.',
    position: 'top',
  },
];

export default function CandidatesImportPage() {
  const router = useRouter();
  const { isTourOpen, startTour, closeTour } = useTour('talent-import-candidates');
  
  const [currentStep, setCurrentStep] = useState(1);
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
    if (!dataFile) {
      alert('Please upload a candidate data file to continue');
      return;
    }
    // TODO: Navigate to mapping step
    router.push('/talent-import/candidates/map');
  };

  const handleBack = () => {
    router.push('/talent-import');
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const template = `first_name,last_name,email,mobile_phone,home_phone,work_phone,street,city,state,zip,country,candidate_id,linkedin_url,github_url,portfolio_url,current_title,current_company,years_experience
John,Doe,john.doe@example.com,+1-555-123-4567,+1-555-987-6543,,123 Main St,San Francisco,CA,94102,USA,CAN-001,https://linkedin.com/in/johndoe,https://github.com/johndoe,https://johndoe.com,Senior Software Engineer,Tech Corp,8
Jane,Smith,jane.smith@example.com,+1-555-234-5678,,,456 Oak Ave,New York,NY,10001,USA,CAN-002,https://linkedin.com/in/janesmith,,https://janesmith.dev,Product Manager,Startup Inc,5`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates_template.csv';
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
                Import Candidates
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Upload candidate data and documents
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
            <ProgressStepper steps={steps} currentStep={currentStep} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Data Upload Section */}
        <div data-tour="data-upload" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                📊 Upload Candidate Data
              </h2>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Upload a CSV or Excel file with candidate information
              </p>
            </div>

            <button
              data-tour="template-download"
              onClick={handleDownloadTemplate}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Template</span>
              <span className="sm:hidden">Template</span>
            </button>
          </div>

          <FileUpload
            accept=".csv,.xlsx,.xls"
            multiple={false}
            maxSize={10}
            onFilesSelected={handleDataFileSelected}
            hint="Drag & drop CSV or Excel file here or click to browse"
          />

          {/* Required Fields Info */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              📋 Required Columns:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700">
              <div>
                <span className="font-medium">Required:</span> first_name, last_name, email
              </div>
              <div>
                <span className="font-medium">Optional:</span> mobile_phone, home_phone, work_phone
              </div>
              <div className="sm:col-span-2">
                <span className="font-medium">Optional:</span> address, city, state, zip, country, candidate_id
              </div>
            </div>
          </div>
        </div>

        {/* Documents Upload Section */}
        <div data-tour="documents-upload" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              📄 Upload Documents (Optional)
            </h2>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Upload resumes, certificates, and other candidate documents
            </p>
          </div>

          <FileUpload
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple={true}
            maxSize={25}
            onFilesSelected={handleDocumentFilesSelected}
            hint="Drag & drop document files here or click to browse"
          />

          {/* Naming Convention Tips */}
          <div data-tour="naming-convention" className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              💡 File Naming Tips for Auto-Matching:
            </h3>
            <div className="space-y-1 text-xs sm:text-sm text-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="font-mono bg-white px-2 py-1 rounded border border-yellow-300 text-xs">
                  john.doe@example.com_resume.pdf
                </span>
                <span className="text-gray-600">→ Matches by email</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="font-mono bg-white px-2 py-1 rounded border border-yellow-300 text-xs">
                  CAN-12345_certificate.pdf
                </span>
                <span className="text-gray-600">→ Matches by candidate ID</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="font-mono bg-white px-2 py-1 rounded border border-yellow-300 text-xs">
                  John_Doe_resume.pdf
                </span>
                <span className="text-gray-600">→ Matches by name</span>
              </div>
            </div>
          </div>

          {/* Supported Document Types */}
          <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              📎 Supported Document Types:
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Resume', 'Cover Letter', 'Certificate', 'Reference Letter', 'Transcript', 'Portfolio'].map(type => (
                <span key={type} className="px-2 sm:px-3 py-1 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700">
                  {type}
                </span>
              ))}
            </div>
          </div>
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
            onClick={handleNext}
            disabled={!dataFile}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Next: Map Documents
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Summary Card (Mobile-friendly) */}
        {(dataFile || documentFiles.length > 0) && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              ✅ Upload Summary
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              {dataFile && (
                <div>Data file: <span className="font-medium">{dataFile.name}</span></div>
              )}
              {documentFiles.length > 0 && (
                <div>Documents: <span className="font-medium">{documentFiles.length} files</span></div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tour Overlay */}
      <TourOverlay
        steps={tourSteps}
        isOpen={isTourOpen}
        onClose={closeTour}
        tourKey="talent-import-candidates"
      />
    </div>
  );
}
