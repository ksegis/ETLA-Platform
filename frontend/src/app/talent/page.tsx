/**
 * Talent Dashboard - Main ATS Dashboard
 * Provides overview of recruitment activities and key metrics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface DashboardMetrics {
  activeJobs: number;
  totalCandidates: number;
  pendingInterviews: number;
  offersExtended: number;
  hiresThisMonth: number;
  averageTimeToHire: number;
  conversionRate: number;
  topSources: Array<{ source: string; count: number }>;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'hire';
  description: string;
  timestamp: string;
  jobTitle?: string;
  candidateName?: string;
}

export default function TalentDashboard() {
  const { selectedTenant } = useTenant();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    if (selectedTenant?.id) {
      loadDashboardData();
    }
  }, [selectedTenant?.id]);

  const loadDashboardData = async () => {
    try {
      setloading(true);
      
      // Load metrics and recent activity
      await Promise.all([
        loadMetrics(),
        loadRecentActivity()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setloading(false);
    }
  };

  const loadMetrics = async () => {
    // This would typically load from your ATS tables
    // For now, using mock data structure
    const mockMetrics: DashboardMetrics = {
      activeJobs: 12,
      totalCandidates: 156,
      pendingInterviews: 8,
      offersExtended: 3,
      hiresThisMonth: 5,
      averageTimeToHire: 18,
      conversionRate: 12.5,
      topSources: [
        { source: 'LinkedIn', count: 45 },
        { source: 'Indeed', count: 32 },
        { source: 'Referral', count: 28 },
        { source: 'Company Website', count: 21 }
      ]
    };
    
    setMetrics(mockMetrics);
  };

  const loadRecentActivity = async () => {
    // Mock recent activity data
    const mockActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'application',
        description: 'New application received',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        jobTitle: 'Senior Software Engineer',
        candidateName: 'John Smith'
      },
      {
        id: '2',
        type: 'interview',
        description: 'Interview scheduled',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        jobTitle: 'Product Manager',
        candidateName: 'Sarah Johnson'
      },
      {
        id: '3',
        type: 'offer',
        description: 'Offer extended',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        jobTitle: 'UX Designer',
        candidateName: 'Mike Chen'
      },
      {
        id: '4',
        type: 'hire',
        description: 'Offer accepted - New hire!',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        jobTitle: 'Data Analyst',
        candidateName: 'Emily Davis'
      }
    ];
    
    setRecentActivity(mockActivity);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'interview':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'offer':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'hire':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-100 rounded"></div>
              <div className="h-96 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Talent Dashboard</h1>
            <p className="text-gray-600">Overview of your recruitment activities</p>
          </div>
          <div className="flex gap-3">
            <Link href="/talent/candidates/new">
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Candidate
              </Button>
            </Link>
            <Link href="/talent/jobs/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.activeJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <Link href="/talent/jobs" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View all jobs <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.totalCandidates}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Link href="/talent/candidates" className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1">
                View candidates <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.pendingInterviews}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <Link href="/talent/interviews" className="text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1">
                View interviews <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offers Extended</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.offersExtended}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <Link href="/talent/offers" className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
                View offers <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Hires This Month</p>
              <p className="text-2xl font-bold text-green-600">{metrics?.hiresThisMonth}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
              <p className="text-2xl font-bold text-blue-600">{metrics?.averageTimeToHire} days</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-600">{metrics?.conversionRate}%</p>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Link href="/talent/reports">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    {activity.candidateName && activity.jobTitle && (
                      <p className="text-sm text-gray-600">
                        {activity.candidateName} • {activity.jobTitle}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Sources */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Candidate Sources</h3>
              <Link href="/talent/reports">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  View Report
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {metrics?.topSources.map((source, index) => {
                const percentage = (source.count / metrics.totalCandidates) * 100;
                return (
                  <div key={source.source} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {source.source}
                      </span>
                      <span className="text-sm text-gray-600">
                        {source.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/talent/jobs">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Manage Jobs
              </Button>
            </Link>
            <Link href="/talent/candidates">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Users className="h-4 w-4" />
                View Candidates
              </Button>
            </Link>
            <Link href="/talent/interviews">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Interview
              </Button>
            </Link>
            <Link href="/talent/reports">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                View Reports
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
