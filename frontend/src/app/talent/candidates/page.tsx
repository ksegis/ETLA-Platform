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
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Github,
  Linkedin,
  Download,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

// Mock candidate data
const MOCK_CANDIDATES = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
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
    resumeUrl: '/resumes/sarah-johnson.pdf',
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
    location: 'New York, NY',
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
    resumeUrl: '/resumes/michael-chen.pdf',
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
    location: 'Austin, TX',
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
    resumeUrl: '/resumes/emily-rodriguez.pdf',
    notes: 'Creative portfolio, strong user research background',
    source: 'Referral',
    addedDate: '2024-09-05',
    lastContact: '2024-09-12',
    tags: ['Design', 'UX', 'Research']
  }
];

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
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
  resumeUrl: string;
  notes: string;
  source: string;
  addedDate: string;
  lastContact: string;
  tags: string[];
}

export default function CandidatesPage() {
  const { selectedTenant } = useTenant();
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || candidate.status.toLowerCase() === statusFilter;
    const matchesSkill = skillFilter === 'all' || candidate.skills.includes(skillFilter);
    return matchesSearch && matchesStatus && matchesSkill;
  });

  // Get unique skills for filter
  const allSkills = Array.from(new Set(candidates.flatMap(c => c.skills))).sort();

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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'passive': return 'bg-yellow-100 text-yellow-800';
      case 'not interested': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Database</h1>
          <p className="text-gray-600 mt-1">
            Manage your talent pool and candidate profiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {candidates.filter(c => c.status === 'Active').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passive</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {candidates.filter(c => c.status === 'Passive').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(candidates.reduce((sum, c) => sum + c.rating, 0) / candidates.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search candidates, skills, or positions..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="passive">Passive</SelectItem>
                <SelectItem value="not interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {allSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
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
        </CardContent>
      </Card>

      {/* Candidates Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">{candidate.title}</p>
                      <p className="text-sm text-gray-500">{candidate.company}</p>
                    </div>
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status}
                    </Badge>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    {renderRating(candidate.rating)}
                    <span className="text-sm text-gray-600">({candidate.rating}/5)</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(candidate.expectedSalary)} expected
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {candidate.experience}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{candidate.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Position</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Expected Salary</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-sm text-gray-600">{candidate.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">{candidate.title}</p>
                          <p className="text-sm text-gray-600">{candidate.company}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{candidate.location}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{formatSalary(candidate.expectedSalary)}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(candidate.status)}>
                          {candidate.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {renderRating(candidate.rating)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <User className="h-6 w-6" />
                  {selectedCandidate.name}
                  <Badge className={getStatusColor(selectedCandidate.status)}>
                    {selectedCandidate.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Current Position</Label>
                              <p className="text-sm text-gray-900">{selectedCandidate.title}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Company</Label>
                              <p className="text-sm text-gray-900">{selectedCandidate.company}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Location</Label>
                              <p className="text-sm text-gray-900">{selectedCandidate.location}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Experience</Label>
                              <p className="text-sm text-gray-900">{selectedCandidate.experience}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Expected Salary</Label>
                              <p className="text-sm text-gray-900">{formatSalary(selectedCandidate.expectedSalary)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Availability</Label>
                              <p className="text-sm text-gray-900">{selectedCandidate.availability}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Skills & Expertise</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-700">{selectedCandidate.notes}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <a href={`mailto:${selectedCandidate.email}`} className="text-sm text-blue-600 hover:underline">
                              {selectedCandidate.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <a href={`tel:${selectedCandidate.phone}`} className="text-sm text-blue-600 hover:underline">
                              {selectedCandidate.phone}
                            </a>
                          </div>
                          {selectedCandidate.linkedin && (
                            <div className="flex items-center gap-3">
                              <Linkedin className="h-4 w-4 text-gray-500" />
                              <a href={selectedCandidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                          {selectedCandidate.github && (
                            <div className="flex items-center gap-3">
                              <Github className="h-4 w-4 text-gray-500" />
                              <a href={selectedCandidate.github} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                GitHub Profile
                              </a>
                            </div>
                          )}
                          {selectedCandidate.portfolio && (
                            <div className="flex items-center gap-3">
                              <Globe className="h-4 w-4 text-gray-500" />
                              <a href={selectedCandidate.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                Portfolio
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            {renderRating(selectedCandidate.rating)}
                            <span className="text-sm text-gray-600 ml-2">
                              {selectedCandidate.rating}/5
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Actions</CardTitle>
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
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Work History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCandidate.workHistory.map((job, index) => (
                        <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          <p className="text-sm text-gray-500">{job.duration}</p>
                          <p className="text-sm text-gray-700 mt-2">{job.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedCandidate.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-700">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCandidate.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-green-200 pl-4 pb-4">
                          <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">{edu.school}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-500">Class of {edu.year}</p>
                            <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedCandidate.languages.map((language, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-700">{language}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-gray-900">Profile added to database</p>
                            <p className="text-xs text-gray-500">{new Date(selectedCandidate.addedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-gray-900">Last contact made</p>
                            <p className="text-xs text-gray-500">{new Date(selectedCandidate.lastContact).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
