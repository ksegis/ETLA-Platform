
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

// Candidate Document Interface
interface CandidateDocument {
  fileName: string;
  url: string;
  type: string;
}

// Candidate Address Interface
interface CandidateAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: CandidateAddress;
  jobLocation: string;
  requisitionId: string;
  requisitionDescription: string;
  title: string;
  company: string;
  experience: string;
  expectedSalary: number;
  currentSalary: number;
  availability: string;
  status: 'active' | 'on_hold' | 'rejected' | 'hired';
  rating: number;
  skills: string[];
  education: Array<{
    degree: string;
    school: string;
    year: string;
    gpa: string;
  }>;
  workHistory: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  certifications: string[];
  languages: string[];
  portfolio: string;
  github: string;
  linkedin: string;
  documents: CandidateDocument[];
  notes: string;
  source: string;
  addedDate: string;
  lastContact: string;
  tags: string[];
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof Candidate>('addedDate');
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
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        experience: '8 years',
        expectedSalary: 150000,
        currentSalary: 140000,
        availability: 'Immediate',
        status: 'active',
        rating: 4.8,
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
        education: [
          {
            degree: 'MS Computer Science',
            school: 'Stanford University',
            year: '2019',
            gpa: '3.8'
          }
        ],
        workHistory: [
          {
            title: 'Senior Software Engineer',
            company: 'TechCorp Inc.',
            duration: '2022 - Present',
            description: 'Lead development of microservices architecture'
          },
          {
            title: 'Software Engineer',
            company: 'StartupXYZ',
            duration: '2019 - 2022',
            description: 'Full-stack development using React and Node.js'
          }
        ],
        certifications: ['AWS Solutions Architect', 'Certified Kubernetes Administrator'],
        languages: ['English (Native)', 'Spanish (Conversational)'],
        portfolio: 'https://sarahjohnson.dev',
        github: 'https://github.com/sarahjohnson',
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        documents: [
          { fileName: 'sarah-johnson-resume.pdf', url: '/resumes/sarah-johnson.pdf', type: 'application/pdf' },
          { fileName: 'sarah-johnson-coverletter.docx', url: '/resumes/sarah-johnson-coverletter.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        ],
        notes: 'Strong technical background with leadership experience',
        source: 'LinkedIn',
        addedDate: '2024-01-15',
        lastContact: '2024-01-20',
        tags: ['senior', 'full-stack', 'leadership'],
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
        title: 'Product Manager',
        company: 'StartupXYZ',
        experience: '5 years',
        expectedSalary: 120000,
        currentSalary: 110000,
        availability: '2 weeks notice',
        status: 'active',
        rating: 4.5,
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'SQL'],
        education: [
          {
            degree: 'MBA',
            school: 'Wharton School',
            year: '2018',
            gpa: '3.9'
          }
        ],
        workHistory: [
          {
            title: 'Senior Product Manager',
            company: 'Innovation Labs',
            duration: '2021 - Present',
            description: 'Led product strategy for B2B SaaS platform'
          },
          {
            title: 'Product Manager',
            company: 'TechGiant',
            duration: '2018 - 2021',
            description: 'Managed mobile app product line'
          }
        ],
        certifications: ['Certified Scrum Product Owner', 'Google Analytics Certified'],
        languages: ['English (Native)', 'Mandarin (Native)', 'Japanese (Basic)'],
        portfolio: 'https://michaelchen.pm',
        github: '',
        linkedin: 'https://linkedin.com/in/michaelchen',
        documents: [
          { fileName: 'michael-chen-resume.pdf', url: '/resumes/michael-chen.pdf', type: 'application/pdf' },
        ],
        notes: 'Strong product sense with startup experience',
        source: 'Company Website',
        addedDate: '2024-01-12',
        lastContact: '2024-01-19',
        tags: ['product', 'startup', 'analytics'],
      }
    ];

    setTimeout(() => {
      setCandidates(mockCandidates);
      setLoading(false);
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
        candidate.company.toLowerCase().includes(term) ||
        candidate.title.toLowerCase().includes(term) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(term)) ||
        candidate.requisitionDescription.toLowerCase().includes(term) ||
        candidate.jobLocation.toLowerCase().includes(term)
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
        const experienceYears = parseInt(candidate.experience);
        if (max) {
          return experienceYears >= min && experienceYears <= max;
        } else {
          return experienceYears >= min;
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
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Skills</SelectItem>
              {uniqueSkills.map(skill => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={experienceFilter} onValueChange={setExperienceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Experience</SelectItem>
              <SelectItem value="0-1">0-1 Years</SelectItem>
              <SelectItem value="1-3">1-3 Years</SelectItem>
              <SelectItem value="3-5">3-5 Years</SelectItem>
              <SelectItem value="5-10">5-10 Years</SelectItem>
              <SelectItem value="10-">10+ Years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setSkillFilter('');
            setSourceFilter('all');
            setExperienceFilter('all');
          }}>
            Reset Filters
          </Button>
        </div>
        {showBulkActions && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled={selectedCandidates.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export Selected
            </Button>
            <Button variant="outline" disabled={selectedCandidates.length === 0}>
              <Mail className="mr-2 h-4 w-4" /> Email Selected
            </Button>
            <Button variant="destructive" disabled={selectedCandidates.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading candidates...</div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No candidates found matching your criteria.</div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCandidates.map(candidate => (
            <Card key={candidate.id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={() => handleCandidateSelect(candidate.id)}
                  />
                  <CardTitle className="text-lg font-bold">{candidate.name}</CardTitle>
                </div>
                <Badge variant={getStatusBadgeVariant(candidate.status)}>{candidate.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Briefcase className="mr-2 h-4 w-4" /> {candidate.title} at {candidate.company}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-2 h-4 w-4" /> {candidate.jobLocation}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="mr-2 h-4 w-4" /> {candidate.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="mr-2 h-4 w-4" /> {candidate.phone}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="mr-2 h-4 w-4" /> Req ID: {candidate.requisitionId}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-2 h-4 w-4" /> Experience: {candidate.experience}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="mr-2 h-4 w-4" /> Expected: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(candidate.expectedSalary)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="mr-2 h-4 w-4 text-yellow-400" /> Rating: {candidate.rating}/5
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {candidate.skills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => onCandidateEdit?.(candidate)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onCandidateSelect?.(candidate)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => setSortBy('name')}>
                  Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => setSortBy('title')}>
                  Job Title {sortBy === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => setSortBy('jobLocation')}>
                  Location {sortBy === 'jobLocation' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => setSortBy('status')}>
                  Status {sortBy === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => setSortBy('rating')}>
                  Rating {sortBy === 'rating' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleCandidateSelect(candidate.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.jobLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Badge variant={getStatusBadgeVariant(candidate.status)}>{candidate.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < candidate.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => onCandidateSelect?.(candidate)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onCandidateEdit?.(candidate)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

