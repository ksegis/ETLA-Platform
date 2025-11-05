/**
 * Resumes Page
 * Centralized view of all candidate resumes with search and download functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  Download,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Filter,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Document {
  fileName: string;
  url: string;
  type: string;
  uploadedDate?: string;
}

interface CandidateResume {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  location: string;
  status: string;
  documents: Document[];
  addedDate: string;
  lastContact?: string;
}

// Mock data - in production, this would come from your database
const MOCK_RESUMES: CandidateResume[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    title: 'Senior Software Engineer',
    location: 'Tampa, FL',
    status: 'Active',
    documents: [
      { fileName: 'sarah-johnson-resume.pdf', url: '/resumes/sarah-johnson.pdf', type: 'application/pdf', uploadedDate: '2024-09-15' },
      { fileName: 'sarah-johnson-coverletter.docx', url: '/resumes/sarah-johnson-coverletter.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadedDate: '2024-09-15' },
    ],
    addedDate: '2024-09-15',
    lastContact: '2024-09-20'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    title: 'Product Manager',
    location: 'Miami, FL',
    status: 'Active',
    documents: [
      { fileName: 'michael-chen-resume.pdf', url: '/resumes/michael-chen.pdf', type: 'application/pdf', uploadedDate: '2024-09-10' },
      { fileName: 'michael-chen-portfolio.pdf', url: '/resumes/michael-chen-portfolio.pdf', type: 'application/pdf', uploadedDate: '2024-09-10' },
    ],
    addedDate: '2024-09-10',
    lastContact: '2024-09-18'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    title: 'UX Designer',
    location: 'Orlando, FL',
    status: 'Active',
    documents: [
      { fileName: 'emily-rodriguez-resume.pdf', url: '/resumes/emily-rodriguez.pdf', type: 'application/pdf', uploadedDate: '2024-09-12' },
    ],
    addedDate: '2024-09-12',
    lastContact: '2024-09-19'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 456-7890',
    title: 'Data Scientist',
    location: 'Jacksonville, FL',
    status: 'Active',
    documents: [
      { fileName: 'david-kim-resume.pdf', url: '/resumes/david-kim.pdf', type: 'application/pdf', uploadedDate: '2024-09-08' },
      { fileName: 'david-kim-research-papers.pdf', url: '/resumes/david-kim-research.pdf', type: 'application/pdf', uploadedDate: '2024-09-08' },
    ],
    addedDate: '2024-09-08',
    lastContact: '2024-09-17'
  },
  {
    id: '5',
    name: 'Jessica Martinez',
    email: 'jessica.martinez@email.com',
    phone: '+1 (555) 567-8901',
    title: 'Marketing Manager',
    location: 'Tampa, FL',
    status: 'Interviewed',
    documents: [
      { fileName: 'jessica-martinez-resume.pdf', url: '/resumes/jessica-martinez.pdf', type: 'application/pdf', uploadedDate: '2024-09-14' },
    ],
    addedDate: '2024-09-14',
    lastContact: '2024-09-21'
  }
];

export default function ResumesPage() {
  const { selectedTenant } = useTenant();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<CandidateResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  useEffect(() => {
    // In production, fetch from API
    setResumes(MOCK_RESUMES);
    setLoading(false);
  }, [selectedTenant?.id]);

  // Filter resumes based on search and filters
  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = 
      resume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.documents.some(doc => doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || resume.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || resume.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations for filter
  const uniqueLocations = Array.from(new Set(resumes.map(r => r.location)));

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(resumes.map(r => r.status)));

  const handleDownload = (document: Document, candidateName: string) => {
    // In production, this would download from Supabase storage
    console.log(`Downloading ${document.fileName} for ${candidateName}`);
    // Simulate download
    window.open(document.url, '_blank');
  };

  const handleDownloadAll = (candidate: CandidateResume) => {
    // Download all documents for a candidate
    candidate.documents.forEach(doc => {
      handleDownload(doc, candidate.name);
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading resumes...</div>
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
            <Link href="/talent/candidates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidates
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Resumes</h1>
              <p className="text-gray-500 mt-1">
                View and download all candidate documents
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredResumes.length} of {resumes.length} candidates
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, title, or document name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumes List */}
        {filteredResumes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredResumes.map(candidate => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    {/* Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                            <Badge variant={candidate.status === 'Active' ? 'default' : 'secondary'}>
                              {candidate.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{candidate.title}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {candidate.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {candidate.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {candidate.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Added {new Date(candidate.addedDate).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Documents List */}
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">
                                Documents ({candidate.documents.length})
                              </h4>
                              {candidate.documents.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadAll(candidate)}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download All
                                </Button>
                              )}
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                              {candidate.documents.map((doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {doc.fileName}
                                      </p>
                                      {doc.uploadedDate && (
                                        <p className="text-xs text-gray-500">
                                          Uploaded {new Date(doc.uploadedDate).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownload(doc, candidate.name)}
                                    className="flex-shrink-0"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="ml-4">
                      <Link href={`/talent/candidates?search=${encodeURIComponent(candidate.name)}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
