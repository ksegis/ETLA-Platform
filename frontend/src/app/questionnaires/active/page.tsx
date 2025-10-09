'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Search, 
  Filter, 
  Eye, 
  BarChart3, 
  Users, 
  Clock, 
  Calendar,
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react';
import Link from 'next/link';

interface ActiveQuestionnaire {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'paused';
  created_date: string;
  end_date?: string;
  response_count: number;
  target_responses: number;
  completion_rate: number;
  category: string;
  tags: string[];
}

export default function ActiveQuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<ActiveQuestionnaire[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadActiveQuestionnaires();
  }, []);

  const loadActiveQuestionnaires = async () => {
    try {
      setLoading(true);
      
      // Mock data for active questionnaires
      const mockData: ActiveQuestionnaire[] = [
        {
          id: '1',
          title: 'Employee Satisfaction Survey Q4 2024',
          description: 'Quarterly employee satisfaction and engagement survey',
          status: 'active',
          created_date: '2024-09-15',
          end_date: '2024-10-15',
          response_count: 156,
          target_responses: 300,
          completion_rate: 52.0,
          category: 'HR',
          tags: ['satisfaction', 'quarterly', 'engagement']
        },
        {
          id: '2',
          title: 'Product Feedback Collection',
          description: 'Gathering feedback on new product features',
          status: 'active',
          created_date: '2024-09-20',
          end_date: '2024-10-20',
          response_count: 89,
          target_responses: 200,
          completion_rate: 44.5,
          category: 'Product',
          tags: ['feedback', 'product', 'features']
        },
        {
          id: '3',
          title: 'Training Effectiveness Assessment',
          description: 'Evaluating the effectiveness of recent training programs',
          status: 'paused',
          created_date: '2024-09-10',
          end_date: '2024-10-10',
          response_count: 67,
          target_responses: 150,
          completion_rate: 44.7,
          category: 'Training',
          tags: ['training', 'assessment', 'effectiveness']
        }
      ];
      
      setQuestionnaires(mockData);
    } catch (error) {
      console.error('Error loading active questionnaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestionnaires = questionnaires.filter(questionnaire => {
    const matchesSearch = questionnaire.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         questionnaire.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || questionnaire.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded"></div>
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/questionnaires">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Questionnaires
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Active Surveys</h1>
              <p className="text-gray-600">Monitor and manage currently running questionnaires</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {questionnaires.filter(q => q.status === 'active').length}
                  </p>
                </div>
                <PlayCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paused</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {questionnaires.filter(q => q.status === 'paused').length}
                  </p>
                </div>
                <PauseCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {questionnaires.reduce((sum, q) => sum + q.response_count, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(questionnaires.reduce((sum, q) => sum + q.completion_rate, 0) / questionnaires.length).toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search active questionnaires..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Questionnaires Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestionnaires.map((questionnaire) => (
            <Card key={questionnaire.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {questionnaire.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {questionnaire.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(questionnaire.status)}>
                    {questionnaire.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Responses</span>
                    <span>{questionnaire.response_count} / {questionnaire.target_responses}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${questionnaire.completion_rate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {questionnaire.completion_rate.toFixed(1)}% complete
                  </p>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Started: {formatDate(questionnaire.created_date)}
                  </div>
                </div>
                {questionnaire.end_date && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Ends: {formatDate(questionnaire.end_date)}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {questionnaire.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {questionnaire.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{questionnaire.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/questionnaires/analytics/${questionnaire.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href={`/questionnaires/respond/${questionnaire.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuestionnaires.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Active Questionnaires Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter 
                  ? "No questionnaires match your current filters."
                  : "You don't have any active questionnaires at the moment."
                }
              </p>
              {!searchTerm && !statusFilter && (
                <Link href="/questionnaires/builder">
                  <Button>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Create Your First Active Survey
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
