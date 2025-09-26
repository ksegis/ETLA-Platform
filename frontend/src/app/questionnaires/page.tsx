'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Plus, 
  Search, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  Eye,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import Link from 'next/link';

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_date: string;
  updated_date: string;
  created_by: string;
  question_count: number;
  response_count: number;
  completion_rate: number;
  target_audience: string;
  category: string;
  tags: string[];
  tenant_id: string;
}

export default function QuestionnaireDashboard() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const handleClone = (id: string) => {
    console.log(`Cloning questionnaire with ID: ${id}`);
    // In a real application, this would involve an API call to duplicate the questionnaire
    const questionnaireToClone = questionnaires.find(q => q.id === id);
    if (questionnaireToClone) {
      const newQuestionnaire: Questionnaire = { ...questionnaireToClone, id: String(questionnaires.length + 1), title: `${questionnaireToClone.title} (Copy)`, status: 'draft', created_date: new Date().toISOString(), updated_date: new Date().toISOString(), response_count: 0, completion_rate: 0 };
      setQuestionnaires(prev => [...prev, newQuestionnaire]);
      alert(`Questionnaire '${questionnaireToClone.title}' cloned successfully as a draft!`);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this questionnaire?")) {
      console.log(`Deleting questionnaire with ID: ${id}`);
      // In a real application, this would involve an API call to delete the questionnaire
      setQuestionnaires(prev => prev.filter(q => q.id !== id));
      alert("Questionnaire deleted successfully!");
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockQuestionnaires: Questionnaire[] = [
      {
        id: '1',
        title: 'Employee Satisfaction Survey 2024',
        description: 'Annual employee satisfaction and engagement survey to measure workplace culture and identify improvement areas.',
        status: 'active',
        created_date: '2024-01-15',
        updated_date: '2024-01-20',
        created_by: 'HR Team',
        question_count: 25,
        response_count: 142,
        completion_rate: 78.5,
        target_audience: 'All Employees',
        category: 'HR & Culture',
        tags: ['satisfaction', 'engagement', 'annual'],
        tenant_id: 'tenant-1'
      },
      {
        id: '2',
        title: 'New Hire Onboarding Feedback',
        description: 'Collect feedback from new employees about their onboarding experience and process improvements.',
        status: 'active',
        created_date: '2024-02-01',
        updated_date: '2024-02-05',
        created_by: 'Onboarding Team',
        question_count: 15,
        response_count: 23,
        completion_rate: 92.0,
        target_audience: 'New Hires',
        category: 'Onboarding',
        tags: ['onboarding', 'feedback', 'new-hire'],
        tenant_id: 'tenant-1'
      },
      {
        id: '3',
        title: 'Training Program Effectiveness',
        description: 'Evaluate the effectiveness of our professional development and training programs.',
        status: 'draft',
        created_date: '2024-02-10',
        updated_date: '2024-02-12',
        created_by: 'Learning & Development',
        question_count: 18,
        response_count: 0,
        completion_rate: 0,
        target_audience: 'Training Participants',
        category: 'Training',
        tags: ['training', 'development', 'effectiveness'],
        tenant_id: 'tenant-1'
      },
      {
        id: '4',
        title: 'Remote Work Experience Survey',
        description: 'Assess employee experience with remote work arrangements and identify support needs.',
        status: 'completed',
        created_date: '2023-12-01',
        updated_date: '2024-01-15',
        created_by: 'Operations Team',
        question_count: 20,
        response_count: 89,
        completion_rate: 85.2,
        target_audience: 'Remote Employees',
        category: 'Operations',
        tags: ['remote-work', 'experience', 'support'],
        tenant_id: 'tenant-1'
      },
      {
        id: '5',
        title: 'Manager Feedback Collection',
        description: 'Gather feedback about management effectiveness and leadership development needs.',
        status: 'paused',
        created_date: '2024-01-25',
        updated_date: '2024-02-08',
        created_by: 'Leadership Team',
        question_count: 22,
        response_count: 34,
        completion_rate: 45.3,
        target_audience: 'All Employees',
        category: 'Leadership',
        tags: ['management', 'leadership', 'feedback'],
        tenant_id: 'tenant-1'
      }
    ];

    setTimeout(() => {
      setQuestionnaires(mockQuestionnaires);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter questionnaires
  const filteredQuestionnaires = questionnaires.filter(q => {
    const matchesSearch = searchTerm === '' || 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '' || q.status === statusFilter;
    const matchesCategory = categoryFilter === '' || q.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(questionnaires.map(q => q.category)));

  // Get status badge variant
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'paused':
        return 'outline';
      case 'completed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      case 'paused':
        return <PauseCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Calculate summary statistics
  const stats = {
    total: questionnaires.length,
    active: questionnaires.filter(q => q.status === 'active').length,
    draft: questionnaires.filter(q => q.status === 'draft').length,
    totalResponses: questionnaires.reduce((sum, q) => sum + q.response_count, 0),
    avgCompletionRate: questionnaires.length > 0 
      ? questionnaires.reduce((sum, q) => sum + q.completion_rate, 0) / questionnaires.length 
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questionnaires</h1>
          <p className="text-gray-600">Create, manage, and analyze questionnaires and surveys</p>
        </div>
        <div className="flex gap-3">
          <Link href="/questionnaires/builder">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </Link>
          <Link href="/questionnaires/analytics">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/questionnaires/builder">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Questionnaire
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questionnaires</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <PlayCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgCompletionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search questionnaires..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questionnaires List */}
      <div className="grid gap-6">
        {filteredQuestionnaires.map((questionnaire) => (
          <Card key={questionnaire.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{questionnaire.title}</CardTitle>
                    <Badge variant={getStatusVariant(questionnaire.status)} className="flex items-center gap-1">
                      {getStatusIcon(questionnaire.status)}
                      {questionnaire.status.charAt(0).toUpperCase() + questionnaire.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{questionnaire.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{questionnaire.question_count} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{questionnaire.response_count} responses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      <span>{questionnaire.completion_rate}% completion</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Updated {new Date(questionnaire.updated_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline">{questionnaire.category}</Badge>
                    <span className="text-sm text-gray-500">Target: {questionnaire.target_audience}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {questionnaire.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link href={`/questionnaires/respond/${questionnaire.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/questionnaires/builder/${questionnaire.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => handleClone(questionnaire.id)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Clone
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(questionnaire.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredQuestionnaires.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No questionnaires found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter || categoryFilter 
                ? "Try adjusting your filters or search terms."
                : "Get started by creating your first questionnaire."
              }
            </p>
            {!searchTerm && !statusFilter && !categoryFilter && (
              <Link href="/questionnaires/builder">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Questionnaire
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
}
