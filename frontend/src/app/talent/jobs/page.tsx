/**
 * Jobs Management Page
 * Handles job posting, editing, and management for the ATS
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  MoreVertical,
  Archive,
  Copy
} from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  work_mode: 'remote' | 'hybrid' | 'onsite';
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  status: 'draft' | 'active' | 'paused' | 'closed';
  applications_count: number;
  created_at: string;
  updated_at: string;
  hiring_manager_id: string;
  hiring_manager_name?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  posted_date?: string;
  closing_date?: string;
  tenant_id: string;
}

const JOB_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-red-100 text-red-800'
};

const EMPLOYMENT_TYPE_LABELS = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship'
};

const WORK_MODE_LABELS = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site'
};

export default function JobsPage() {
  const { selectedTenant } = useTenant();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setloading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  useEffect(() => {
    if (selectedTenant?.id) {
      loadJobs();
    }
  }, [selectedTenant?.id]);

  const loadJobs = async () => {
    try {
      setloading(true);
      
      // This would typically load from your jobs table
      // For now, using mock data
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Full Stack Developer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          employment_type: 'full_time',
          work_mode: 'hybrid',
          salary_min: 120000,
          salary_max: 180000,
          salary_currency: 'USD',
          status: 'active',
          applications_count: 24,
          created_at: '2024-01-10',
          updated_at: '2024-01-15',
          hiring_manager_id: 'hm1',
          hiring_manager_name: 'Sarah Johnson',
          description: 'We are looking for a Senior Full Stack Developer to join our growing engineering team.',
          requirements: ['5+ years experience', 'React/Node.js', 'TypeScript'],
          benefits: ['Health Insurance', '401k', 'Remote Work'],
          posted_date: '2024-01-12',
          tenant_id: selectedTenant?.id || ''
        },
        {
          id: '2',
          title: 'Product Manager',
          department: 'Product',
          location: 'New York, NY',
          employment_type: 'full_time',
          work_mode: 'onsite',
          salary_min: 100000,
          salary_max: 140000,
          salary_currency: 'USD',
          status: 'active',
          applications_count: 18,
          created_at: '2024-01-08',
          updated_at: '2024-01-14',
          hiring_manager_id: 'hm2',
          hiring_manager_name: 'Michael Chen',
          description: 'Seeking an experienced Product Manager to drive product strategy and execution.',
          requirements: ['3+ years PM experience', 'Agile methodology', 'Data-driven'],
          benefits: ['Health Insurance', 'Stock Options', 'Flexible PTO'],
          posted_date: '2024-01-10',
          tenant_id: selectedTenant?.id || ''
        },
        {
          id: '3',
          title: 'UX Designer',
          department: 'Design',
          location: 'Remote',
          employment_type: 'full_time',
          work_mode: 'remote',
          salary_min: 80000,
          salary_max: 120000,
          salary_currency: 'USD',
          status: 'draft',
          applications_count: 0,
          created_at: '2024-01-16',
          updated_at: '2024-01-16',
          hiring_manager_id: 'hm3',
          hiring_manager_name: 'Emily Davis',
          description: 'Looking for a creative UX Designer to enhance our user experience.',
          requirements: ['Portfolio required', 'Figma proficiency', 'User research experience'],
          benefits: ['Health Insurance', 'Remote Work', 'Learning Budget'],
          tenant_id: selectedTenant?.id || ''
        }
      ];

      setJobs(mockJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setloading(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments
  const departments = Array.from(new Set(jobs.map(job => job.department)));

  const handleJobAction = async (action: string, job: Job) => {
    setSelectedJob(job);
    
    switch (action) {
      case 'archive':
        setShowArchiveDialog(true);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
      case 'duplicate':
        await handleDuplicateJob(job);
        break;
    }
  };

  const handleArchiveJob = async () => {
    if (!selectedJob) return;
    
    try {
      // Update job status to closed
      const updatedJobs = jobs.map(job => 
        job.id === selectedJob.id ? { ...job, status: 'closed' as const } : job
      );
      setJobs(updatedJobs);
      
      setShowArchiveDialog(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Error archiving job:', error);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    
    try {
      // Remove job from list
      const updatedJobs = jobs.filter(job => job.id !== selectedJob.id);
      setJobs(updatedJobs);
      
      setShowDeleteDialog(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleDuplicateJob = async (job: Job) => {
    try {
      const duplicatedJob: Job = {
        ...job,
        id: `${job.id}-copy-${Date.now()}`,
        title: `${job.title} (Copy)`,
        status: 'draft',
        applications_count: 0,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
        posted_date: undefined
      };
      
      setJobs(prev => [duplicatedJob, ...prev]);
    } catch (error) {
      console.error('Error duplicating job:', error);
    }
  };

  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `${formatter.format(min)}+`;
    } else {
      return `Up to ${formatter.format(max!)}`;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="mt-2 text-gray-600">
              Manage job postings and track applications
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/talent/pipeline">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Pipeline
              </Button>
            </Link>
            <Link href="/talent/jobs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Job title, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Jobs List */}
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <Badge className={JOB_STATUS_COLORS[job.status]}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applications_count} applications</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{EMPLOYMENT_TYPE_LABELS[job.employment_type]}</span>
                      <span>•</span>
                      <span>{WORK_MODE_LABELS[job.work_mode]}</span>
                      <span>•</span>
                      <span>Posted {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Not posted'}</span>
                      {job.hiring_manager_name && (
                        <>
                          <span>•</span>
                          <span>Hiring Manager: {job.hiring_manager_name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/talent/pipeline/${job.id}`}>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-1" />
                        Pipeline
                      </Button>
                    </Link>
                    <Link href={`/talent/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/talent/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    
                    {/* More Options Dropdown */}
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Toggle dropdown - in a real implementation, you'd use a proper dropdown component
                          const dropdown = document.getElementById(`dropdown-${job.id}`);
                          if (dropdown) {
                            dropdown.classList.toggle('hidden');
                          }
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      
                      <div
                        id={`dropdown-${job.id}`}
                        className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => handleJobAction('archive', job)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </button>
                          <button
                            onClick={() => handleJobAction('duplicate', job)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleJobAction('delete', job)}
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by posting your first job.'}
              </p>
              {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && (
                <Link href="/talent/jobs/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive "{selectedJob?.title}"? This will close the job and stop accepting new applications.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowArchiveDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleArchiveJob}>
                Archive Job
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete "{selectedJob?.title}"? This action cannot be undone and will remove all associated applications.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteJob}>
                Delete Job
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
