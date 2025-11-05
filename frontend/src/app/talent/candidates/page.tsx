
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  User,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Star,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Github,
  Linkedin,
  Download,
  Edit,
  Trash2,
  Eye,
  Save,
  X as XIcon
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { SavedFiltersManager } from '@/components/talent/SavedFiltersManager';
import { ExportButtons } from '@/components/talent/ExportButtons';
import { FilterState } from '@/types/savedFilters';
import Link from 'next/link';

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
  status: string;
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

// FilterState is imported from @/types/savedFilters

// Mock candidate data with more variety for Florida locations
const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main St',
      city: 'Tampa',
      state: 'FL',
      zip: '33602',
    },
    jobLocation: 'Tampa, FL',
    requisitionId: 'REQ001',
    requisitionDescription: 'Lead engineer for cloud-native applications.',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    experience: '5 years',
    expectedSalary: 120000,
    currentSalary: 110000,
    availability: 'Immediately',
    status: 'Active',
    rating: 4,
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python', 'Docker'],
    education: [
      {
        degree: 'BS Computer Science',
        school: 'Stanford University',
        year: '2019',
        gpa: '3.8'
      }
    ],
    workHistory: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
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
    notes: 'Excellent technical skills, strong leadership potential',
    source: 'LinkedIn',
    addedDate: '2024-09-15',
    lastContact: '2024-09-20',
    tags: ['Frontend', 'Senior', 'Remote OK']
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    address: {
      street: '456 Oak Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
    },
    jobLocation: 'Miami, FL',
    requisitionId: 'REQ002',
    requisitionDescription: 'Product vision and roadmap for new SaaS offering.',
    title: 'Product Manager',
    company: 'Innovation Labs',
    experience: '7 years',
    expectedSalary: 140000,
    currentSalary: 125000,
    availability: '2 weeks notice',
    status: 'Active',
    rating: 5,
    skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership', 'SQL', 'Figma'],
    education: [
      {
        degree: 'MBA',
        school: 'Wharton School',
        year: '2018',
        gpa: '3.9'
      },
      {
        degree: 'BS Engineering',
        school: 'MIT',
        year: '2016',
        gpa: '3.7'
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
    notes: 'Outstanding product sense, proven track record of successful launches',
    source: 'Company Website',
    addedDate: '2024-09-10',
    lastContact: '2024-09-18',
    tags: ['Product', 'Leadership', 'B2B']
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    address: {
      street: '789 Pine Ln',
      city: 'Orlando',
      state: 'FL',
      zip: '32801',
    },
    jobLocation: 'Orlando, FL',
    requisitionId: 'REQ003',
    requisitionDescription: 'Design user experiences for mobile platforms.',
    title: 'UX Designer',
    company: 'Design Studio',
    experience: '4 years',
    expectedSalary: 95000,
    currentSalary: 85000,
    availability: '1 month notice',
    status: 'Passive',
    rating: 4,
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Adobe Creative Suite', 'HTML/CSS'],
    education: [
      {
        degree: 'MFA Design',
        school: 'Art Institute',
        year: '2020',
        gpa: '3.9'
      }
    ],
    workHistory: [
      {
        title: 'Senior UX Designer',
        company: 'Design Studio',
        duration: '2022 - Present',
        description: 'Lead UX for mobile and web applications'
      },
      {
        title: 'UX Designer',
        company: 'Digital Agency',
        duration: '2020 - 2022',
        description: 'Designed user experiences for various clients'
      }
    ],
    certifications: ['Google UX Design Certificate', 'Nielsen Norman Group UX Certification'],
    languages: ['English (Native)', 'Spanish (Native)'],
    portfolio: 'https://emilyrodriguez.design',
    github: '',
    linkedin: 'https://linkedin.com/in/emilyrodriguez',
    documents: [
      { fileName: 'emily-rodriguez-resume.pdf', url: '/resumes/emily-rodriguez.pdf', type: 'application/pdf' },
      { fileName: 'emily-rodriguez-portfolio.zip', url: '/resumes/emily-rodriguez-portfolio.zip', type: 'application/zip' },
    ],
    notes: 'Creative portfolio, strong user research background',
    source: 'Referral',
    addedDate: '2024-09-05',
    lastContact: '2024-09-12',
    tags: ['Design', 'UX', 'Research']
  },
  {
    id: '4',
    name: 'James Martinez',
    email: 'james.martinez@email.com',
    phone: '+1 (555) 456-7890',
    address: {
      street: '321 Beach Blvd',
      city: 'Tampa',
      state: 'FL',
      zip: '33609',
    },
    jobLocation: 'Tampa, FL',
    requisitionId: 'REQ001',
    requisitionDescription: 'Lead engineer for cloud-native applications.',
    title: 'Senior Software Engineer',
    company: 'Cloud Systems Inc',
    experience: '6 years',
    expectedSalary: 125000,
    currentSalary: 115000,
    availability: '3 weeks notice',
    status: 'Active',
    rating: 5,
    skills: ['Java', 'Spring Boot', 'Kubernetes', 'AWS', 'Microservices', 'Docker'],
    education: [
      {
        degree: 'MS Computer Science',
        school: 'University of Florida',
        year: '2018',
        gpa: '3.9'
      }
    ],
    workHistory: [
      {
        title: 'Senior Software Engineer',
        company: 'Cloud Systems Inc',
        duration: '2020 - Present',
        description: 'Architect and implement cloud-native solutions'
      }
    ],
    certifications: ['AWS Certified Solutions Architect', 'Certified Kubernetes Administrator'],
    languages: ['English (Native)', 'Spanish (Native)'],
    portfolio: 'https://jamesmartinez.dev',
    github: 'https://github.com/jmartinez',
    linkedin: 'https://linkedin.com/in/jamesmartinez',
    documents: [
      { fileName: 'james-martinez-resume.pdf', url: '/resumes/james-martinez.pdf', type: 'application/pdf' },
    ],
    notes: 'Strong cloud architecture experience',
    source: 'LinkedIn',
    addedDate: '2024-09-18',
    lastContact: '2024-09-22',
    tags: ['Backend', 'Cloud', 'Senior']
  }
];


export default function CandidatesPageEnhanced() {
  const { selectedTenant } = useTenant();
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  
  // Get actual user and tenant IDs from auth context
  const userId = user?.id || '';
  const tenantId = selectedTenant?.id || '';
  const tenantName = selectedTenant?.name || 'ETLA Platform';
  
  // Enhanced filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    locations: [],
    jobTitles: [],
    requisitionIds: [],
    requisitionDescriptions: [],
    status: 'all',
    skills: []
  });
  
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract unique values for filter options
  const getUniqueLocations = (): MultiSelectOption[] => {
    const locations = Array.from(new Set(candidates.map(c => c.jobLocation))).sort();
    return locations.map(loc => ({ value: loc, label: loc }));
  };

  const getUniqueJobTitles = (): MultiSelectOption[] => {
    const titles = Array.from(new Set(candidates.map(c => c.title))).sort();
    return titles.map(title => ({ value: title, label: title }));
  };

  const getUniqueRequisitionIds = (): MultiSelectOption[] => {
    const reqIds = Array.from(new Set(candidates.map(c => c.requisitionId))).sort();
    return reqIds.map(id => ({ value: id, label: id }));
  };

  const getUniqueRequisitionDescriptions = (): MultiSelectOption[] => {
    const descriptions = Array.from(new Set(candidates.map(c => c.requisitionDescription))).sort();
    return descriptions.map(desc => ({ value: desc, label: desc }));
  };

  const getUniqueSkills = (): MultiSelectOption[] => {
    const skills = Array.from(new Set(candidates.flatMap(c => c.skills))).sort();
    return skills.map(skill => ({ value: skill, label: skill }));
  };

  // Filter candidates based on all filter criteria
  const filteredCandidates = candidates.filter(candidate => {
    // Search term filter
    const matchesSearch = !filters.searchTerm || 
      candidate.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      candidate.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      candidate.requisitionDescription.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      candidate.jobLocation.toLowerCase().includes(filters.searchTerm.toLowerCase());

    // Location filter (multi-select - match any)
    const matchesLocation = filters.locations.length === 0 || 
      filters.locations.includes(candidate.jobLocation);

    // Job Title filter (multi-select - match any)
    const matchesJobTitle = filters.jobTitles.length === 0 || 
      filters.jobTitles.includes(candidate.title);

    // Requisition ID filter (multi-select - match any)
    const matchesRequisitionId = filters.requisitionIds.length === 0 || 
      filters.requisitionIds.includes(candidate.requisitionId);

    // Requisition Description filter (multi-select - match any)
    const matchesRequisitionDescription = filters.requisitionDescriptions.length === 0 || 
      filters.requisitionDescriptions.includes(candidate.requisitionDescription);

    // Status filter
    const matchesStatus = filters.status === 'all' || 
      candidate.status.toLowerCase() === filters.status.toLowerCase();

    // Skills filter (multi-select - match any)
    const matchesSkills = filters.skills.length === 0 || 
      filters.skills.some(skill => candidate.skills.includes(skill));

    return matchesSearch && matchesLocation && matchesJobTitle && 
           matchesRequisitionId && matchesRequisitionDescription && 
           matchesStatus && matchesSkills;
  });

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilters({
      searchTerm: '',
      locations: [],
      jobTitles: [],
      requisitionIds: [],
      requisitionDescriptions: [],
      status: 'all',
      skills: []
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.searchTerm !== '' ||
           filters.locations.length > 0 ||
           filters.jobTitles.length > 0 ||
           filters.requisitionIds.length > 0 ||
           filters.requisitionDescriptions.length > 0 ||
           filters.status !== 'all' ||
           filters.skills.length > 0;
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

  // Get filter description for exports
  const getFilterDescription = (): string => {
    const parts: string[] = [];
    if (filters.searchTerm) parts.push(`Search: "${filters.searchTerm}"`);
    if (filters.locations.length > 0) parts.push(`Locations: ${filters.locations.join(', ')}`);
    if (filters.jobTitles.length > 0) parts.push(`Job Titles: ${filters.jobTitles.join(', ')}`);
    if (filters.requisitionIds.length > 0) parts.push(`Req IDs: ${filters.requisitionIds.join(', ')}`);
    if (filters.skills.length > 0) parts.push(`Skills: ${filters.skills.join(', ')}`);
    if (filters.status !== 'all') parts.push(`Status: ${filters.status}`);
    return parts.length > 0 ? parts.join(' | ') : 'All candidates';
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Talent Management</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => console.log('Add new candidate')}>
              <Plus className="mr-2 h-4 w-4" /> Add Candidate
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidates.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidates.filter(c => c.status === 'Active').length}</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hired This Month</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    +50% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="candidates" className="space-y-4">
            {/* Enhanced Filter Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Advanced Filters
                  </CardTitle>
                  {hasActiveFilters() && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearAllFilters}
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Search */}
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search candidates..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  {/* Location Multi-Select */}
                  <MultiSelect
                    label="Location"
                    options={getUniqueLocations()}
                    selected={filters.locations}
                    onChange={(selected) => setFilters({ ...filters, locations: selected })}
                    placeholder="Select locations..."
                  />

                  {/* Job Title Multi-Select */}
                  <MultiSelect
                    label="Job Title"
                    options={getUniqueJobTitles()}
                    selected={filters.jobTitles}
                    onChange={(selected) => setFilters({ ...filters, jobTitles: selected })}
                    placeholder="Select job titles..."
                  />

                  {/* Requisition ID Multi-Select */}
                  <MultiSelect
                    label="Requisition ID"
                    options={getUniqueRequisitionIds()}
                    selected={filters.requisitionIds}
                    onChange={(selected) => setFilters({ ...filters, requisitionIds: selected })}
                    placeholder="Select requisition IDs..."
                  />

                  {/* Requisition Description Multi-Select */}
                  <MultiSelect
                    label="Requisition Description"
                    options={getUniqueRequisitionDescriptions()}
                    selected={filters.requisitionDescriptions}
                    onChange={(selected) => setFilters({ ...filters, requisitionDescriptions: selected })}
                    placeholder="Select requisition descriptions..."
                  />

                  {/* Skills Multi-Select */}
                  <MultiSelect
                    label="Skills"
                    options={getUniqueSkills()}
                    selected={filters.skills}
                    onChange={(selected) => setFilters({ ...filters, skills: selected })}
                    placeholder="Select skills..."
                  />

                  {/* Status Single Select */}
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="passive">Passive</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Summary */}
                {hasActiveFilters() && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Showing <span className="font-semibold">{filteredCandidates.length}</span> of{' '}
                      <span className="font-semibold">{candidates.length}</span> candidates
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Filters Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saved Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <SavedFiltersManager
                  currentFilters={filters}
                  onLoadFilter={(loadedFilters) => setFilters(loadedFilters)}
                  userId={userId}
                  tenantId={tenantId}
                />
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExportButtons
                  candidates={filteredCandidates}
                  filterDescription={getFilterDescription()}
                  tenantName={tenantName}
                  userId={userId}
                  tenantId={tenantId}
                />
                <Link href="/talent/resumes">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View All Resumes
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>

            {/* Candidates Display */}
            {filteredCandidates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Try adjusting your filters or search term
                  </p>
                  {hasActiveFilters() && (
                    <Button variant="outline" onClick={handleClearAllFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCandidates.map(candidate => (
                  <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{candidate.name}</CardTitle>
                            <p className="text-sm text-gray-500">{candidate.title}</p>
                          </div>
                        </div>
                        <Badge variant={candidate.status === 'Active' ? 'default' : 'secondary'}>
                          {candidate.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {candidate.jobLocation}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {candidate.requisitionId}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {candidate.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {candidate.phone}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          {renderRating(candidate.rating)}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                        {candidate.documents.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <a 
                              href={candidate.documents[0].url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-3 w-3" />
                              Resume
                            </a>
                            {candidate.documents.length > 1 && (
                              <span className="text-xs text-gray-500">
                                +{candidate.documents.length - 1} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCandidates.map(candidate => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.jobLocation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.requisitionId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Badge variant={candidate.status === 'Active' ? 'default' : 'secondary'}>{candidate.status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                          {renderRating(candidate.rating)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {candidate.documents.length > 0 ? (
                            <a 
                              href={candidate.documents[0].url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              {candidate.documents.length} file{candidate.documents.length > 1 ? 's' : ''}
                            </a>
                          ) : (
                            <span className="text-gray-400">No documents</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedCandidate(candidate);
                            setIsDetailModalOpen(true);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="w-full max-w-[90vw]">
              <DialogHeader>
                <DialogTitle>{selectedCandidate.name} - {selectedCandidate.title}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" defaultValue={selectedCandidate.name} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" defaultValue={selectedCandidate.email} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input id="phone" defaultValue={selectedCandidate.phone} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Address</Label>
                  <Input id="address" defaultValue={`${selectedCandidate.address.street}, ${selectedCandidate.address.city}, ${selectedCandidate.address.state} ${selectedCandidate.address.zip}`} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="jobLocation" className="text-right">Job Location</Label>
                  <Input id="jobLocation" defaultValue={selectedCandidate.jobLocation} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="requisitionId" className="text-right">Requisition ID</Label>
                  <Input id="requisitionId" defaultValue={selectedCandidate.requisitionId} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="requisitionDescription" className="text-right">Requisition Description</Label>
                  <Textarea id="requisitionDescription" defaultValue={selectedCandidate.requisitionDescription} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Job Title</Label>
                  <Input id="title" defaultValue={selectedCandidate.title} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">Current Company</Label>
                  <Input id="company" defaultValue={selectedCandidate.company} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="experience" className="text-right">Experience</Label>
                  <Input id="experience" defaultValue={selectedCandidate.experience} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expectedSalary" className="text-right">Expected Salary</Label>
                  <Input id="expectedSalary" defaultValue={formatSalary(selectedCandidate.expectedSalary)} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentSalary" className="text-right">Current Salary</Label>
                  <Input id="currentSalary" defaultValue={formatSalary(selectedCandidate.currentSalary)} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="availability" className="text-right">Availability</Label>
                  <Input id="availability" defaultValue={selectedCandidate.availability} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Input id="status" defaultValue={selectedCandidate.status} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rating" className="text-right">Rating</Label>
                  <div className="col-span-3 flex items-center gap-1">
                    {renderRating(selectedCandidate.rating)}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="skills" className="text-right">Skills</Label>
                  <div className="col-span-3 flex flex-wrap gap-1">
                    {selectedCandidate.skills.map(skill => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="education" className="text-right">Education</Label>
                  <div className="col-span-3 space-y-1">
                    {selectedCandidate.education.map((edu, index) => (
                      <p key={index} className="text-sm text-gray-700">{edu.degree} from {edu.school} ({edu.year})</p>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="workHistory" className="text-right">Work History</Label>
                  <div className="col-span-3 space-y-1">
                    {selectedCandidate.workHistory.map((work, index) => (
                      <p key={index} className="text-sm text-gray-700">{work.title} at {work.company} ({work.duration})</p>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="documents" className="text-right">Documents</Label>
                  <div className="col-span-3 space-y-1">
                    {selectedCandidate.documents.length > 0 ? (
                      selectedCandidate.documents.map((doc, index) => (
                        <a key={index} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                          <Download className="mr-1 h-4 w-4" /> {doc.fileName}
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No documents attached.</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Textarea id="notes" defaultValue={selectedCandidate.notes} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="source" className="text-right">Source</Label>
                  <Input id="source" defaultValue={selectedCandidate.source} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="addedDate" className="text-right">Added Date</Label>
                  <Input id="addedDate" defaultValue={selectedCandidate.addedDate} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastContact" className="text-right">Last Contact</Label>
                  <Input id="lastContact" defaultValue={selectedCandidate.lastContact} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="tags" className="text-right">Tags</Label>
                  <div className="col-span-3 flex flex-wrap gap-1">
                    {selectedCandidate.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
