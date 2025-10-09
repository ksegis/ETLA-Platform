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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  User, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Send,
  Download,
  Eye,
  MessageSquare,
  TrendingUp,
  Award,
  Building,
  MapPin,
  Briefcase
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

// Mock offers data
const MOCK_OFFERS = [
  {
    id: '1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@email.com',
    jobTitle: 'Senior Software Engineer',
    jobId: 'job-1',
    department: 'Engineering',
    offerDate: '2024-09-25',
    expiryDate: '2024-10-02',
    status: 'Pending',
    salary: 120000,
    bonus: 15000,
    equity: 0.5,
    benefits: ['Health Insurance', 'Dental', 'Vision', '401k Match', 'PTO'],
    startDate: '2024-10-15',
    location: 'San Francisco, CA',
    workArrangement: 'Hybrid',
    approvalStatus: 'Approved',
    approvedBy: 'John Smith',
    approvedDate: '2024-09-24',
    sentDate: '2024-09-25',
    responseDate: null,
    notes: 'Competitive offer for senior role',
    offerLetter: '/offers/sarah-johnson-offer.pdf',
    negotiationHistory: [
      {
        date: '2024-09-23',
        type: 'Initial Discussion',
        details: 'Discussed salary expectations and benefits'
      }
    ],
    createdBy: 'HR Team',
    createdDate: '2024-09-23'
  },
  {
    id: '2',
    candidateName: 'Michael Chen',
    candidateEmail: 'michael.chen@email.com',
    jobTitle: 'Product Manager',
    jobId: 'job-2',
    department: 'Product',
    offerDate: '2024-09-20',
    expiryDate: '2024-09-27',
    status: 'Accepted',
    salary: 140000,
    bonus: 20000,
    equity: 0.8,
    benefits: ['Health Insurance', 'Dental', 'Vision', '401k Match', 'PTO', 'Stock Options'],
    startDate: '2024-10-01',
    location: 'New York, NY',
    workArrangement: 'Remote',
    approvalStatus: 'Approved',
    approvedBy: 'Jane Doe',
    approvedDate: '2024-09-19',
    sentDate: '2024-09-20',
    responseDate: '2024-09-22',
    notes: 'Excellent candidate, quick acceptance',
    offerLetter: '/offers/michael-chen-offer.pdf',
    negotiationHistory: [
      {
        date: '2024-09-18',
        type: 'Salary Negotiation',
        details: 'Candidate requested higher base salary'
      },
      {
        date: '2024-09-19',
        type: 'Counter Offer',
        details: 'Increased equity package to meet expectations'
      }
    ],
    createdBy: 'HR Team',
    createdDate: '2024-09-18'
  },
  {
    id: '3',
    candidateName: 'Emily Rodriguez',
    candidateEmail: 'emily.rodriguez@email.com',
    jobTitle: 'UX Designer',
    jobId: 'job-3',
    department: 'Design',
    offerDate: '2024-09-22',
    expiryDate: '2024-09-29',
    status: 'Negotiating',
    salary: 95000,
    bonus: 8000,
    equity: 0.3,
    benefits: ['Health Insurance', 'Dental', 'Vision', '401k Match', 'PTO'],
    startDate: '2024-10-08',
    location: 'Austin, TX',
    workArrangement: 'Hybrid',
    approvalStatus: 'Approved',
    approvedBy: 'Alex Wilson',
    approvedDate: '2024-09-21',
    sentDate: '2024-09-22',
    responseDate: null,
    notes: 'Candidate requested higher salary and additional PTO',
    offerLetter: '/offers/emily-rodriguez-offer.pdf',
    negotiationHistory: [
      {
        date: '2024-09-23',
        type: 'Counter Request',
        details: 'Candidate requested $105k salary and 3 weeks PTO'
      }
    ],
    createdBy: 'HR Team',
    createdDate: '2024-09-21'
  },
  {
    id: '4',
    candidateName: 'David Kim',
    candidateEmail: 'david.kim@email.com',
    jobTitle: 'Data Scientist',
    jobId: 'job-4',
    department: 'Data',
    offerDate: null,
    expiryDate: null,
    status: 'Draft',
    salary: 130000,
    bonus: 18000,
    equity: 0.6,
    benefits: ['Health Insurance', 'Dental', 'Vision', '401k Match', 'PTO'],
    startDate: '2024-10-20',
    location: 'Seattle, WA',
    workArrangement: 'Remote',
    approvalStatus: 'Pending',
    approvedBy: null,
    approvedDate: null,
    sentDate: null,
    responseDate: null,
    notes: 'Preparing competitive offer for PhD candidate',
    offerLetter: null,
    negotiationHistory: [],
    createdBy: 'HR Team',
    createdDate: '2024-09-24'
  },
  {
    id: '5',
    candidateName: 'Lisa Thompson',
    candidateEmail: 'lisa.thompson@email.com',
    jobTitle: 'Marketing Manager',
    jobId: 'job-5',
    department: 'Marketing',
    offerDate: '2024-09-15',
    expiryDate: '2024-09-22',
    status: 'Declined',
    salary: 85000,
    bonus: 10000,
    equity: 0.2,
    benefits: ['Health Insurance', 'Dental', 'Vision', '401k Match', 'PTO'],
    startDate: '2024-10-01',
    location: 'Chicago, IL',
    workArrangement: 'On-site',
    approvalStatus: 'Approved',
    approvedBy: 'Mark Johnson',
    approvedDate: '2024-09-14',
    sentDate: '2024-09-15',
    responseDate: '2024-09-21',
    notes: 'Candidate declined due to competing offer',
    offerLetter: '/offers/lisa-thompson-offer.pdf',
    negotiationHistory: [
      {
        date: '2024-09-16',
        type: 'Follow-up',
        details: 'Candidate mentioned competing offer'
      },
      {
        date: '2024-09-18',
        type: 'Counter Offer',
        details: 'Increased salary to $90k but still declined'
      }
    ],
    createdBy: 'HR Team',
    createdDate: '2024-09-13'
  }
];

interface Offer {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobId: string;
  department: string;
  offerDate: string | null;
  expiryDate: string | null;
  status: string;
  salary: number;
  bonus: number;
  equity: number;
  benefits: string[];
  startDate: string;
  location: string;
  workArrangement: string;
  approvalStatus: string;
  approvedBy: string | null;
  approvedDate: string | null;
  sentDate: string | null;
  responseDate: string | null;
  notes: string;
  offerLetter: string | null;
  negotiationHistory: Array<{
    date: string;
    type: string;
    details: string;
  }>;
  createdBy: string;
  createdDate: string;
}

export default function OffersPage() {
  const { currentTenant } = useTenant();
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter offers
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status.toLowerCase() === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || offer.department.toLowerCase() === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments
  const departments = Array.from(new Set(offers.map(offer => offer.department)));

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'negotiating': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get approval status color
  const getApprovalStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  // Calculate total compensation
  const calculateTotalComp = (offer: Offer) => {
    return offer.salary + offer.bonus;
  };

  // Get offers expiring soon (within 3 days)
  const expiringSoon = offers.filter(offer => {
    if (!offer.expiryDate || offer.status !== 'Pending') return false;
    const expiryDate = new Date(offer.expiryDate);
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return expiryDate <= threeDaysFromNow && expiryDate >= today;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offer Management</h1>
          <p className="text-gray-600 mt-1">
            Create, track, and manage job offers and negotiations
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {offers.filter(o => o.status === 'Pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {offers.filter(o => o.status === 'Accepted').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acceptance Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((offers.filter(o => o.status === 'Accepted').length / 
                    offers.filter(o => ['Accepted', 'Declined'].includes(o.status)).length) * 100) || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Salary</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatSalary(offers.reduce((sum, o) => sum + o.salary, 0) / offers.length)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Offers Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{offer.candidateName}</p>
                      <p className="text-gray-600">{offer.jobTitle}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-orange-800">
                      Expires {new Date(offer.expiryDate!).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">{formatSalary(offer.salary)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search candidates, positions, or emails..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Salary</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total Comp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Approval</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Expiry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{offer.candidateName}</p>
                        <p className="text-sm text-gray-600">{offer.candidateEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{offer.jobTitle}</p>
                        <p className="text-sm text-gray-600">{offer.department}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatSalary(offer.salary)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatSalary(calculateTotalComp(offer))}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(offer.status)}>
                        {offer.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getApprovalStatusColor(offer.approvalStatus)}>
                        {offer.approvalStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {offer.status === 'Draft' && (
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {offer.offerLetter && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Offer Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedOffer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  Offer for {selectedOffer.candidateName}
                  <Badge className={getStatusColor(selectedOffer.status)}>
                    {selectedOffer.status}
                  </Badge>
                  <Badge className={getApprovalStatusColor(selectedOffer.approvalStatus)}>
                    {selectedOffer.approvalStatus}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="compensation">Compensation</TabsTrigger>
                  <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
                  <TabsTrigger value="approval">Approval</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Candidate Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Name</Label>
                            <p className="text-sm text-gray-900">{selectedOffer.candidateName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Email</Label>
                            <p className="text-sm text-gray-900">{selectedOffer.candidateEmail}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Position Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Job Title</Label>
                            <p className="text-sm text-gray-900">{selectedOffer.jobTitle}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Department</Label>
                            <p className="text-sm text-gray-900">{selectedOffer.department}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Location</Label>
                            <p className="text-sm text-gray-900">{selectedOffer.location}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Work Arrangement</Label>
                            <p className="text-sm text-gray-900">{selectedOffer.workArrangement}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                            <p className="text-sm text-gray-900">
                              {new Date(selectedOffer.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Offer Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Created</Label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedOffer.createdDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Sent</Label>
                          <p className="text-sm text-gray-900">
                            {selectedOffer.sentDate ? new Date(selectedOffer.sentDate).toLocaleDateString() : 'Not sent'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Expires</Label>
                          <p className="text-sm text-gray-900">
                            {selectedOffer.expiryDate ? new Date(selectedOffer.expiryDate).toLocaleDateString() : 'No expiry'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{selectedOffer.notes}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="compensation" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Compensation Package
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Base Salary</Label>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatSalary(selectedOffer.salary)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Annual Bonus</Label>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatSalary(selectedOffer.bonus)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Equity</Label>
                            <p className="text-lg font-semibold text-gray-900">
                              {selectedOffer.equity}%
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Total Compensation</Label>
                            <p className="text-lg font-semibold text-green-600">
                              {formatSalary(calculateTotalComp(selectedOffer))}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Benefits Package
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedOffer.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="negotiation" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Negotiation History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedOffer.negotiationHistory.length > 0 ? (
                        <div className="space-y-4">
                          {selectedOffer.negotiationHistory.map((item, index) => (
                            <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{item.type}</h4>
                                <span className="text-sm text-gray-500">
                                  {new Date(item.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{item.details}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No negotiation history yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Add Negotiation Note</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="negotiationType">Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select negotiation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="counter">Counter Offer</SelectItem>
                            <SelectItem value="discussion">Discussion</SelectItem>
                            <SelectItem value="revision">Offer Revision</SelectItem>
                            <SelectItem value="clarification">Clarification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="negotiationDetails">Details</Label>
                        <Textarea placeholder="Enter negotiation details..." />
                      </div>
                      <Button>Add Note</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="approval" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Approval Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Status</Label>
                          <Badge className={getApprovalStatusColor(selectedOffer.approvalStatus)}>
                            {selectedOffer.approvalStatus}
                          </Badge>
                        </div>
                        {selectedOffer.approvedBy && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Approved By</Label>
                            <p className="text-sm text-gray-900">{selectedOffer.approvedBy}</p>
                          </div>
                        )}
                        {selectedOffer.approvedDate && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Approved Date</Label>
                            <p className="text-sm text-gray-900">
                              {new Date(selectedOffer.approvedDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Created By</Label>
                          <p className="text-sm text-gray-900">{selectedOffer.createdBy}</p>
                        </div>
                      </div>

                      {selectedOffer.approvalStatus === 'Pending' && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Offer
                          </Button>
                          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Offer
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between pt-6 border-t">
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Offer
                  </Button>
                  {selectedOffer.offerLetter && (
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Letter
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  {selectedOffer.status === 'Draft' && (
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Send Offer
                    </Button>
                  )}
                  {selectedOffer.status === 'Pending' && (
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Follow Up
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Offer Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidate">Candidate</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="michael">Michael Chen</SelectItem>
                    <SelectItem value="emily">Emily Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="swe">Senior Software Engineer</SelectItem>
                    <SelectItem value="pm">Product Manager</SelectItem>
                    <SelectItem value="ux">UX Designer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salary">Base Salary</Label>
                <Input type="number" placeholder="120000" />
              </div>
              <div>
                <Label htmlFor="bonus">Annual Bonus</Label>
                <Input type="number" placeholder="15000" />
              </div>
              <div>
                <Label htmlFor="equity">Equity (%)</Label>
                <Input type="number" step="0.1" placeholder="0.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label htmlFor="expiryDate">Offer Expiry</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input placeholder="San Francisco, CA" />
              </div>
              <div>
                <Label htmlFor="workArrangement">Work Arrangement</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select arrangement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="on-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea placeholder="List benefits included in the offer..." />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea placeholder="Additional notes about the offer..." />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline">
                Save as Draft
              </Button>
              <Button onClick={() => setIsCreateModalOpen(false)}>
                Create & Send Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
