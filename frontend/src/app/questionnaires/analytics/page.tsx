
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Search,
  BarChart3,
  Users,
  CheckCircle,
  Eye,
  ArrowLeft,
  TrendingUp,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface QuestionnaireSummary {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  response_count: number;
  completion_rate: number;
  category: string;
  updated_date: string;
}

export default function QuestionnaireAnalyticsDashboard() {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockQuestionnaires: QuestionnaireSummary[] = [
      {
        id: '1',
        title: 'Employee Satisfaction Survey 2024',
        description: 'Quarterly employee satisfaction and engagement survey',
        status: 'active',
        response_count: 156,
        completion_rate: 78.5,
        category: 'HR & Culture',
        updated_date: '2024-01-20'
      },
      {
        id: '2',
        title: 'New Hire Onboarding Feedback',
        description: 'Collect feedback from new employees about their onboarding experience',
        status: 'active',
        response_count: 92,
        completion_rate: 92.0,
        category: 'Onboarding',
        updated_date: '2024-02-05'
      },
      {
        id: '3',
        title: 'Training Program Effectiveness',
        description: 'Evaluate the effectiveness of our professional development programs',
        status: 'completed',
        response_count: 120,
        completion_rate: 85.0,
        category: 'Training',
        updated_date: '2024-03-10'
      },
      {
        id: '4',
        title: 'Remote Work Experience Survey',
        description: 'Assess employee experience with remote work arrangements',
        status: 'paused',
        response_count: 75,
        completion_rate: 60.0,
        category: 'Operations',
        updated_date: '2024-04-01'
      }
    ];

    setTimeout(() => {
      setQuestionnaires(mockQuestionnaires);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredQuestionnaires = questionnaires.filter(q => {
    const matchesSearch = searchTerm === '' ||
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || q.status === statusFilter;
    const matchesCategory = categoryFilter === '' || q.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(questionnaires.map(q => q.category)));

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      case 'draft': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/questionnaires">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Questionnaires
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Questionnaire Analytics</h1>
              <p className="text-gray-600">Overview of all questionnaire responses and insights</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Questionnaires</p>
                  <p className="text-2xl font-bold text-gray-900">{questionnaires.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{questionnaires.reduce((sum, q) => sum + q.response_count, 0)}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{(questionnaires.reduce((sum, q) => sum + q.completion_rate, 0) / questionnaires.length || 0).toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Questionnaires</p>
                  <p className="text-2xl font-bold text-gray-900">{questionnaires.filter(q => q.status === 'active').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questionnaires List for Analytics */}
        <div className="grid gap-6">
          {filteredQuestionnaires.map(questionnaire => (
            <Card key={questionnaire.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {questionnaire.title}
                </CardTitle>
                <Badge variant={getStatusVariant(questionnaire.status)}>{questionnaire.status}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{questionnaire.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Responses</p>
                    <p className="font-medium">{questionnaire.response_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Completion Rate</p>
                    <p className="font-medium">{questionnaire.completion_rate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-medium">{questionnaire.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{new Date(questionnaire.updated_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/questionnaires/analytics/${questionnaire.id}`}>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuestionnaires.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Analytics Available</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter || categoryFilter
                  ? "No questionnaires match your current filters for analytics."
                  : "Create and activate questionnaires to see their analytics here."
                }
              </p>
              {!searchTerm && !statusFilter && !categoryFilter && (
                <Link href="/questionnaires/builder">
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Create New Questionnaire
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

