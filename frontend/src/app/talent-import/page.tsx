'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Briefcase, FileText, HelpCircle } from 'lucide-react';
import TourOverlay, { useTour, TourStep } from '@/components/TourOverlay';

interface ImportType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const importTypes: ImportType[] = [
  {
    id: 'candidates',
    title: 'Candidates',
    description: 'Import candidate profiles with resumes, certificates, and other documents',
    icon: <Users className="w-12 h-12" />,
    route: '/talent-import/candidates',
    color: 'blue',
  },
  {
    id: 'jobs',
    title: 'Jobs',
    description: 'Import job requisitions with job descriptions and requirements',
    icon: <Briefcase className="w-12 h-12" />,
    route: '/talent-import/jobs',
    color: 'green',
  },
  {
    id: 'applications',
    title: 'Applications',
    description: 'Import job applications linking candidates to specific job openings',
    icon: <FileText className="w-12 h-12" />,
    route: '/talent-import/applications',
    color: 'purple',
  },
];

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="page-title"]',
    title: 'Welcome to Talent Data Import',
    content: 'This tool allows you to bulk import candidates, jobs, and applications with their associated documents. Let\'s walk through how to use it!',
    position: 'bottom',
  },
  {
    target: '[data-tour="import-type-candidates"]',
    title: 'Import Candidates',
    content: 'Click here to import candidate profiles along with their resumes, certificates, and other documents. You can upload hundreds of candidates at once.',
    position: 'bottom',
  },
  {
    target: '[data-tour="import-type-jobs"]',
    title: 'Import Jobs',
    content: 'Use this option to import job requisitions with job descriptions, requirements, and other job-related documents.',
    position: 'bottom',
  },
  {
    target: '[data-tour="import-type-applications"]',
    title: 'Import Applications',
    content: 'Import job applications that link candidates to specific jobs. This is useful when migrating from another ATS system.',
    position: 'bottom',
  },
  {
    target: '[data-tour="help-section"]',
    title: 'Need Help?',
    content: 'You can always restart this tour or download template files from the help section. Click "Start Tour" anytime to see this walkthrough again.',
    position: 'left',
  },
];

export default function TalentImportPage() {
  const router = useRouter();
  const { isTourOpen, startTour, closeTour } = useTour('talent-import-main');

  const handleSelectType = (route: string) => {
    router.push(route);
  };

  const downloadCandidatesTemplate = () => {
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

  const downloadJobsTemplate = () => {
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

  const downloadApplicationsTemplate = () => {
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

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      green: {
        bg: 'bg-green-50',
        hover: 'hover:bg-green-100',
        border: 'border-green-200',
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700',
      },
      purple: {
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div data-tour="page-title">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Talent Data Import
            </h1>
            <p className="text-gray-600">
              Bulk import candidates, jobs, and applications with their associated documents
            </p>
          </div>

          {/* Help Section */}
          <div data-tour="help-section" className="flex items-center gap-2">
            <button
              onClick={startTour}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Start Tour
            </button>
          </div>
        </div>

        {/* Import Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {importTypes.map((type) => {
            const colors = getColorClasses(type.color);
            return (
              <div
                key={type.id}
                data-tour={`import-type-${type.id}`}
                className={`${colors.bg} ${colors.hover} ${colors.border} border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer group`}
                onClick={() => handleSelectType(type.route)}
              >
                {/* Icon */}
                <div className={`${colors.icon} mb-4 group-hover:scale-110 transition-transform`}>
                  {type.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {type.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {type.description}
                </p>

                {/* Button */}
                <button
                  className={`w-full ${colors.button} text-white font-medium py-2 px-4 rounded-lg transition-colors`}
                >
                  Select
                </button>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <h3 className="font-medium text-gray-900">Upload Data</h3>
              </div>
              <p className="text-sm text-gray-600 ml-10">
                Upload your CSV/Excel file with candidate or job data, along with any associated documents
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <h3 className="font-medium text-gray-900">Map & Review</h3>
              </div>
              <p className="text-sm text-gray-600 ml-10">
                Our system auto-matches documents to records. Review and adjust mappings as needed
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <h3 className="font-medium text-gray-900">Import</h3>
              </div>
              <p className="text-sm text-gray-600 ml-10">
                Start the import and track progress in real-time. Download detailed reports when complete
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">📋 Quick Links</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadCandidatesTemplate}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Download Candidates Template
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={downloadJobsTemplate}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Download Jobs Template
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={downloadApplicationsTemplate}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Download Applications Template
            </button>
            <span className="text-gray-300">|</span>
            <a
              href="https://help.manus.im"
              target="_blank"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Tour Overlay */}
      <TourOverlay
        steps={tourSteps}
        isOpen={isTourOpen}
        onClose={closeTour}
        tourKey="talent-import-main"
      />
    </div>
  );
}
