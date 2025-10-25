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
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  User, 
  MapPin, 
  Video,
  Phone,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Send,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

// Mock interview data
const MOCK_INTERVIEWS = [
  {
    id: '1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@email.com',
    jobTitle: 'Senior Software Engineer',
    interviewType: 'Technical',
    interviewMode: 'Video Call',
    date: '2024-09-28',
    time: '10:00',
    duration: 60,
    status: 'Scheduled',
    interviewer: 'John Smith',
    interviewerEmail: 'john.smith@company.com',
    location: 'Zoom Meeting',
    meetingLink: 'https://zoom.us/j/123456789',
    notes: 'Focus on React and system design questions',
    feedback: '',
    rating: 0,
    stage: 'Technical Interview',
    round: 2,
    totalRounds: 3,
    createdDate: '2024-09-20',
    updatedDate: '2024-09-20'
  },
  {
    id: '2',
    candidateName: 'Michael Chen',
    candidateEmail: 'michael.chen@email.com',
    jobTitle: 'Product Manager',
    interviewType: 'Behavioral',
    interviewMode: 'In-Person',
    date: '2024-09-27',
    time: '14:30',
    duration: 45,
    status: 'Completed',
    interviewer: 'Jane Doe',
    interviewerEmail: 'jane.doe@company.com',
    location: 'Conference Room A',
    meetingLink: '',
    notes: 'Assess leadership and communication skills',
    feedback: 'Excellent communication skills, strong product sense. Demonstrated clear thinking about user needs and market dynamics.',
    rating: 5,
    stage: 'Behavioral Interview',
    round: 1,
    totalRounds: 3,
    createdDate: '2024-09-18',
    updatedDate: '2024-09-27'
  },
  {
    id: '3',
    candidateName: 'Emily Rodriguez',
    candidateEmail: 'emily.rodriguez@email.com',
    jobTitle: 'UX Designer',
    interviewType: 'Portfolio Review',
    interviewMode: 'Video Call',
    date: '2024-09-29',
    time: '11:00',
    duration: 90,
    status: 'Scheduled',
    interviewer: 'Alex Wilson',
    interviewerEmail: 'alex.wilson@company.com',
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    notes: 'Review design portfolio and discuss design process',
    feedback: '',
    rating: 0,
    stage: 'Portfolio Review',
    round: 1,
    totalRounds: 2,
    createdDate: '2024-09-22',
    updatedDate: '2024-09-22'
  },
  {
    id: '4',
    candidateName: 'David Kim',
    candidateEmail: 'david.kim@email.com',
    jobTitle: 'Data Scientist',
    interviewType: 'Technical',
    interviewMode: 'Phone',
    date: '2024-09-26',
    time: '16:00',
    duration: 60,
    status: 'Completed',
    interviewer: 'Sarah Lee',
    interviewerEmail: 'sarah.lee@company.com',
    location: 'Phone Call',
    meetingLink: '',
    notes: 'Machine learning and statistics assessment',
    feedback: 'Strong technical background in ML. Explained complex concepts clearly. Good problem-solving approach.',
    rating: 4,
    stage: 'Technical Screen',
    round: 1,
    totalRounds: 3,
    createdDate: '2024-09-19',
    updatedDate: '2024-09-26'
  },
  {
    id: '5',
    candidateName: 'Lisa Thompson',
    candidateEmail: 'lisa.thompson@email.com',
    jobTitle: 'Marketing Manager',
    interviewType: 'Case Study',
    interviewMode: 'Video Call',
    date: '2024-09-30',
    time: '09:30',
    duration: 120,
    status: 'Scheduled',
    interviewer: 'Mark Johnson',
    interviewerEmail: 'mark.johnson@company.com',
    location: 'Teams Meeting',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
    notes: 'Present marketing strategy for new product launch',
    feedback: '',
    rating: 0,
    stage: 'Case Study Presentation',
    round: 2,
    totalRounds: 3,
    createdDate: '2024-09-21',
    updatedDate: '2024-09-21'
  },
  {
    id: '6',
    candidateName: 'James Wilson',
    candidateEmail: 'james.wilson@email.com',
    jobTitle: 'DevOps Engineer',
    interviewType: 'Final',
    interviewMode: 'In-Person',
    date: '2024-09-25',
    time: '13:00',
    duration: 60,
    status: 'Completed',
    interviewer: 'Multiple',
    interviewerEmail: 'hr@company.com',
    location: 'Main Office',
    meetingLink: '',
    notes: 'Final interview with team leads and HR',
    feedback: 'Great cultural fit, strong technical skills. Team was impressed with his experience and approach to problem-solving.',
    rating: 5,
    stage: 'Final Interview',
    round: 3,
    totalRounds: 3,
    createdDate: '2024-09-15',
    updatedDate: '2024-09-25'
  }
];

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  interviewType: string;
  interviewMode: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  interviewer: string;
  interviewerEmail: string;
  location: string;
  meetingLink: string;
  notes: string;
  feedback: string;
  rating: number;
  stage: string;
  round: number;
  totalRounds: number;
  createdDate: string;
  updatedDate: string;
}

export default function InterviewsPage() {
  const { selectedTenant } = useTenant();
  const [interviews, setInterviews] = useState<Interview[]>(MOCK_INTERVIEWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  // Filter interviews
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.interviewer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || interview.interviewType.toLowerCase() === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get interview mode icon
  const getInterviewModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'video call': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <Users className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
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

  // Format date and time
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return {
      date: dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: dateObj.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Get upcoming interviews (next 7 days)
  const upcomingInterviews = interviews.filter(interview => {
    const interviewDate = new Date(interview.date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return interviewDate >= today && interviewDate <= nextWeek && interview.status === 'Scheduled';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Management</h1>
          <p className="text-gray-600 mt-1">
            Schedule, manage, and track candidate interviews
          </p>
        </div>
        <Button onClick={() => setIsScheduleModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {interviews.filter(i => i.status === 'Scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {interviews.filter(i => i.status === 'Completed').length}
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
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-purple-600">
                  {upcomingInterviews.length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews Alert */}
      {upcomingInterviews.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Upcoming Interviews This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingInterviews.slice(0, 3).map((interview) => {
                const { date, time } = formatDateTime(interview.date, interview.time);
                return (
                  <div key={interview.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{interview.candidateName}</p>
                        <p className="text-gray-600">{interview.jobTitle}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-gray-900">{date}</p>
                      <p className="text-gray-600">{time}</p>
                    </div>
                  </div>
                );
              })}
              {upcomingInterviews.length > 3 && (
                <p className="text-sm text-blue-600 text-center">
                  +{upcomingInterviews.length - 3} more interviews this week
                </p>
              )}
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
                placeholder="Search candidates, jobs, or interviewers..."
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
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="case study">Case Study</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="portfolio review">Portfolio Review</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interviews List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Interviewer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Mode</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((interview) => {
                  const { date, time } = formatDateTime(interview.date, interview.time);
                  return (
                    <tr key={interview.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{interview.candidateName}</p>
                          <p className="text-sm text-gray-600">{interview.candidateEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">{interview.jobTitle}</p>
                          <p className="text-sm text-gray-600">Round {interview.round}/{interview.totalRounds}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{interview.interviewType}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">{date}</p>
                          <p className="text-sm text-gray-600">{time}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{interview.interviewer}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getInterviewModeIcon(interview.interviewMode)}
                          <span className="text-sm text-gray-700">{interview.interviewMode}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {interview.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            {renderRating(interview.rating)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not rated</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            View
                          </Button>
                          {interview.meetingLink && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(interview.meetingLink, '_blank')}
                            >
                              Join
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interview Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="w-full max-w-[90vw] max-h-[90vh] overflow-y-auto">
          {selectedInterview && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <CalendarIcon className="h-6 w-6" />
                  Interview with {selectedInterview.candidateName}
                  <Badge className={getStatusColor(selectedInterview.status)}>
                    {selectedInterview.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Interview Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Candidate</Label>
                            <p className="text-sm text-gray-900">{selectedInterview.candidateName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Position</Label>
                            <p className="text-sm text-gray-900">{selectedInterview.jobTitle}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Interview Type</Label>
                            <p className="text-sm text-gray-900">{selectedInterview.interviewType}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Round</Label>
                            <p className="text-sm text-gray-900">
                              {selectedInterview.round} of {selectedInterview.totalRounds}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Date</Label>
                            <p className="text-sm text-gray-900">
                              {formatDateTime(selectedInterview.date, selectedInterview.time).date}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Time</Label>
                            <p className="text-sm text-gray-900">
                              {formatDateTime(selectedInterview.date, selectedInterview.time).time}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Duration</Label>
                            <p className="text-sm text-gray-900">{selectedInterview.duration} minutes</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Mode</Label>
                            <div className="flex items-center gap-2">
                              {getInterviewModeIcon(selectedInterview.interviewMode)}
                              <span className="text-sm text-gray-900">{selectedInterview.interviewMode}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Interviewer & Location</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Interviewer</Label>
                          <p className="text-sm text-gray-900">{selectedInterview.interviewer}</p>
                          <p className="text-sm text-gray-600">{selectedInterview.interviewerEmail}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Location</Label>
                          <p className="text-sm text-gray-900">{selectedInterview.location}</p>
                        </div>
                        {selectedInterview.meetingLink && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Meeting Link</Label>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-1"
                              onClick={() => window.open(selectedInterview.meetingLink, '_blank')}
                            >
                              Join Meeting
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{selectedInterview.notes}</p>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Interview
                    </Button>
                    <Button variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                    {selectedInterview.status === 'Scheduled' && (
                      <Button variant="outline">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedInterview.status === 'Completed' ? (
                        <>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Rating</Label>
                            <div className="flex items-center gap-2 mt-1">
                              {renderRating(selectedInterview.rating)}
                              <span className="text-sm text-gray-600 ml-2">
                                {selectedInterview.rating}/5
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Feedback</Label>
                            <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded">
                              {selectedInterview.feedback || 'No feedback provided yet.'}
                            </p>
                          </div>
                          <Button>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Feedback
                          </Button>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            Feedback will be available after the interview is completed.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-gray-900">Interview scheduled</p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedInterview.createdDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {selectedInterview.status === 'Completed' && (
                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm text-gray-900">Interview completed</p>
                              <p className="text-xs text-gray-500">
                                {new Date(selectedInterview.updatedDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="w-auto min-w-[600px] max-w-[85vw]">
          <DialogHeader>
            <DialogTitle>Schedule New Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
                <Label htmlFor="job">Position</Label>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Interview Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="case-study">Case Study</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mode">Interview Mode</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input type="time" />
              </div>
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input type="number" placeholder="60" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="interviewer">Interviewer</Label>
              <Input placeholder="Enter interviewer name" />
            </div>
            
            <div>
              <Label htmlFor="location">Location/Meeting Link</Label>
              <Input placeholder="Conference room or meeting link" />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea placeholder="Interview preparation notes..." />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsScheduleModalOpen(false)}>
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
