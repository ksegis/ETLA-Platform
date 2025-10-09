/**
 * ATS Candidates Management Component
 * Features: Comprehensive candidate profiles, search, filtering, and bulk operations
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Download,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  DollarSign,
  CheckSquare,
  Square,
  MoreHorizontal,
  User,
  Building,
  Globe,
  LinkedinIcon,
  Github,
  ExternalLink,
  Tag,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  current_position?: string;
  current_company?: string;
  experience_years: number;
  education: string;
  skills: string[];
  rating: number;
  status: 'active' | 'on_hold' | 'rejected' | 'hired';
  source: string;
  applied_date: string;
  last_activity: string;
  salary_expectation?: number;
  availability: string;
  notes?: string;
  resume_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  tags: string[];
  applications: Array<{
    job_id: string;
    job_title: string;
    stage: string;
    applied_date: string;
  }>;
  interviews: Array<{
    id: string;
    type: string;
    date: string;
    status: string;
    feedback?: string;
  }>;
}

interface CandidatesManagementProps {
  onCandidateSelect?: (candidate: Candidate) => void;
  onCandidateEdit?: (candidate: Candidate) => void;
  onBulkAction?: (action: string, candidateIds: string[]) => void;
  showBulkActions?: boolean;
  viewMode?: 'grid' | 'list';
  jobId?: string;
}

export default function CandidatesManagement({
  onCandidateSelect,
  onCandidateEdit,
  onBulkAction,
  showBulkActions = true,
  viewMode = 'list',
  jobId
}: CandidatesManagementProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'applied_date' | 'experience_years'>('applied_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const mockCandidates: Candidate[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      current_position: 'Senior Software Engineer',
      current_company: 'Tech Corp',
      experience_years: 5,
      education: 'BS Computer Science - Stanford University',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Python', 'Docker'],
      rating: 4,
      status: 'active',
      source: 'LinkedIn',
      applied_date: '2024-01-15T10:30:00Z',
      last_activity: '2024-01-20T14:20:00Z',
      salary_expectation: 150000,
      availability: 'Immediate',
      resume_url: '/resumes/alice_johnson.pdf',
      linkedin_url: 'https://linkedin.com/in/alicejohnson',
      github_url: 'https://github.com/alicejohnson',
      tags: ['senior', 'full-stack', 'remote-ok'],
      applications: [
        {
          job_id: 'job1',
          job_title: 'Senior Software Engineer',
          stage: 'technical_interview',
          applied_date: '2024-01-15T10:30:00Z'
        }
      ],
      interviews: [
        {
          id: 'int1',
          type: 'Phone Screening',
          date: '2024-01-18T15:00:00Z',
          status: 'completed',
          feedback: 'Strong technical background, good communication skills'
        }
      ]
    },
    {
      id: '2',
      name: 'Bob Chen',
      email: 'bob.chen@email.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      current_position: 'Lead Developer',
      current_company: 'StartupXYZ',
      experience_years: 7,
      education: 'MS Computer Science - MIT',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes', 'GCP'],
      rating: 5,
      status: 'active',
      source: 'Indeed',
      applied_date: '2024-01-12T09:15:00Z',
      last_activity: '2024-01-19T11:30:00Z',
      salary_expectation: 160000,
      availability: '2 weeks notice',
      resume_url: '/resumes/bob_chen.pdf',
      linkedin_url: 'https://linkedin.com/in/bobchen',
      portfolio_url: 'https://bobchen.dev',
      tags: ['lead', 'backend', 'microservices'],
      applications: [
        {
          job_id: 'job1',
          job_title: 'Senior Software Engineer',
          stage: 'final_interview',
          applied_date: '2024-01-12T09:15:00Z'
        }
      ],
      interviews: [
        {
          id: 'int2',
          type: 'Technical Interview',
          date: '2024-01-17T10:00:00Z',
          status: 'completed',
          feedback: 'Excellent problem-solving skills, strong system design knowledge'
        }
      ]
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol.davis@email.com',
      location: 'Austin, TX',
      current_position: 'Software Engineer',
      current_company: 'Enterprise Solutions Inc',
      experience_years: 6,
      education: 'BS Software Engineering - UT Austin',
      skills: ['Java', 'Spring Boot', 'Kubernetes', 'GCP', 'Angular', 'MongoDB'],
      rating: 4,
      status: 'active',
      source: 'Referral',
      applied_date: '2024-01-10T16:45:00Z',
      last_activity: '2024-01-18T09:20:00Z',
      salary_expectation: 145000,
      availability: '1 month notice',
      resume_url: '/resumes/carol_davis.pdf',
      linkedin_url: 'https://linkedin.com/in/caroldavis',
      tags: ['java', 'enterprise', 'cloud'],
      applications: [
        {
          job_id: 'job1',
          job_title: 'Senior Software Engineer',
          stage: 'phone_interview',
          applied_date: '2024-01-10T16:45:00Z'
        }
      ],
      interviews: []
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 345-6789',
      location: 'Seattle, WA',
      current_position: 'Full Stack Developer',
      current_company: 'Digital Agency',
      experience_years: 4,
      education: 'BS Computer Science - University of Washington',
      skills: ['C#', '.NET', 'Azure', 'SQL Server', 'React', 'JavaScript'],
      rating: 3,
      status: 'on_hold',
      source: 'Company Website',
      applied_date: '2024-01-08T13:20:00Z',
      last_activity: '2024-01-16T15:10:00Z',
      salary_expectation: 140000,
      availability: 'Immediate',
      resume_url: '/resumes/david_wilson.pdf',
      tags: ['microsoft', 'full-stack', 'azure'],
      applications: [
        {
          job_id: 'job1',
          job_title: 'Senior Software Engineer',
          stage: 'screening',
          applied_date: '2024-01-08T13:20:00Z'
        }
      ],
      interviews: []
    }
  ];

  // Initialize data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCandidates(mockCandidates);
      setLoading(false);
    }, 1000);
  }, []);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const sources = Array.from(new Set(candidates.map(c => c.source))).sort();
    const skills = Array.from(new Set(candidates.flatMap(c => c.skills))).sort();
    const companies = Array.from(new Set(candidates.map(c => c.current_company).filter(Boolean))).sort();
    
    return { sources, skills, companies };
  }, [candidates]);

  // Filter and sort candidates
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      // Job filter
      if (jobId && !candidate.applications.some(app => app.job_id === jobId)) {
        return false;
      }
      
      // Search filter
      const matchesSearch = searchTerm === '' || 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.current_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        candidate.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus;
      
      // Source filter
      const matchesSource = selectedSource === 'all' || candidate.source === selectedSource;
      
      // Experience filter
      const matchesExperience = selectedExperience === 'all' || 
        (selectedExperience === '0-2' && candidate.experience_years <= 2) ||
        (selectedExperience === '3-5' && candidate.experience_years >= 3 && candidate.experience_years <= 5) ||
        (selectedExperience === '6-10' && candidate.experience_years >= 6 && candidate.experience_years <= 10) ||
        (selectedExperience === '10+' && candidate.experience_years > 10);
      
      // Skills filter
      const matchesSkills = selectedSkills.length === 0 || 
        selectedSkills.some(skill => candidate.skills.includes(skill));
      
      return matchesSearch && matchesStatus && matchesSource && matchesExperience && matchesSkills;
    });

    // Sort candidates
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'applied_date':
          aValue = new Date(a.applied_date);
          bValue = new Date(b.applied_date);
          break;
        case 'experience_years':
          aValue = a.experience_years;
          bValue = b.experience_years;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [candidates, searchTerm, selectedStatus, selectedSource, selectedExperience, selectedSkills, sortBy, sortDirection, jobId]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = filteredAndSortedCandidates.length;
    const active = filteredAndSortedCandidates.filter(c => c.status === 'active').length;
    const onHold = filteredAndSortedCandidates.filter(c => c.status === 'on_hold').length;
    const hired = filteredAndSortedCandidates.filter(c => c.status === 'hired').length;
    const averageRating = total > 0 ? 
      filteredAndSortedCandidates.reduce((sum, c) => sum + c.rating, 0) / total : 0;
    const averageExperience = total > 0 ?
      filteredAndSortedCandidates.reduce((sum, c) => sum + c.experience_years, 0) / total : 0;
    
    return { total, active, onHold, hired, averageRating, averageExperience };
  }, [filteredAndSortedCandidates]);

  // Handle candidate selection
  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredAndSortedCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredAndSortedCandidates.map(c => c.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedCandidates.length > 0) {
      onBulkAction(action, selectedCandidates);
      setSelectedCandidates([]);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format salary
  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get rating stars
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'active': return 'default';
      case 'on_hold': return 'outline';
      case 'rejected': return 'destructive';
      case 'hired': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Active</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.active}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">On Hold</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.onHold}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Hired</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.hired}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Avg Rating</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.averageRating.toFixed(1)}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Avg Experience</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.averageExperience.toFixed(1)}y</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Filters */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              {filterOptions.sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>

            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Experience</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            {showBulkActions && selectedCandidates.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-gray-600">{selectedCandidates.length} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            )}

            {/* Add Candidate */}
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Candidate
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant={currentViewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentViewMode('list')}
                className="rounded-r-none"
              >
                List
              </Button>
              <Button
                variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentViewMode('grid')}
                className="rounded-l-none"
              >
                Grid
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Skills:</label>
                <select
                  multiple
                  value={selectedSkills}
                  onChange={(e) => setSelectedSkills(Array.from(e.target.selectedOptions, option => option.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                >
                  {filterOptions.skills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSkills([]);
                  setSelectedStatus('all');
                  setSelectedSource('all');
                  setSelectedExperience('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Candidates Display */}
      <Card className="p-6">
        {currentViewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {showBulkActions && (
                    <th className="text-left py-3 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.length === filteredAndSortedCandidates.length && filteredAndSortedCandidates.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Candidate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Experience</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Skills</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Rating</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Applied</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCandidates.map((candidate) => (
                  <tr 
                    key={candidate.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      selectedCandidates.includes(candidate.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onCandidateSelect?.(candidate)}
                  >
                    {showBulkActions && (
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate.id)}
                          onChange={() => handleSelectCandidate(candidate.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{candidate.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {candidate.email}
                          </div>
                          {candidate.location && (
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {candidate.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{candidate.current_position}</div>
                        {candidate.current_company && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {candidate.current_company}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{candidate.experience_years} years</div>
                        <div className="text-gray-500">{candidate.education}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {getRatingStars(candidate.rating)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(candidate.status)}>
                        {candidate.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(candidate.applied_date)}
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCandidateSelect?.(candidate)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCandidateEdit?.(candidate)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCandidates.map((candidate) => (
              <Card 
                key={candidate.id} 
                className={`p-6 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedCandidates.includes(candidate.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onCandidateSelect?.(candidate)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">{candidate.current_position}</p>
                    </div>
                  </div>
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleSelectCandidate(candidate.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {getRatingStars(candidate.rating)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{candidate.current_company || 'Not specified'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{candidate.experience_years} years experience</span>
                  </div>

                  {candidate.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{candidate.location}</span>
                    </div>
                  )}

                  {candidate.salary_expectation && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(candidate.salary_expectation)}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.skills.length - 4}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={getStatusBadgeVariant(candidate.status)}>
                      {candidate.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Applied {formatDate(candidate.applied_date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCandidateSelect?.(candidate);
                      }}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle email
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCandidateEdit?.(candidate);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredAndSortedCandidates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No candidates found</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
