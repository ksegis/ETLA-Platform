'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign,
  Clock,
  Star,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

// Application stages
const PIPELINE_STAGES = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-100 text-blue-800', count: 0 },
  { id: 'screening', name: 'Screening', color: 'bg-yellow-100 text-yellow-800', count: 0 },
  { id: 'interview', name: 'Interview', color: 'bg-purple-100 text-purple-800', count: 0 },
  { id: 'assessment', name: 'Assessment', color: 'bg-orange-100 text-orange-800', count: 0 },
  { id: 'reference', name: 'Reference Check', color: 'bg-indigo-100 text-indigo-800', count: 0 },
  { id: 'offer', name: 'Offer', color: 'bg-green-100 text-green-800', count: 0 },
  { id: 'hired', name: 'Hired', color: 'bg-emerald-100 text-emerald-800', count: 0 },
  { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-800', count: 0 }
];

// Mock application data
const MOCK_APPLICATIONS = [
  {
    id: '1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@email.com',
    candidatePhone: '+1 (555) 123-4567',
    jobTitle: 'Senior Software Engineer',
    jobId: 'job-1',
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
    jobTitle: 'Product Manager',
    jobId: 'job-2',
    stage: 'screening',
    appliedDate: '2024-09-18',
    lastActivity: '2024-09-24',
    rating: 5,
    location: 'New York, NY',
    expectedSalary: 140000,
    experience: '7 years',
    skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
    notes: 'Exceptional product sense, proven track record',
    resumeUrl: '/resumes/michael-chen.pdf',
    source: 'Company Website'
  },
  {
    id: '3',
    candidateName: 'Emily Rodriguez',
    candidateEmail: 'emily.rodriguez@email.com',
    candidatePhone: '+1 (555) 345-6789',
    jobTitle: 'UX Designer',
    jobId: 'job-3',
    stage: 'interview',
    appliedDate: '2024-09-15',
    lastActivity: '2024-09-23',
    rating: 4,
    location: 'Austin, TX',
    expectedSalary: 95000,
    experience: '4 years',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    notes: 'Creative portfolio, user-centered approach',
    resumeUrl: '/resumes/emily-rodriguez.pdf',
    source: 'Referral'
  },
  {
    id: '4',
    candidateName: 'David Kim',
    candidateEmail: 'david.kim@email.com',
    candidatePhone: '+1 (555) 456-7890',
    jobTitle: 'Data Scientist',
    jobId: 'job-4',
    stage: 'assessment',
    appliedDate: '2024-09-12',
    lastActivity: '2024-09-22',
    rating: 5,
    location: 'Seattle, WA',
    expectedSalary: 130000,
    experience: '6 years',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
    notes: 'PhD in Statistics, published research',
    resumeUrl: '/resumes/david-kim.pdf',
    source: 'Indeed'
  },
  {
    id: '5',
    candidateName: 'Lisa Thompson',
    candidateEmail: 'lisa.thompson@email.com',
    candidatePhone: '+1 (555) 567-8901',
    jobTitle: 'Marketing Manager',
    jobId: 'job-5',
    stage: 'reference',
    appliedDate: '2024-09-10',
    lastActivity: '2024-09-21',
    rating: 4,
    location: 'Chicago, IL',
    expectedSalary: 85000,
    experience: '5 years',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    notes: 'Strong campaign results, creative thinker',
    resumeUrl: '/resumes/lisa-thompson.pdf',
    source: 'Glassdoor'
  },
  {
    id: '6',
    candidateName: 'James Wilson',
    candidateEmail: 'james.wilson@email.com',
    candidatePhone: '+1 (555) 678-9012',
    jobTitle: 'DevOps Engineer',
    jobId: 'job-6',
    stage: 'offer',
    appliedDate: '2024-09-08',
    lastActivity: '2024-09-20',
    rating: 5,
    location: 'Denver, CO',
    expectedSalary: 115000,
    experience: '6 years',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform'],
    notes: 'Excellent infrastructure knowledge, team player',
    resumeUrl: '/resumes/james-wilson.pdf',
    source: 'LinkedIn'
  }
];

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobTitle: string;
  jobId: string;
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

export default function PipelinePage() {
  const { selectedTenant } = useTenant();
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [draggedApplication, setDraggedApplication] = useState<Application | null>(null);

  // Calculate stage counts
  const stageData = PIPELINE_STAGES.map(stage => ({
    ...stage,
    count: applications.filter(app => app.stage === stage.id).length
  }));

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = jobFilter === 'all' || app.jobId === jobFilter;
    return matchesSearch && matchesJob;
  });

  // Get unique jobs for filter
  const uniqueJobs = Array.from(new Set(applications.map(app => ({ id: app.jobId, title: app.jobTitle }))));

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, application: Application) => {
    setDraggedApplication(application);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (draggedApplication && draggedApplication.stage !== targetStage) {
      setApplications(prev => 
        prev.map(app => 
          app.id === draggedApplication.id 
            ? { ...app, stage: targetStage, lastActivity: new Date().toISOString().split('T')[0] }
            : app
        )
      );
    }
    setDraggedApplication(null);
  };

  // Handle stage change
  const handleStageChange = (applicationId: string, newStage: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, stage: newStage, lastActivity: new Date().toISOString().split('T')[0] }
          : app
      )
    );
  };

  // Format salary
  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Render star rating
  const renderRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruitment Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Manage candidate applications through your hiring process
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search candidates, jobs, or emails..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {uniqueJobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {stageData.map((stage) => (
          <div
            key={stage.id}
            className="min-h-[600px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {stage.name}
                  </CardTitle>
                  <Badge variant="secondary" className={stage.color}>
                    {stage.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-3">
                {filteredApplications
                  .filter(app => app.stage === stage.id)
                  .map((application) => (
                    <Card
                      key={application.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, application)}
                      onClick={() => {
                        setSelectedApplication(application);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm text-gray-900 leading-tight">
                              {application.candidateName}
                            </h4>
                            <div className="flex">
                              {renderRating(application.rating)}
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 font-medium">
                            {application.jobTitle}
                          </p>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {application.location}
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <DollarSign className="h-3 w-3" />
                            {formatSalary(application.expectedSalary)}
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {application.experience}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {application.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs px-1 py-0">
                                {skill}
                              </Badge>
                            ))}
                            {application.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{application.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-gray-500">
                              {new Date(application.lastActivity).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {application.source}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Application Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  {selectedApplication.candidateName}
                  <Badge className={stageData.find(s => s.id === selectedApplication.stage)?.color}>
                    {stageData.find(s => s.id === selectedApplication.stage)?.name}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Application Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Position</Label>
                          <p className="text-sm text-gray-900">{selectedApplication.jobTitle}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Applied Date</Label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedApplication.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Location</Label>
                          <p className="text-sm text-gray-900">{selectedApplication.location}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Expected Salary</Label>
                          <p className="text-sm text-gray-900">{formatSalary(selectedApplication.expectedSalary)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Experience</Label>
                          <p className="text-sm text-gray-900">{selectedApplication.experience}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Source</Label>
                          <p className="text-sm text-gray-900">{selectedApplication.source}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedApplication.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Notes</Label>
                        <p className="text-sm text-gray-900 mt-1">{selectedApplication.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Stage Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stage Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Current Stage</Label>
                          <Select
                            value={selectedApplication.stage}
                            onValueChange={(value: string) => handleStageChange(selectedApplication.id, value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PIPELINE_STAGES.map((stage) => (
                                <SelectItem key={stage.id} value={stage.id}>
                                  {stage.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Move Forward
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Contact & Actions */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a 
                          href={`mailto:${selectedApplication.candidateEmail}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {selectedApplication.candidateEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a 
                          href={`tel:${selectedApplication.candidatePhone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {selectedApplication.candidatePhone}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {renderRating(selectedApplication.rating)}
                        <span className="text-sm text-gray-600 ml-2">
                          {selectedApplication.rating}/5
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
