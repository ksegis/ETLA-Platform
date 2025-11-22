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
import { BarChart3, Users, FileText, TrendingUp, Database, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface DashboardMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  successRate: number;
  activeIntegrations: number;
  totalRecordsProcessed: number;
}

interface RecentSync {
  id: string;
  endpoint_name: string;
  sync_status: string;
  records_processed: number;
  started_at: string;
  completed_at: string | null;
}

interface IntegrationHealth {
  id: string;
  integration_name: string;
  connection_status: string;
  last_connection_test: string | null;
  is_active: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const { canAccessFeature, isHostAdmin } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    successRate: 0,
    activeIntegrations: 0,
    totalRecordsProcessed: 0,
  });
  const [recentSyncs, setRecentSyncs] = useState<RecentSync[]>([]);
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealth[]>([]);

  // Tenant selector for host admins
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  // Check permissions
  useEffect(() => {
    if (!canAccessFeature(FEATURES.ETL_DASHBOARD)) {
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

  // Load dashboard data
  useEffect(() => {
    const tenantId = isHostAdmin() ? selectedTenantId : tenant?.id;
    if (user && tenantId) {
      loadDashboardData(tenantId);
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
      
      // Auto-select first tenant
      if (data && data.length > 0 && !selectedTenantId) {
        setSelectedTenantId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadDashboardData = async (tenantId: string) => {
    try {
      setLoading(true);

      // Load integration configs
      const { data: configs, error: configsError } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('tenant_id', tenantId);

      if (configsError) throw configsError;

      const configIds = configs?.map((c: any) => c.id) || [];

      // Load sync history
      let syncHistory: any[] = [];
      if (configIds.length > 0) {
        const { data: historyData, error: historyError } = await supabase
          .from('integration_sync_history')
          .select('*')
          .in('integration_config_id', configIds)
          .order('started_at', { ascending: false });

        if (historyError) throw historyError;
        syncHistory = historyData || [];
      }

      // Calculate metrics
      const totalSyncs = syncHistory.length;
      const successfulSyncs = syncHistory.filter(s => s.sync_status === 'success').length;
      const failedSyncs = syncHistory.filter(s => s.sync_status === 'error' || s.sync_status === 'failed').length;
      const successRate = totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0;
      const activeIntegrations = configs?.filter(c => c.is_active).length || 0;
      const totalRecordsProcessed = syncHistory.reduce((sum, s) => sum + (s.records_processed || 0), 0);

      setMetrics({
        totalSyncs,
        successfulSyncs,
        failedSyncs,
        successRate,
        activeIntegrations,
        totalRecordsProcessed,
      });

      // Set recent syncs (last 5)
      setRecentSyncs(syncHistory.slice(0, 5));

      // Set integration health
      setIntegrationHealth(configs || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
      case 'testing':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; border: string; label: string }> = {
      success: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Completed' },
      running: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Running' },
      error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Failed' },
      failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Failed' },
      connected: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Healthy' },
      testing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Testing' },
    };

    const badge = badges[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Unknown' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const selectedTenant = isHostAdmin() 
    ? availableTenants.find(t => t.id === selectedTenantId)
    : tenant;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ETL Dashboard</h1>
            <p className="mt-2 text-gray-600">
              ETL operations overview for {selectedTenant?.name || 'your organization'}
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
                      <p className="text-sm font-medium text-gray-600">Total Records</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics.totalRecordsProcessed.toLocaleString()}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.activeIntegrations}</p>
                    </div>
                    <Database className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Syncs</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalSyncs}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics.successRate.toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sync Activity</CardTitle>
                  <CardDescription>
                    Latest data synchronization runs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentSyncs.length > 0 ? (
                    <div className="space-y-4">
                      {recentSyncs.map((sync) => (
                        <div key={sync.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(sync.sync_status)}
                            <div>
                              <p className="text-sm font-medium">{sync.endpoint_name}</p>
                              <p className="text-xs text-gray-500">
                                {formatTimeAgo(sync.started_at)} • {sync.records_processed} records
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(sync.sync_status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No sync history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Health</CardTitle>
                  <CardDescription>
                    Current status of all integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {integrationHealth.length > 0 ? (
                    <div className="space-y-4">
                      {integrationHealth.map((integration) => (
                        <div key={integration.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(integration.connection_status)}
                            <span className="text-sm font-medium">{integration.integration_name}</span>
                          </div>
                          {getStatusBadge(integration.connection_status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No integrations configured</p>
                      <p className="text-xs mt-1">Configure integrations in Settings</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
