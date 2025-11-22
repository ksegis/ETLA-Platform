'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FEATURES, PERMISSIONS } from '@/rbac/constants';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Activity, Clock, TrendingUp, Zap, RefreshCw } from 'lucide-react';

interface RunningJob {
  id: string;
  integration_config_id: string;
  endpoint_display_name: string;
  status: string;
  total_records: number;
  processed_records: number;
  failed_records: number;
  progress_percentage: number;
  sync_started_at: string;
  estimated_completion_at: string | null;
  throughput_records_per_second: number;
  average_latency_ms: number;
  elapsed_seconds: number;
  remaining_seconds: number | null;
}

interface PerformanceMetrics {
  endpoint_name: string;
  endpoint_display_name: string;
  average_throughput: number;
  peak_throughput: number;
  average_latency_ms: number;
  success_rate_percentage: number;
}

export default function ProgressMonitoringPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const { canAccessFeature, hasPermission, isHostAdmin } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Tenant selector for host admins
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  // Data
  const [runningJobs, setRunningJobs] = useState<RunningJob[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    if (user && isHostAdmin()) {
      loadTenants();
    }
  }, [user]);

  useEffect(() => {
    const tenantId = isHostAdmin() ? selectedTenantId : tenant?.id;
    if (user && tenantId) {
      loadData(tenantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tenant, selectedTenantId]);

  // Auto-refresh every 2 seconds for running jobs
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const tenantId = isHostAdmin() ? selectedTenantId : tenant?.id;
      if (user && tenantId) {
        loadRunningJobs(tenantId);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh, user, tenant, selectedTenantId, isHostAdmin]);

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

  const loadData = async (tenantId: string) => {
    setLoading(true);
    await Promise.all([
      loadRunningJobs(tenantId),
      loadPerformanceMetrics(tenantId)
    ]);
    setLoading(false);
  };

  const loadRunningJobs = async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from('sync_progress_monitor')
        .select('*')
        .order('sync_started_at', { ascending: false });

      if (error) throw error;
      setRunningJobs(data || []);
    } catch (error) {
      console.error('Error loading running jobs:', error);
    }
  };

  const loadPerformanceMetrics = async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from('integration_sync_configs')
        .select(`
          endpoint_name,
          endpoint_display_name,
          average_throughput,
          peak_throughput,
          average_latency_ms,
          success_rate_percentage
        `)
        .order('endpoint_name');

      if (error) throw error;
      setPerformanceMetrics(data || []);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds < 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatThroughput = (recordsPerSecond: number): string => {
    if (!recordsPerSecond) return '0 rec/s';
    
    if (recordsPerSecond >= 1000) {
      return `${(recordsPerSecond / 1000).toFixed(1)}k rec/s`;
    }
    return `${recordsPerSecond.toFixed(1)} rec/s`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progress Monitoring</h1>
              <p className="text-sm text-gray-600">Real-time job progress and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700">Auto-refresh:</Label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                {autoRefresh ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        {/* Running Jobs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Running Jobs</h2>
              <span className="text-sm text-gray-600">{runningJobs.length} active</span>
            </div>
          </div>
          <div className="p-6">
            {runningJobs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No jobs currently running</p>
              </div>
            ) : (
              <div className="space-y-6">
                {runningJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.endpoint_display_name}</h3>
                        <p className="text-sm text-gray-600">
                          Started {new Date(job.sync_started_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">Running</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Progress: {job.progress_percentage.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-600">
                          {job.processed_records.toLocaleString()} / {job.total_records.toLocaleString()} records
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min(job.progress_percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-900">Elapsed</span>
                        </div>
                        <p className="text-lg font-semibold text-blue-900">
                          {formatDuration(job.elapsed_seconds)}
                        </p>
                      </div>

                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-900">Remaining</span>
                        </div>
                        <p className="text-lg font-semibold text-purple-900">
                          {job.remaining_seconds ? formatDuration(job.remaining_seconds) : 'Calculating...'}
                        </p>
                      </div>

                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-900">Throughput</span>
                        </div>
                        <p className="text-lg font-semibold text-green-900">
                          {formatThroughput(job.throughput_records_per_second)}
                        </p>
                      </div>

                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-medium text-orange-900">Latency</span>
                        </div>
                        <p className="text-lg font-semibold text-orange-900">
                          {job.average_latency_ms || 0}ms
                        </p>
                      </div>
                    </div>

                    {/* Failed Records */}
                    {job.failed_records > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                          ⚠️ {job.failed_records} records failed
                        </p>
                      </div>
                    )}

                    {/* ETA */}
                    {job.estimated_completion_at && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Estimated completion:</span>{' '}
                        {new Date(job.estimated_completion_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">Performance Metrics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Throughput
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peak Throughput
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Latency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceMetrics.map((metric) => (
                  <tr key={metric.endpoint_name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{metric.endpoint_display_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {metric.average_throughput ? formatThroughput(metric.average_throughput) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {metric.peak_throughput ? formatThroughput(metric.peak_throughput) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {metric.average_latency_ms ? `${metric.average_latency_ms}ms` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {metric.success_rate_percentage ? `${metric.success_rate_percentage.toFixed(1)}%` : 'N/A'}
                        </div>
                        {metric.success_rate_percentage && (
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                metric.success_rate_percentage >= 95 ? 'bg-green-500' :
                                metric.success_rate_percentage >= 80 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${metric.success_rate_percentage}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
