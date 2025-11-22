'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FEATURES, PERMISSIONS } from '@/rbac/constants';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, AlertCircle, Play, Pause } from 'lucide-react';

interface SyncJob {
  id: string;
  integration_config_id: string;
  endpoint_name: string;
  sync_status: string;
  records_processed: number;
  records_failed: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  integration_name?: string;
}

interface JobMetrics {
  total: number;
  successful: number;
  failed: number;
  running: number;
}

export default function JobsPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const { canAccessFeature, isHostAdmin } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [metrics, setMetrics] = useState<JobMetrics>({
    total: 0,
    successful: 0,
    failed: 0,
    running: 0,
  });

  // Tenant selector for host admins
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  // Check permissions
  useEffect(() => {
    if (!canAccessFeature(FEATURES.ETL_JOBS)) {
      router.push('/dashboard');
    }
  }, [canAccessFeature, router]);

  // Load tenants for host admins
  useEffect(() => {
    if (user && isHostAdmin()) {
      loadTenants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load jobs
  useEffect(() => {
    const tenantId = isHostAdmin() ? selectedTenantId : tenant?.id;
    if (user && tenantId) {
      loadJobs(tenantId);
    } else if (user && !isHostAdmin() && !tenant?.id) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tenant, selectedTenantId]);

  const loadTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAvailableTenants(data || []);
      
      if (data && data.length > 0 && !selectedTenantId) {
        setSelectedTenantId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadJobs = async (tenantId: string) => {
    try {
      setLoading(true);

      // Load integration configs for this tenant
      const { data: configs, error: configsError } = await supabase
        .from('integration_configs')
        .select('id, integration_name')
        .eq('tenant_id', tenantId);

      if (configsError) throw configsError;

      const configIds = configs?.map(c => c.id) || [];
      const configMap = configs?.reduce((acc: any, c: any) => {
        acc[c.id] = c.integration_name;
        return acc;
      }, {}) || {};

      // Load sync history
      let syncHistory: any[] = [];
      if (configIds.length > 0) {
        const { data: historyData, error: historyError } = await supabase
          .from('integration_sync_history')
          .select('*')
          .in('integration_config_id', configIds)
          .order('started_at', { ascending: false })
          .limit(50);

        if (historyError) throw historyError;
        syncHistory = historyData || [];
      }

      // Add integration names to jobs
      const jobsWithNames = syncHistory.map((job: any) => ({
        ...job,
        integration_name: configMap[job.integration_config_id] || 'Unknown',
      }));

      setJobs(jobsWithNames);

      // Calculate metrics
      const total = syncHistory.length;
      const successful = syncHistory.filter(j => j.sync_status === 'success').length;
      const failed = syncHistory.filter(j => j.sync_status === 'error' || j.sync_status === 'failed').length;
      const running = syncHistory.filter(j => j.sync_status === 'running' || j.sync_status === 'in_progress').length;

      setMetrics({ total, successful, failed, running });

    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
      case 'in_progress':
        return <Play className="h-5 w-5 text-blue-600 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; border: string; label: string }> = {
      success: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Completed' },
      running: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Running' },
      in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'In Progress' },
      error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Failed' },
      failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Failed' },
    };

    const badge = badges[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Unknown' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const formatDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return 'Running...';
    
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;

    if (diffMins > 0) {
      return `${diffMins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const selectedTenant = isHostAdmin() 
    ? availableTenants.find(t => t.id === selectedTenantId)
    : tenant;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ETL Job History</h1>
            <p className="mt-2 text-gray-600">
              ETL job execution history and monitoring for {selectedTenant?.name || 'your organization'}
            </p>
          </div>
          {isHostAdmin() && availableTenants.length > 0 && (
            <div className="flex items-center gap-2">
              <Label htmlFor="tenant-select" className="text-sm font-medium text-gray-700">Tenant:</Label>
              <select
                id="tenant-select"
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableTenants.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Successful</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.successful}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.failed}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Running</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.running}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent ETL Jobs</CardTitle>
                <CardDescription>
                  Latest job executions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(job.sync_status)}
                              <h4 className="text-sm font-medium text-gray-900">
                                {job.integration_name} - {job.endpoint_name}
                              </h4>
                              {getStatusBadge(job.sync_status)}
                            </div>
                            <p className="text-xs text-gray-500">
                              Started: {formatDateTime(job.started_at)} | 
                              Duration: {formatDuration(job.started_at, job.completed_at)}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Processed: {job.records_processed} records
                              {job.records_failed > 0 && ` | Failed: ${job.records_failed} records`}
                            </p>
                            {job.error_message && (
                              <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-200">
                                Error: {job.error_message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No ETL jobs found</p>
                    <p className="text-xs mt-1">Jobs will appear here after sync operations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
