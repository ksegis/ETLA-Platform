/**
 * Pipeline Page for Specific Job
 * Displays candidate pipeline for a specific job posting
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Search, 
  ArrowLeft,
  User, 
  Calendar, 
  MapPin, 
  DollarSign,
  Star,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import Link from 'next/link';

// Application stages
const PIPELINE_STAGES = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { id: 'screening', name: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'interview', name: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { id: 'assessment', name: 'Assessment', color: 'bg-orange-100 text-orange-800' },
  { id: 'reference', name: 'Reference Check', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'offer', name: 'Offer', color: 'bg-green-100 text-green-800' },
  { id: 'hired', name: 'Hired', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-800' }
];

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  stage: string;
  appliedDate: string;
  lastActivity: string;
  rating: number;
  location: string;
  expectedSalary: number;
  experience: string;
  skills: string[];
  notes: string;
  resumeUrl: string;
  source: string;
}

// Mock applications - filtered by job
const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@email.com',
    candidatePhone: '+1 (555) 123-4567',
    stage: 'applied',
    appliedDate: '2024-09-20',
    lastActivity: '2024-09-25',
    rating: 4,
    location: 'San Francisco, CA',
    expectedSalary: 120000,
    experience: '5 years',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    notes: 'Strong technical background, excellent communication skills',
    resumeUrl: '/resumes/sarah-johnson.pdf',
    source: 'LinkedIn'
  },
  {
    id: '2',
    candidateName: 'Michael Chen',
    candidateEmail: 'michael.chen@email.com',
    candidatePhone: '+1 (555) 234-5678',
    stage: 'screening',
    appliedDate: '2024-09-18',
    lastActivity: '2024-09-24',
    rating: 5,
    location: 'San Francisco, CA',
    expectedSalary: 140000,
    experience: '7 years',
    skills: ['JavaScript', 'Python', 'Docker', 'Kubernetes'],
    notes: 'Exceptional technical skills, proven track record',
    resumeUrl: '/resumes/michael-chen.pdf',
    source: 'Company Website'
  },
  {
    id: '3',
    candidateName: 'Emily Rodriguez',
    candidateEmail: 'emily.rodriguez@email.com',
    candidatePhone: '+1 (555) 345-6789',
    stage: 'interview',
    appliedDate: '2024-09-15',
    lastActivity: '2024-09-23',
    rating: 4,
    location: 'San Francisco, CA',
    expectedSalary: 95000,
    experience: '4 years',
    skills: ['React', 'Vue.js', 'CSS', 'UI/UX'],
    notes: 'Creative approach, user-centered mindset',
    resumeUrl: '/resumes/emily-rodriguez.pdf',
    source: 'Referral'
  },
  {
    id: '4',
    candidateName: 'David Kim',
    candidateEmail: 'david.kim@email.com',
    candidatePhone: '+1 (555) 456-7890',
    stage: 'assessment',
    appliedDate: '2024-09-12',
    lastActivity: '2024-09-22',
    rating: 5,
    location: 'Remote',
    expectedSalary: 130000,
    experience: '6 years',
    skills: ['Node.js', 'GraphQL', 'MongoDB', 'Redis'],
    notes: 'Strong backend experience, scalability expert',
    resumeUrl: '/resumes/david-kim.pdf',
    source: 'Indeed'
  }
];

export default function JobPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const { selectedTenant } = useTenant();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Developer');

  useEffect(() => {
    // In production, fetch applications for this specific job from API
    // For now, use mock data
    setApplications(MOCK_APPLICATIONS);
    setLoading(false);
  }, [params.id]);

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStage = selectedStage === 'all' || app.stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  // Count applications per stage
  const stageCounts = PIPELINE_STAGES.map(stage => ({
    ...stage,
    count: applications.filter(app => app.stage === stage.id).length
  }));

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading pipeline...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Candidate Pipeline</h1>
              <p className="text-gray-500 mt-1">{jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/talent/jobs/${params.id}`}>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Job Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Stage Overview */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
          {stageCounts.map(stage => (
            <Card 
              key={stage.id}
              className={`cursor-pointer transition-all ${
                selectedStage === stage.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedStage(selectedStage === stage.id ? 'all' : stage.id)}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stage.count}</div>
                  <div className="text-xs text-gray-500 mt-1">{stage.name}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {selectedStage !== 'all' && (
                <Button variant="outline" onClick={() => setSelectedStage('all')}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-sm text-gray-500">
                {selectedStage !== 'all' 
                  ? 'No candidates in this stage yet' 
                  : 'Try adjusting your search term'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(application => {
              const stage = PIPELINE_STAGES.find(s => s.id === application.stage);
              return (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{application.candidateName}</h3>
                              {stage && (
                                <Badge className={stage.color}>
                                  {stage.name}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {application.candidateEmail}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {application.candidatePhone}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {application.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Applied {new Date(application.appliedDate).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span>${application.expectedSalary.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {renderRating(application.rating)}
                              </div>
                              <div className="text-gray-500">
                                {application.experience} experience
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-3">
                              {application.skills.map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            {application.notes && (
                              <div className="mt-3 text-sm text-gray-600 italic">
                                "{application.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <a 
                          href={application.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                        </a>
                        <Link href={`/talent/candidates?search=${encodeURIComponent(application.candidateName)}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
