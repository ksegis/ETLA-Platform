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
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/dialog';
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
  const { currentTenant } = useTenant();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const handlePostNewJob = () => {
    router.push('/talent/jobs/new'); // Assuming a new job creation page
  };

  const handleJobAction = (jobId: string, action: 'view' | 'edit' | 'archive' | 'duplicate' | 'delete') => {
    switch (action) {
      case 'view':
        router.push(`/talent/jobs/${jobId}`); // Assuming a job details page
        break;
      case 'edit':
        router.push(`/talent/jobs/${jobId}/edit`); // Assuming a job edit page
        break;
      case 'archive':
        // Implement archive logic (e.g., update job status to 'closed')
        console.log(`Archiving job ${jobId}`);
        setJobs(prevJobs => prevJobs.map(job => job.id === jobId ? { ...job, status: 'closed' } : job));
        alert(`Job ${jobId} archived.`);
        break;
      case 'duplicate':
        const jobToDuplicate = jobs.find(job => job.id === jobId);
        if (jobToDuplicate) {
          const newJob: Job = {
            ...jobToDuplicate,
            id: String(jobs.length + 1), // Simple ID generation for mock data
            title: `${jobToDuplicate.title} (Copy)`,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            applications_count: 0,
          };
          setJobs(prevJobs => [...prevJobs, newJob]);
          alert(`Job '${jobToDuplicate.title}' duplicated successfully as a draft.`);
        }
        break;
      case 'delete':
        setJobToDelete(jobId);
        break;
      default:
        console.warn(`Unknown action: ${action} for job ${jobId}`);
    }
  };

  const confirmDeleteJob = () => {
    if (jobToDelete) {
      console.log(`Deleting job ${jobToDelete}`);
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobToDelete));
      setJobToDelete(null);
      alert(`Job ${jobToDelete} deleted.`);
    }
  };

  useEffect(() => {
    if (currentTenant?.id) {
      loadJobs();
    }
  }, [currentTenant?.id]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      // This would typically load from your jobs table
      // For now, using mock data
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          employment_type: 'full_time',
          work_mode: 'hybrid',
          salary_min: 120000,
          salary_max: 180000,
          salary_currency: 'USD',
          status: 'active',
          applications_count: 23,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z',
          hiring_manager_id: 'hm1',
          hiring_manager_name: 'John Smith',
          description: 'We are looking for a senior software engineer...',
          requirements: ['5+ years experience', 'React/Node.js', 'AWS'],
          benefits: ['Health insurance', '401k', 'Flexible hours'],
          posted_date: '2024-01-16T09:00:00Z',
          tenant_id: currentTenant?.id || ''
        },
        {
          id: '2',
          title: 'Product Manager',
          department: 'Product',
          location: 'New York, NY',
          employment_type: 'full_time',
          work_mode: 'remote',
          salary_min: 100000,
          salary_max: 140000,
          salary_currency: 'USD',
          status: 'active',
          applications_count: 15,
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-18T16:45:00Z',
          hiring_manager_id: 'hm2',
          hiring_manager_name: 'Sarah Johnson',
          description: 'Seeking an experienced product manager...',
          requirements: ['3+ years PM experience', 'Agile/Scrum', 'Analytics'],
          benefits: ['Health insurance', 'Stock options', 'Remote work'],
          posted_date: '2024-01-12T09:00:00Z',
          tenant_id: currentTenant?.id || ''
        },
        {
          id: '3',
          title: 'UX Designer',
          department: 'Design',
          location: 'Austin, TX',
          employment_type: 'full_time',
          work_mode: 'onsite',
          salary_min: 80000,
          salary_max: 110000,
          salary_currency: 'USD',
          status: 'paused',
          applications_count: 8,
          created_at: '2024-01-05T10:00:00Z',
          updated_at: '2024-01-22T11:20:00Z',
          hiring_manager_id: 'hm3',
          hiring_manager_name: 'Mike Chen',
          description: 'Looking for a creative UX designer...',
          requirements: ['Portfolio required', 'Figma/Sketch', 'User research'],
          benefits: ['Health insurance', 'Design budget', 'Learning stipend'],
          posted_date: '2024-01-08T09:00:00Z',
          tenant_id: currentTenant?.id || ''
        }
      ];
      
      setJobs(mockJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs
  const filteredJobs = React.useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [jobs, searchTerm, statusFilter, departmentFilter]);

  // Get unique departments
  const departments = React.useMemo(() => {
    return Array.from(new Set(jobs.map(job => job.department)));
  }, [jobs]);

  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `${formatter.format(min)}+`;
    } else {
      return `Up to ${formatter.format(max!)}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600">Manage your job postings and requirements</p>
          </div>
          <Button 
            onClick={handlePostNewJob}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <Briefcase className="h-6 w-6 text-blue-500 mt-1" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <Badge className={JOB_STATUS_COLORS[job.status]}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                        {job.applications_count > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.applications_count} applications
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="h-4 w-4" />
                          {job.department}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {job.location} • {WORK_MODE_LABELS[job.work_mode]}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Posted: {job.posted_date ? formatDate(job.posted_date) : 'Not posted'}</span>
                        <span>•</span>
                        <span>Hiring Manager: {job.hiring_manager_name}</span>
                        <span>•</span>
                        <span>Updated: {formatDate(job.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/talent/pipeline/${job.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Pipeline
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleJobAction(job.id, 'view')}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleJobAction(job.id, 'edit')}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Job Actions</AlertDialogTitle>
                        <AlertDialogDescription>
                          Select an action for this job posting.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" onClick={() => handleJobAction(job.id, 'archive')}>Archive</Button>
                        <Button variant="outline" onClick={() => handleJobAction(job.id, 'duplicate')}>Duplicate</Button>
                        <Button variant="destructive" onClick={() => handleJobAction(job.id, 'delete')}>Delete</Button>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}

          {filteredJobs.length === 0 && (
            <Card className="p-12">
              <div className="text-center text-gray-500">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Jobs Found</h3>
                <p className="mb-4">
                  {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                    ? 'No jobs match your current filters.'
                    : 'Get started by posting your first job.'
                  }
                </p>
                <Button 
                  onClick={handlePostNewJob}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Post Your First Job
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Summary Stats */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {jobs.filter(j => j.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Active Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {jobs.reduce((sum, job) => sum + job.applications_count, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {jobs.filter(j => j.status === 'draft').length}
              </p>
              <p className="text-sm text-gray-600">Draft Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {departments.length}
              </p>
              <p className="text-sm text-gray-600">Departments Hiring</p>
            </div>
          </div>
        </Card>

        <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the job posting 
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteJob}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
