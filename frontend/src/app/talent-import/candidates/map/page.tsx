'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Search, FileText, HelpCircle } from 'lucide-react';
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
    target: '[data-tour="auto-matched"]',
    title: 'Auto-Matched Documents',
    content: 'These documents were automatically matched to candidates based on filename patterns (email, candidate ID, or name). Review to ensure accuracy.',
    position: 'bottom',
  },
  {
    target: '[data-tour="unmatched"]',
    title: 'Unmatched Documents',
    content: 'These documents couldn\'t be automatically matched. Manually assign them to candidates using the dropdown selector.',
    position: 'bottom',
  },
  {
    target: '[data-tour="document-type"]',
    title: 'Document Types',
    content: 'The system detects document types from filenames. You can change the type if needed (e.g., resume, certificate, reference letter).',
    position: 'top',
  },
];

interface DocumentMapping {
  filename: string;
  size: number;
  candidateEmail?: string;
  candidateId?: string;
  candidateName?: string;
  documentType: string;
  confidence: 'high' | 'medium' | 'low';
}

// Mock data - in real implementation, this would come from the upload step
const mockMappings: DocumentMapping[] = [
  {
    filename: 'john.doe@example.com_resume.pdf',
    size: 245000,
    candidateEmail: 'john.doe@example.com',
    candidateName: 'John Doe',
    documentType: 'resume',
    confidence: 'high',
  },
  {
    filename: 'jane_smith_certificate.pdf',
    size: 180000,
    candidateName: 'Jane Smith',
    candidateEmail: 'jane.smith@example.com',
    documentType: 'certificate',
    confidence: 'medium',
  },
  {
    filename: 'CAN-12345_transcript.pdf',
    size: 320000,
    candidateId: 'CAN-12345',
    candidateName: 'Bob Johnson',
    documentType: 'transcript',
    confidence: 'high',
  },
  {
    filename: 'reference_letter.pdf',
    size: 156000,
    documentType: 'reference_letter',
    confidence: 'low',
  },
  {
    filename: 'portfolio_samples.pdf',
    size: 1200000,
    documentType: 'portfolio',
    confidence: 'low',
  },
];

const documentTypes = [
  'resume',
  'cover_letter',
  'certificate',
  'reference_letter',
  'transcript',
  'portfolio',
  'writing_sample',
  'background_check',
];

export default function MapDocumentsPage() {
  const router = useRouter();
  const { isTourOpen, startTour, closeTour } = useTour('talent-import-map');
  
  const [mappings, setMappings] = useState<DocumentMapping[]>(mockMappings);
  const [searchTerm, setSearchTerm] = useState('');

  const autoMatched = mappings.filter(m => m.confidence !== 'low');
  const unmatched = mappings.filter(m => m.confidence === 'low');

  const handleDocumentTypeChange = (index: number, newType: string) => {
    const updated = [...mappings];
    updated[index].documentType = newType;
    setMappings(updated);
  };

  const handleCandidateAssign = (index: number, candidateEmail: string) => {
    const updated = [...mappings];
    updated[index].candidateEmail = candidateEmail;
    updated[index].confidence = 'medium';
    setMappings(updated);
  };

  const handleNext = () => {
    // TODO: Save mappings and navigate to review step
    router.push('/talent-import/candidates/review');
  };

  const handleBack = () => {
    router.push('/talent-import/candidates');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Map Documents
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Review and adjust document-to-candidate mappings
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
            <ProgressStepper steps={steps} currentStep={2} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{mappings.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Documents</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-200 bg-green-50">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{autoMatched.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Auto-Matched</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-yellow-200 bg-yellow-50">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{unmatched.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Need Review</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {Math.round((autoMatched.length / mappings.length) * 100)}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Match Rate</div>
          </div>
        </div>

        {/* Auto-Matched Documents */}
        {autoMatched.length > 0 && (
          <div data-tour="auto-matched" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Auto-Matched Documents ({autoMatched.length})
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {autoMatched.map((mapping, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {mapping.filename}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                            {formatFileSize(mapping.size)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden lg:block text-gray-400">→</div>

                    {/* Candidate Info */}
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        {mapping.candidateName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {mapping.candidateEmail || mapping.candidateId}
                      </p>
                    </div>

                    {/* Document Type */}
                    <div data-tour="document-type" className="w-full lg:w-48">
                      <select
                        value={mapping.documentType}
                        onChange={(e) => handleDocumentTypeChange(mappings.indexOf(mapping), e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {documentTypes.map(type => (
                          <option key={type} value={type}>
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Confidence Badge */}
                    <div className="flex lg:justify-end">
                      <span className={`
                        px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
                        ${mapping.confidence === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                      `}>
                        {mapping.confidence === 'high' ? '✓ High' : '~ Medium'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unmatched Documents */}
        {unmatched.length > 0 && (
          <div data-tour="unmatched" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Unmatched Documents ({unmatched.length})
              </h2>
            </div>

            <p className="text-sm sm:text-base text-gray-600 mb-4">
              These documents need manual assignment. Select a candidate from the dropdown.
            </p>

            <div className="space-y-3 sm:space-y-4">
              {unmatched.map((mapping, index) => (
                <div key={index} className="border border-yellow-200 rounded-lg p-3 sm:p-4 bg-yellow-50">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {mapping.filename}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                            {formatFileSize(mapping.size)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Selector */}
                    <div className="flex-1">
                      <select
                        value={mapping.candidateEmail || ''}
                        onChange={(e) => handleCandidateAssign(mappings.indexOf(mapping), e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select candidate...</option>
                        <option value="john.doe@example.com">John Doe (john.doe@example.com)</option>
                        <option value="jane.smith@example.com">Jane Smith (jane.smith@example.com)</option>
                        <option value="bob.johnson@example.com">Bob Johnson (bob.johnson@example.com)</option>
                      </select>
                    </div>

                    {/* Document Type */}
                    <div className="w-full lg:w-48">
                      <select
                        value={mapping.documentType}
                        onChange={(e) => handleDocumentTypeChange(mappings.indexOf(mapping), e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {documentTypes.map(type => (
                          <option key={type} value={type}>
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={unmatched.some(m => !m.candidateEmail)}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
        tourKey="talent-import-map"
      />
    </div>
  );
}
