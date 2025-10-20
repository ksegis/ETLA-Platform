'use client';

/**
 * ATS Candidates Management Component
 * Features: Comprehensive candidate profiles, search, filtering, and bulk operations
 */

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
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  jobLocation?: string;
  requisitionId?: string;
  requisitionDescription?: string;
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
  documents?: Array<{
    fileName: string;
    url: string;
    type: string;
  }>;
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
  const [loading, setloading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof Candidate>('applied_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockCandidates: Candidate[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
        },
        jobLocation: 'San Francisco, CA',
        requisitionId: 'REQ001',
        requisitionDescription: 'Lead engineer for cloud-native applications.',
        current_position: 'Senior Software Engineer',
        current_company: 'TechCorp Inc.',
        experience_years: 8,
        education: 'MS Computer Science, Stanford University',
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
        rating: 4.8,
        status: 'active',
        source: 'LinkedIn',
        applied_date: '2024-01-15',
        last_activity: '2024-01-20',
        salary_expectation: 150000,
        availability: 'Immediate',
        notes: 'Strong technical background with leadership experience',
        documents: [
          { fileName: 'sarah-johnson-resume.pdf', url: '/resumes/sarah-johnson.pdf', type: 'application/pdf' },
          { fileName: 'sarah-johnson-coverletter.docx', url: '/resumes/sarah-johnson-coverletter.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        ],
        linkedin_url: 'https://linkedin.com/in/sarahjohnson',
        github_url: 'https://github.com/sarahjohnson',
        tags: ['senior', 'full-stack', 'leadership'],
        applications: [
          {
            job_id: 'job1',
            job_title: 'Senior Full Stack Developer',
            stage: 'Technical Interview',
            applied_date: '2024-01-15'
          }
        ],
        interviews: [
          {
            id: 'int1',
            type: 'Phone Screen',
            date: '2024-01-18',
            status: 'completed',
            feedback: 'Excellent communication skills and technical knowledge'
          }
        ]
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 987-6543',
        address: {
          street: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          zip: '10001',
        },
        jobLocation: 'New York, NY',
        requisitionId: 'REQ002',
        requisitionDescription: 'Product vision and roadmap for new SaaS offering.',
        current_position: 'Product Manager',
        current_company: 'StartupXYZ',
        experience_years: 5,
        education: 'MBA, Wharton School',
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'SQL'],
        rating: 4.5,
        status: 'active',
        source: 'Company Website',
        applied_date: '2024-01-12',
        last_activity: '2024-01-19',
        salary_expectation: 120000,
        availability: '2 weeks notice',
        notes: 'Strong product sense with startup experience',
        documents: [
          { fileName: 'michael-chen-resume.pdf', url: '/resumes/michael-chen.pdf', type: 'application/pdf' },
        ],
        linkedin_url: 'https://linkedin.com/in/michaelchen',
        tags: ['product', 'startup', 'analytics'],
        applications: [
          {
            job_id: 'job2',
            job_title: 'Senior Product Manager',
            stage: 'Final Interview',
            applied_date: '2024-01-12'
          }
        ],
        interviews: [
          {
            id: 'int2',
            type: 'Product Case Study',
            date: '2024-01-16',
            status: 'completed',
            feedback: 'Great strategic thinking and problem-solving approach'
          }
        ]
      }
    ];

    setTimeout(() => {
      setCandidates(mockCandidates);
      setloading(false);
    }, 1000);
  }, []);

  // Get unique values for filters
  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    candidates.forEach(candidate => {
      candidate.skills.forEach(skill => skills.add(skill));
    });
    return Array.from(skills).sort();
  }, [candidates]);

  const uniqueSources = useMemo(() => {
    return Array.from(new Set(candidates.map(c => c.source))).sort();
  }, [candidates]);

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term) ||
        candidate.current_company?.toLowerCase().includes(term) ||
        candidate.current_position?.toLowerCase().includes(term) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    if (skillFilter) {
      filtered = filtered.filter(candidate => 
        candidate.skills.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.source === sourceFilter);
    }

    if (experienceFilter !== 'all') {
      const [min, max] = experienceFilter.split('-').map(Number);
      filtered = filtered.filter(candidate => {
        if (max) {
          return candidate.experience_years >= min && candidate.experience_years <= max;
        } else {
          return candidate.experience_years >= min;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [candidates, searchTerm, statusFilter, skillFilter, sourceFilter, experienceFilter, sortBy, sortOrder]);

  // Handle candidate selection
  const handleCandidateSelect = (candidateId: string) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    } else {
      setSelectedCandidates(prev => [...prev, candidateId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'on_hold':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'hired':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Candidates</h2>
          <p className="text-gray-600">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name, email, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input
              type="text"
              placeholder="Filter by skills..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10">10+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as keyof Candidate);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="applied_date-desc">Latest Applied</option>
              <option value="applied_date-asc">Earliest Applied</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {showBulkActions && selectedCandidates.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button size="sm" variant="outline">
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tags
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedCandidates([])}
            >
              Clear Selection
            </Button>
          </div>
        </Card>
      )}

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {showBulkActions && (
                    <div className="flex items-center pt-1">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleCandidateSelect(candidate.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                      <Badge variant={getStatusBadgeVariant(candidate.status)}>
                        {candidate.status.replace('_', ' ')}
                      </Badge>
                      {renderStarRating(candidate.rating)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{candidate.email}</span>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                      {candidate.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{candidate.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {new Date(candidate.applied_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {candidate.current_position && candidate.current_company && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{candidate.current_position} at {candidate.current_company}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <GraduationCap className="h-4 w-4" />
                      <span>{candidate.education}</span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 5} more
                        </Badge>
                      )}
                    </div>

                    {/* Applications */}
                    {candidate.applications.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Current Applications:</span>
                        {candidate.applications.map((app, index) => (
                          <span key={index} className="ml-2">
                            {app.job_title} ({app.stage})
                            {index < candidate.applications.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {candidate.resume_url && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  {candidate.linkedin_url && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onCandidateEdit?.(candidate)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onCandidateSelect?.(candidate)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
