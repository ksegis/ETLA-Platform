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
import { 
  FileText, 
  AlertTriangle,
  Clock, 
  Database, 
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ErrorLog {
  id: string;
  integration_config_id: string;
  error_type: string;
  error_message: string;
  error_details: any;
  occurred_at: string;
  integration_name?: string;
}

interface AuditMetrics {
  totalErrors: number;
  totalSyncs: number;
  activeIntegrations: number;
  errorRate: number;
}

export default function AuditTrailPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const { canAccessFeature, isHostAdmin } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [metrics, setMetrics] = useState<AuditMetrics>({
    totalErrors: 0,
    totalSyncs: 0,
    activeIntegrations: 0,
    errorRate: 0,
  });

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

  // Load audit data
  useEffect(() => {
    const tenantId = isHostAdmin() ? selectedTenantId : tenant?.id;
    if (user && tenantId) {
      loadAuditData(tenantId);
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

  const loadAuditData = async (tenantId: string) => {
    try {
      setLoading(true);

      // Load integration configs
      const { data: configs, error: configsError } = await supabase
        .from('integration_configs')
        .select('id, integration_name')
        .eq('tenant_id', tenantId);

      if (configsError) throw configsError;

      const configIds = configs?.map((c: any) => c.id) || [];
      const configMap = configs?.reduce((acc: any, c: any) => {
        acc[c.id] = c.integration_name;
        return acc;
      }, {}) || {};

      // Load error logs
      let errors: any[] = [];
      if (configIds.length > 0) {
        const { data: errorData, error: errorError } = await supabase
          .from('integration_error_logs')
          .select('*')
          .in('integration_config_id', configIds)
          .order('occurred_at', { ascending: false })
          .limit(50);

        if (errorError) throw errorError;
        errors = errorData || [];
      }

      // Add integration names to errors
      const errorsWithNames = errors.map((err: any) => ({
        ...err,
        integration_name: configMap[err.integration_config_id] || 'Unknown',
      }));

      setErrorLogs(errorsWithNames);

      // Load sync history for metrics
      let syncHistory: any[] = [];
      if (configIds.length > 0) {
        const { data: historyData, error: historyError } = await supabase
          .from('integration_sync_history')
          .select('*')
          .in('integration_config_id', configIds);

        if (historyError) throw historyError;
        syncHistory = historyData || [];
      }

      // Calculate metrics
      const totalErrors = errors.length;
      const totalSyncs = syncHistory.length;
      const activeIntegrations = configs?.filter((c: any) => c.is_active).length || 0;
      const errorRate = totalSyncs > 0 ? (totalErrors / totalSyncs) * 100 : 0;

      setMetrics({
        totalErrors,
        totalSyncs,
        activeIntegrations,
        errorRate,
      });

    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setLoading(false);
    }
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

  const getErrorTypeColor = (errorType: string) => {
    const colors: Record<string, string> = {
      'connection_error': 'text-red-600',
      'authentication_error': 'text-orange-600',
      'data_validation_error': 'text-yellow-600',
      'sync_error': 'text-purple-600',
      'timeout_error': 'text-blue-600',
    };
    return colors[errorType] || 'text-gray-600';
  };

  const selectedTenant = isHostAdmin() 
    ? availableTenants.find(t => t.id === selectedTenantId)
    : tenant;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail & Error Logs</h1>
            <p className="mt-2 text-gray-600">
              Error tracking and audit trail for {selectedTenant?.name || 'your organization'}
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
                      <p className="text-sm font-medium text-gray-600">Total Errors</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalErrors}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
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
                    <FileText className="h-8 w-8 text-blue-600" />
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
                      <p className="text-sm font-medium text-gray-600">Error Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.errorRate.toFixed(1)}%</p>
                    </div>
                    <Shield className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Error Logs</CardTitle>
                <CardDescription>
                  Integration errors and sync failures
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errorLogs.length > 0 ? (
                  <div className="space-y-4">
                    {errorLogs.map((error) => (
                      <div key={error.id} className="border border-gray-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {error.integration_name}
                              </h4>
                              <p className={`text-xs font-medium ${getErrorTypeColor(error.error_type)}`}>
                                {error.error_type.replace(/_/g, ' ').toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{formatTimeAgo(error.occurred_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{error.error_message}</p>
                        <p className="text-xs text-gray-500">
                          Occurred: {formatDateTime(error.occurred_at)}
                        </p>
                        {error.error_details && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                              View Details
                            </summary>
                            <pre className="text-xs bg-white p-2 rounded border border-gray-200 mt-1 overflow-x-auto">
                              {JSON.stringify(error.error_details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                    <p className="font-medium">No errors found</p>
                    <p className="text-xs mt-1">All integrations are running smoothly!</p>
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
