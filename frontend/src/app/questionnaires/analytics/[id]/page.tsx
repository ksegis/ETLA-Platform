'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  Download,
  Filter,
  Calendar,
  Star,
  MessageSquare,
  ArrowLeft,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface QuestionAnalytics {
  question_id: string;
  question_title: string;
  question_type: string;
  total_responses: number;
  response_rate: number;
  analytics: {
    // For choice questions
    choice_distribution?: { option: string; count: number; percentage: number }[];
    // For rating questions
    average_rating?: number;
    rating_distribution?: { rating: number; count: number; percentage: number }[];
    // For text questions
    common_themes?: { theme: string; count: number }[];
    word_cloud?: { word: string; frequency: number }[];
    // General stats
    completion_rate: number;
    skip_rate: number;
  };
}

interface ResponseData {
  id: string;
  respondent_id?: string;
  respondent_name?: string;
  submitted_at: string;
  time_taken: number;
  responses: { question_id: string; value: any }[];
  metadata: {
    ip_address?: string;
    user_agent?: string;
    location?: string;
  };
}

interface QuestionnaireAnalytics {
  questionnaire: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    created_at: string;
    total_questions: number;
  };
  overview: {
    total_responses: number;
    completion_rate: number;
    average_time: number;
    response_rate: number;
    last_response: string;
  };
  demographics: {
    by_department?: { department: string; count: number }[];
    by_role?: { role: string; count: number }[];
    by_location?: { location: string; count: number }[];
  };
  questions: QuestionAnalytics[];
  responses: ResponseData[];
  trends: {
    daily_responses: { date: string; count: number }[];
    completion_trends: { date: string; completion_rate: number }[];
  };
}

export default function QuestionnaireAnalytics() {
  const params = useParams();
  const questionnaireId = params.id as string;

  const [analytics, setAnalytics] = useState<QuestionnaireAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<string>('overview');
  const [showRawData, setShowRawData] = useState<boolean>(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockAnalytics: QuestionnaireAnalytics = {
      questionnaire: {
        id: questionnaireId,
        title: 'Employee Satisfaction Survey 2024',
        description: 'Annual employee satisfaction and engagement survey',
        category: 'HR & Culture',
        status: 'active',
        created_at: '2024-02-01T10:00:00Z',
        total_questions: 5
      },
      overview: {
        total_responses: 247,
        completion_rate: 89.2,
        average_time: 8.5,
        response_rate: 76.3,
        last_response: '2024-02-20T15:30:00Z'
      },
      demographics: {
        by_department: [
          { department: 'Engineering', count: 89 },
          { department: 'Marketing', count: 45 },
          { department: 'Sales', count: 67 },
          { department: 'HR', count: 23 },
          { department: 'Operations', count: 23 }
        ],
        by_role: [
          { role: 'Individual Contributor', count: 156 },
          { role: 'Team Lead', count: 45 },
          { role: 'Manager', count: 32 },
          { role: 'Director', count: 14 }
        ]
      },
      questions: [
        {
          question_id: 'q1',
          question_title: 'How satisfied are you with your current role?',
          question_type: 'single_choice',
          total_responses: 247,
          response_rate: 100,
          analytics: {
            choice_distribution: [
              { option: 'Very Satisfied', count: 89, percentage: 36.0 },
              { option: 'Satisfied', count: 112, percentage: 45.3 },
              { option: 'Neutral', count: 32, percentage: 13.0 },
              { option: 'Dissatisfied', count: 11, percentage: 4.5 },
              { option: 'Very Dissatisfied', count: 3, percentage: 1.2 }
            ],
            completion_rate: 100,
            skip_rate: 0
          }
        },
        {
          question_id: 'q2',
          question_title: 'Rate your work-life balance',
          question_type: 'rating',
          total_responses: 245,
          response_rate: 99.2,
          analytics: {
            average_rating: 3.8,
            rating_distribution: [
              { rating: 1, count: 8, percentage: 3.3 },
              { rating: 2, count: 23, percentage: 9.4 },
              { rating: 3, count: 67, percentage: 27.3 },
              { rating: 4, count: 98, percentage: 40.0 },
              { rating: 5, count: 49, percentage: 20.0 }
            ],
            completion_rate: 99.2,
            skip_rate: 0.8
          }
        },
        {
          question_id: 'q3',
          question_title: 'Which benefits are most important to you?',
          question_type: 'multiple_choice',
          total_responses: 240,
          response_rate: 97.2,
          analytics: {
            choice_distribution: [
              { option: 'Health Insurance', count: 198, percentage: 82.5 },
              { option: 'Retirement Plan', count: 156, percentage: 65.0 },
              { option: 'Flexible Hours', count: 134, percentage: 55.8 },
              { option: 'Remote Work', count: 123, percentage: 51.3 },
              { option: 'Professional Development', count: 89, percentage: 37.1 },
              { option: 'Paid Time Off', count: 167, percentage: 69.6 }
            ],
            completion_rate: 97.2,
            skip_rate: 2.8
          }
        }
      ],
      responses: [
        {
          id: 'r1',
          respondent_name: 'Anonymous User 1',
          submitted_at: '2024-02-20T14:30:00Z',
          time_taken: 420,
          responses: [
            { question_id: 'q1', value: 'Satisfied' },
            { question_id: 'q2', value: 4 },
            { question_id: 'q3', value: ['Health Insurance', 'Flexible Hours'] }
          ],
          metadata: {
            location: 'San Francisco, CA'
          }
        }
      ],
      trends: {
        daily_responses: [
          { date: '2024-02-15', count: 23 },
          { date: '2024-02-16', count: 31 },
          { date: '2024-02-17', count: 28 },
          { date: '2024-02-18', count: 19 },
          { date: '2024-02-19', count: 35 },
          { date: '2024-02-20', count: 42 }
        ],
        completion_trends: [
          { date: '2024-02-15', completion_rate: 87.2 },
          { date: '2024-02-16', completion_rate: 89.1 },
          { date: '2024-02-17', completion_rate: 88.5 },
          { date: '2024-02-18', completion_rate: 90.3 },
          { date: '2024-02-19', completion_rate: 89.8 },
          { date: '2024-02-20', completion_rate: 91.2 }
        ]
      }
    };

    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, [questionnaireId]);

  // Export functions
  const exportToCSV = () => {
    if (!analytics) return;
    
    // Create CSV content
    const headers = ['Response ID', 'Submitted At', 'Time Taken (seconds)', 'Respondent'];
    analytics.questions.forEach(q => headers.push(q.question_title));
    
    const rows = analytics.responses.map(response => {
      const row = [
        response.id,
        new Date(response.submitted_at).toLocaleString(),
        response.time_taken.toString(),
        response.respondent_name || 'Anonymous'
      ];
      
      analytics.questions.forEach(q => {
        const answer = response.responses.find(r => r.question_id === q.question_id);
        row.push(answer ? (Array.isArray(answer.value) ? answer.value.join('; ') : answer.value.toString()) : '');
      });
      
      return row;
    });
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analytics.questionnaire.title}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSummaryReport = () => {
    if (!analytics) return;
    
    let report = `${analytics.questionnaire.title} - Analytics Report\n`;
    report += `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    report += `OVERVIEW\n`;
    report += `Total Responses: ${analytics.overview.total_responses}\n`;
    report += `Completion Rate: ${analytics.overview.completion_rate}%\n`;
    report += `Average Time: ${analytics.overview.average_time} minutes\n`;
    report += `Response Rate: ${analytics.overview.response_rate}%\n\n`;
    
    analytics.questions.forEach((question, index) => {
      report += `QUESTION ${index + 1}: ${question.question_title}\n`;
      report += `Response Rate: ${question.response_rate}%\n`;
      
      if (question.analytics.choice_distribution) {
        report += `Responses:\n`;
        question.analytics.choice_distribution.forEach(choice => {
          report += `  ${choice.option}: ${choice.count} (${choice.percentage}%)\n`;
        });
      }
      
      if (question.analytics.average_rating) {
        report += `Average Rating: ${question.analytics.average_rating}/5\n`;
      }
      
      report += `\n`;
    });
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analytics.questionnaire.title}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">Analytics not available</h3>
        <p className="text-gray-600">Unable to load analytics for this questionnaire.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link href="/questionnaires">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questionnaires
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{analytics.questionnaire.title}</h1>
            <p className="text-gray-600 mt-1">Analytics Dashboard</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="secondary">{analytics.questionnaire.category}</Badge>
              <Badge variant={analytics.questionnaire.status === 'active' ? 'default' : 'secondary'}>
                {analytics.questionnaire.status}
              </Badge>
              <span className="text-sm text-gray-600">
                Created {new Date(analytics.questionnaire.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSummaryReport}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.total_responses}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.completion_rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.average_time}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.response_rate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Responses by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.demographics.by_department?.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(dept.count / analytics.overview.total_responses) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responses by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.demographics.by_role?.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{role.role}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(role.count / analytics.overview.total_responses) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{role.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Question Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {analytics.questions.map((question, index) => (
              <div key={question.question_id} className="border-b border-gray-200 pb-8 last:border-b-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Question {index + 1}: {question.question_title}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{question.total_responses} responses</span>
                      <span>{question.response_rate}% response rate</span>
                      <Badge variant="outline">{question.question_type}</Badge>
                    </div>
                  </div>
                </div>

                {/* Choice Distribution */}
                {question.analytics.choice_distribution && (
                  <div className="space-y-3">
                    {question.analytics.choice_distribution.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 flex-1">{choice.option}</span>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-600 h-3 rounded-full"
                              style={{ width: `${choice.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {choice.count} ({choice.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rating Distribution */}
                {question.analytics.rating_distribution && (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-lg font-semibold text-gray-900">
                        Average: {question.analytics.average_rating}/5
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${
                              i < Math.floor(question.analytics.average_rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {question.analytics.rating_distribution.map((rating, ratingIndex) => (
                        <div key={ratingIndex} className="text-center">
                          <div className="text-sm font-medium text-gray-700 mb-1">{rating.rating}</div>
                          <div className="bg-gray-200 rounded h-20 flex items-end">
                            <div 
                              className="bg-yellow-400 rounded w-full"
                              style={{ height: `${rating.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{rating.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Response Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Daily Responses</h4>
              <div className="space-y-2">
                {analytics.trends.daily_responses.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(day.count / Math.max(...analytics.trends.daily_responses.map(d => d.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 w-8">{day.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate Trend</h4>
              <div className="space-y-2">
                {analytics.trends.completion_trends.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${day.completion_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 w-12">{day.completion_rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Data Toggle */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Individual Responses</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowRawData(!showRawData)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showRawData ? 'Hide' : 'Show'} Raw Data
            </Button>
          </div>
        </CardHeader>
        {showRawData && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Response ID</th>
                    <th className="text-left py-2">Submitted</th>
                    <th className="text-left py-2">Time Taken</th>
                    <th className="text-left py-2">Respondent</th>
                    <th className="text-left py-2">Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.responses.slice(0, 10).map((response, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2">{response.id}</td>
                      <td className="py-2">{new Date(response.submitted_at).toLocaleString()}</td>
                      <td className="py-2">{Math.floor(response.time_taken / 60)}m {response.time_taken % 60}s</td>
                      <td className="py-2">{response.respondent_name || 'Anonymous'}</td>
                      <td className="py-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analytics.responses.length > 10 && (
                <div className="text-center py-4 text-gray-600">
                  Showing 10 of {analytics.responses.length} responses
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
      </div>
    </DashboardLayout>
  );
}
