'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Users, FileText } from 'lucide-react';
import ProgressStepper, { Step } from '@/components/ProgressStepper';

const steps: Step[] = [
  { id: 1, title: 'Upload Data', shortTitle: 'Upload' },
  { id: 2, title: 'Map Documents', shortTitle: 'Map' },
  { id: 3, title: 'Review & Configure', shortTitle: 'Review' },
  { id: 4, title: 'Import Progress', shortTitle: 'Progress' },
  { id: 5, title: 'Results', shortTitle: 'Results' },
];

export default function ImportProgressPage() {
  const router = useRouter();
  
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Preparing import...');
  const [candidatesProcessed, setCandidatesProcessed] = useState(0);
  const [documentsProcessed, setDocumentsProcessed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const totalCandidates = 150;
  const totalDocuments = 285;

  useEffect(() => {
    // Simulate import progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(() => {
            router.push('/talent-import/candidates/results');
          }, 2000);
          return 100;
        }
        return prev + 2;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    // Update step description based on progress
    if (progress < 20) {
      setCurrentStep('Validating data...');
    } else if (progress < 40) {
      setCurrentStep('Creating candidate records...');
      setCandidatesProcessed(Math.floor((progress - 20) / 80 * totalCandidates));
    } else if (progress < 80) {
      setCurrentStep('Uploading documents...');
      setCandidatesProcessed(totalCandidates);
      setDocumentsProcessed(Math.floor((progress - 40) / 60 * totalDocuments));
    } else if (progress < 100) {
      setCurrentStep('Finalizing import...');
      setDocumentsProcessed(totalDocuments);
    } else {
      setCurrentStep('Import complete!');
    }
  }, [progress]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Import in Progress
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Please wait while we import your data
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="mt-4 sm:mt-6">
            <ProgressStepper steps={steps} currentStep={4} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8 lg:p-12">
          {/* Progress Circle */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Current Step */}
            <div className="mt-6 flex items-center gap-2">
              {!isComplete && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
              {isComplete && <CheckCircle className="w-5 h-5 text-green-600" />}
              <p className="text-base sm:text-lg font-medium text-gray-900">
                {currentStep}
              </p>
            </div>
          </div>

          {/* Progress Details */}
          <div className="space-y-4">
            {/* Candidates */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <span className="text-sm sm:text-base font-medium text-gray-900">
                  Candidates
                </span>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-900">
                {candidatesProcessed} / {totalCandidates}
              </span>
            </div>

            {/* Documents */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <span className="text-sm sm:text-base font-medium text-gray-900">
                  Documents
                </span>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-900">
                {documentsProcessed} / {totalDocuments}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs sm:text-sm text-yellow-800">
              ⚠️ Please do not close this window or navigate away until the import is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
