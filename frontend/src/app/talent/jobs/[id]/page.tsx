/**
 * Job Detail Page
 * Displays full details of a specific job posting
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTenant } from '@/contexts/TenantContext';
import {
  ArrowLeft,
  Edit,
  Users,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  work_mode: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  status: string;
  applications_count: number;
  created_at: string;
  updated_at: string;
  hiring_manager_name?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  posted_date?: string;
  closing_date?: string;
}

const MOCK_JOB: Job = {
  id: '1',
  title: 'Senior Full Stack Developer',
  department: 'Engineering',
  location: 'San Francisco, CA',
  employment_type: 'Full Time',
  work_mode: 'Hybrid',
  salary_min: 120000,
  salary_max: 180000,
  salary_currency: 'USD',
  status: 'Active',
  applications_count: 24,
  created_at: '2024-01-11',
  updated_at: '2024-01-11',
  hiring_manager_name: 'Sarah Johnson',
  description: `We are seeking an experienced Senior Full Stack Developer to join our growing engineering team. 
  
  In this role, you will be responsible for designing, developing, and maintaining our web applications using modern technologies. You'll work closely with product managers, designers, and other engineers to deliver high-quality software solutions.
  
  The ideal candidate has strong experience with both frontend and backend development, excellent problem-solving skills, and a passion for creating exceptional user experiences.`,
  requirements: [
    '5+ years of professional software development experience',
    'Strong proficiency in React, TypeScript, and Node.js',
    'Experience with cloud platforms (AWS, Azure, or GCP)',
    'Solid understanding of RESTful APIs and microservices architecture',
    'Experience with SQL and NoSQL databases',
    'Excellent communication and collaboration skills',
    'Bachelor\'s degree in Computer Science or related field (or equivalent experience)'
  ],
  benefits: [
    'Competitive salary and equity package',
    'Comprehensive health, dental, and vision insurance',
    '401(k) with company match',
    'Flexible work arrangements',
    'Professional development budget',
    'Unlimited PTO',
    'Modern office with free snacks and drinks'
  ],
  posted_date: '2024-01-11',
  closing_date: '2024-03-11'
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedTenant } = useTenant();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch job from API
    // For now, use mock data
    setJob(MOCK_JOB);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading job details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-gray-500 mb-4">Job not found</div>
          <Link href="/talent/jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/talent/jobs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-500 mt-1">{job.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/talent/pipeline/${job.id}`}>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                View Pipeline ({job.applications_count})
              </Button>
            </Link>
            <Link href={`/talent/jobs/${job.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-4">
          <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
            {job.status}
          </Badge>
          <span className="text-sm text-gray-500">
            {job.applications_count} applications
          </span>
        </div>

        {/* Job Details Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Location</div>
                    <div className="text-sm text-gray-900">{job.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Employment Type</div>
                    <div className="text-sm text-gray-900">{job.employment_type} • {job.work_mode}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Salary Range</div>
                    <div className="text-sm text-gray-900">
                      ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()} {job.salary_currency}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Posted Date</div>
                    <div className="text-sm text-gray-900">
                      {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Not posted yet'}
                    </div>
                  </div>
                </div>
                {job.closing_date && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Closing Date</div>
                      <div className="text-sm text-gray-900">
                        {new Date(job.closing_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
                {job.hiring_manager_name && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Hiring Manager</div>
                      <div className="text-sm text-gray-900">{job.hiring_manager_name}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Description Card */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {job.description}
                </div>
              </CardContent>
            </Card>

            {/* Requirements Card */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
