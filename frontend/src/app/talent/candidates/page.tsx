
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

// Mock candidate data
const MOCK_CANDIDATES: Candidate[] = [
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
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
    jobLocation: 'New York, NY',
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
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    jobLocation: 'Austin, TX',
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
  }
];


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
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         candidate.requisitionDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.jobLocation.toLowerCase().includes(searchTerm.toLowerCase());

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
                    <SelectItem value="all">All Skills</SelectItem>
                    {allSkills.map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSkillFilter('all');
                }}>
                  Reset Filters
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-gray-100' : ''}>Grid</Button>
                <Button variant="outline" size="sm" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-gray-100' : ''}>List</Button>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCandidates.map(candidate => (
                  <Card key={candidate.id} className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-bold">{candidate.name}</CardTitle>
                      <Badge variant={candidate.status === 'Active' ? 'default' : 'secondary'}>{candidate.status}</Badge>
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
                        <DollarSign className="mr-2 h-4 w-4" /> Expected: {formatSalary(candidate.expectedSalary)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="mr-2 h-4 w-4 text-yellow-400" /> Rating: {candidate.rating}/5
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.skills.map(skill => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="absolute bottom-4 right-4" onClick={() => {
                        setSelectedCandidate(candidate);
                        setIsDetailModalOpen(true);
                      }}>
                        View Details
                      </Button>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCandidates.map(candidate => (
                      <tr key={candidate.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.jobLocation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Badge variant={candidate.status === 'Active' ? 'default' : 'secondary'}>{candidate.status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                          {renderRating(candidate.rating)}
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
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>{selectedCandidate.name} - {selectedCandidate.title}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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

