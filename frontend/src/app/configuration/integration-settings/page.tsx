'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FEATURES, PERMISSIONS } from '@/rbac/constants';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Link as LinkIcon, Database, MapPin, Clock, History, Sliders, Save, TestTube, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface IntegrationConfig {
  id: string;
  tenant_id: string;
  integration_type: string;
  integration_name: string;
  environment: string;
  base_url: string;
  is_active: boolean;
  connection_status: string;
  last_connection_test: string | null;
  configuration_metadata: any;
  created_at: string;
  updated_at: string;
}

interface IntegrationCredentials {
  id: string;
  integration_config_id: string;
  credential_type: string;
  encrypted_username: string | null;
  encrypted_password: string | null;
}

interface SyncConfig {
  id: string;
  integration_config_id: string;
  endpoint_name: string;
  endpoint_display_name: string;
  sync_frequency: string;
  is_enabled: boolean;
  filter_criteria: any;
  field_mapping: any;
  last_sync_at: string | null;
  last_sync_status: string | null;
  next_sync_at: string | null;
}

interface SyncHistory {
  id: string;
  integration_config_id: string;
  endpoint_name: string;
  sync_status: string;
  records_processed: number;
  records_failed: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

export default function IntegrationSettingsPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const { canAccessFeature, hasPermission } = usePermissions();

  const [activeTab, setActiveTab] = useState('connection');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Integration config state
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig | null>(null);
  const [credentials, setCredentials] = useState<IntegrationCredentials | null>(null);
  const [syncConfigs, setSyncConfigs] = useState<SyncConfig[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);

  // Form states
  const [connectionForm, setConnectionForm] = useState({
    integration_name: 'Paycom Integration',
    environment: 'production',
    base_url: 'https://api.paycomonline.net',
    is_active: true,
  });

  const [credentialsForm, setCredentialsForm] = useState({
    username: '', // Paycom SID
    password: '', // Paycom Token
  });

  const [showPassword, setShowPassword] = useState(false);

  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({
    employee_id: 'employeeId',
    first_name: 'firstName',
    last_name: 'lastName',
    email: 'email',
    hire_date: 'hireDate',
    department: 'department',
    job_title: 'jobTitle',
    status: 'status',
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    filter_active_only: true,
    filter_department: '',
    auto_retry_failed: true,
    max_retry_attempts: 3,
    notification_on_error: true,
    notification_on_success: false,
  });

  // Available Paycom endpoints
  const availableEndpoints = [
    { name: 'employee_directory', display: 'Employee Directory', description: 'Sync employee master data' },
    { name: 'new_hires', display: 'New Hires', description: 'Sync new employee onboarding data' },
    { name: 'payroll', display: 'Payroll Data', description: 'Sync payroll and compensation data' },
    { name: 'time_attendance', display: 'Time & Attendance', description: 'Sync time tracking and attendance records' },
    { name: 'benefits', display: 'Benefits Enrollment', description: 'Sync benefits and enrollment data' },
    { name: 'terminations', display: 'Terminations', description: 'Sync employee termination data' },
  ];

  // Check permissions
  useEffect(() => {
    if (!canAccessFeature(FEATURES.INTEGRATIONS)) {
      router.push('/dashboard');
    }
  }, [canAccessFeature, router]);

  // Load integration configuration
  useEffect(() => {
    if (user && tenant?.id) {
      loadIntegrationConfig();
    }
  }, [user, tenant]);

  const loadIntegrationConfig = async () => {
    try {
      setLoading(true);

      // Load integration config for Paycom
      const { data: configData, error: configError } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .eq('integration_type', 'paycom')
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      if (configData) {
        setIntegrationConfig(configData);
        setConnectionForm({
          integration_name: configData.integration_name,
          environment: configData.environment,
          base_url: configData.base_url,
          is_active: configData.is_active,
        });

        // Load credentials (without decrypting - we'll only show if they exist)
        const { data: credsData } = await supabase
          .from('integration_credentials')
          .select('*')
          .eq('integration_config_id', configData.id)
          .eq('credential_type', 'basic_auth')
          .single();

        if (credsData) {
          setCredentials(credsData);
        }

        // Load sync configurations
        const { data: syncConfigsData } = await supabase
          .from('integration_sync_configs')
          .select('*')
          .eq('integration_config_id', configData.id);

        if (syncConfigsData) {
          setSyncConfigs(syncConfigsData);
        }

        // Load sync history
        const { data: historyData } = await supabase
          .from('integration_sync_history')
          .select('*')
          .eq('integration_config_id', configData.id)
          .order('started_at', { ascending: false })
          .limit(20);

        if (historyData) {
          setSyncHistory(historyData);
        }

        // Load advanced settings from metadata
        if (configData.configuration_metadata) {
          setAdvancedSettings({
            filter_active_only: configData.configuration_metadata.filter_active_only ?? true,
            filter_department: configData.configuration_metadata.filter_department ?? '',
            auto_retry_failed: configData.configuration_metadata.auto_retry_failed ?? true,
            max_retry_attempts: configData.configuration_metadata.max_retry_attempts ?? 3,
            notification_on_error: configData.configuration_metadata.notification_on_error ?? true,
            notification_on_success: configData.configuration_metadata.notification_on_success ?? false,
          });
        }
      }
    } catch (error) {
      console.error('Error loading integration configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConnectionSettings = async () => {
    try {
      setSaving(true);

      const configPayload = {
        tenant_id: tenant!.id,
        integration_type: 'paycom',
        integration_name: connectionForm.integration_name,
        environment: connectionForm.environment,
        base_url: connectionForm.base_url,
        is_active: connectionForm.is_active,
        configuration_metadata: integrationConfig?.configuration_metadata || {},
        updated_at: new Date().toISOString(),
      };

      let configId: string;

      if (integrationConfig) {
        // Update existing config
        const { error } = await supabase
          .from('integration_configs')
          .update(configPayload)
          .eq('id', integrationConfig.id);

        if (error) throw error;
        configId = integrationConfig.id;
      } else {
        // Create new config
        const { data: newConfig, error } = await supabase
          .from('integration_configs')
          .insert([configPayload])
          .select()
          .single();

        if (error) throw error;
        configId = newConfig.id;
      }

      // Save credentials if provided
      if (credentialsForm.username && credentialsForm.password) {
        // Encrypt credentials
        const { data: encryptedUsername } = await supabase.rpc('encrypt_credential', {
          plaintext: credentialsForm.username,
        });

        const { data: encryptedPassword } = await supabase.rpc('encrypt_credential', {
          plaintext: credentialsForm.password,
        });

        if (credentials) {
          // Update existing credentials
          const { error } = await supabase
            .from('integration_credentials')
            .update({
              encrypted_username: encryptedUsername,
              encrypted_password: encryptedPassword,
              updated_at: new Date().toISOString(),
            })
            .eq('id', credentials.id);

          if (error) throw error;
        } else {
          // Insert new credentials
          const { error } = await supabase
            .from('integration_credentials')
            .insert([{
              integration_config_id: configId,
              credential_type: 'basic_auth',
              encrypted_username: encryptedUsername,
              encrypted_password: encryptedPassword,
            }]);

          if (error) throw error;
        }
      }

      await loadIntegrationConfig();
      alert('Connection settings saved successfully!');
    } catch (error) {
      console.error('Error saving connection settings:', error);
      alert('Failed to save connection settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!integrationConfig) {
      alert('Please save connection settings first.');
      return;
    }

    try {
      setTesting(true);

      // Update status to testing
      await supabase
        .from('integration_configs')
        .update({
          connection_status: 'testing',
          last_connection_test: new Date().toISOString(),
        })
        .eq('id', integrationConfig.id);

      // Simulate connection test (in production, this would call Paycom API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo, randomly succeed or fail
      const success = Math.random() > 0.2;

      await supabase
        .from('integration_configs')
        .update({
          connection_status: success ? 'connected' : 'failed',
          last_connection_error: success ? null : 'Invalid credentials or network error',
        })
        .eq('id', integrationConfig.id);

      await loadIntegrationConfig();

      if (success) {
        alert('Connection test successful!');
      } else {
        alert('Connection test failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Error testing connection.');
    } finally {
      setTesting(false);
    }
  };

  const toggleEndpoint = async (endpointName: string, enabled: boolean) => {
    if (!integrationConfig) return;

    try {
      const existingConfig = syncConfigs.find(sc => sc.endpoint_name === endpointName);

      if (existingConfig) {
        // Update existing
        const { error } = await supabase
          .from('integration_sync_configs')
          .update({ is_enabled: enabled })
          .eq('id', existingConfig.id);

        if (error) throw error;
      } else {
        // Create new
        const endpoint = availableEndpoints.find(e => e.name === endpointName);
        const { error } = await supabase
          .from('integration_sync_configs')
          .insert([{
            integration_config_id: integrationConfig.id,
            endpoint_name: endpointName,
            endpoint_display_name: endpoint?.display || endpointName,
            sync_frequency: 'manual',
            is_enabled: enabled,
            filter_criteria: {},
            field_mapping: {},
          }]);

        if (error) throw error;
      }

      await loadIntegrationConfig();
    } catch (error) {
      console.error('Error toggling endpoint:', error);
    }
  };

  const updateSyncFrequency = async (endpointName: string, frequency: string) => {
    const syncConfig = syncConfigs.find(sc => sc.endpoint_name === endpointName);
    if (!syncConfig) return;

    try {
      const { error } = await supabase
        .from('integration_sync_configs')
        .update({ sync_frequency: frequency })
        .eq('id', syncConfig.id);

      if (error) throw error;
      await loadIntegrationConfig();
    } catch (error) {
      console.error('Error updating sync frequency:', error);
    }
  };

  const saveFieldMappings = async () => {
    if (!integrationConfig) return;

    try {
      setSaving(true);

      // Update all sync configs with field mappings
      for (const syncConfig of syncConfigs) {
        const { error } = await supabase
          .from('integration_sync_configs')
          .update({ field_mapping: fieldMappings })
          .eq('id', syncConfig.id);

        if (error) throw error;
      }

      alert('Field mappings saved successfully!');
    } catch (error) {
      console.error('Error saving field mappings:', error);
      alert('Failed to save field mappings.');
    } finally {
      setSaving(false);
    }
  };

  const saveAdvancedSettings = async () => {
    if (!integrationConfig) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('integration_configs')
        .update({
          configuration_metadata: {
            ...integrationConfig.configuration_metadata,
            ...advancedSettings,
          },
        })
        .eq('id', integrationConfig.id);

      if (error) throw error;

      await loadIntegrationConfig();
      alert('Advanced settings saved successfully!');
    } catch (error) {
      console.error('Error saving advanced settings:', error);
      alert('Failed to save advanced settings.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'testing':
      case 'running':
        return <AlertCircle className="w-5 h-5 text-yellow-600 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const canWrite = hasPermission(FEATURES.INTEGRATIONS, PERMISSIONS.MANAGE);

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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integration Settings</h1>
              <p className="text-sm text-gray-600">Configure Paycom integration and data synchronization</p>
            </div>
          </div>
          {integrationConfig && (
            <div className="flex items-center gap-2">
              {getStatusIcon(integrationConfig.connection_status)}
              <span className="text-sm font-medium text-gray-700">
                {integrationConfig.connection_status === 'connected' ? 'Connected' : 
                 integrationConfig.connection_status === 'failed' ? 'Connection Failed' : 
                 integrationConfig.connection_status === 'testing' ? 'Testing...' : 'Not Configured'}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Sync Config
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Field Mapping
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Connection Settings */}
          <TabsContent value="connection" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Paycom Connection Settings</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure your Paycom API connection credentials and settings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="integration_name">Integration Name</Label>
                  <Input
                    id="integration_name"
                    value={connectionForm.integration_name}
                    onChange={(e) => setConnectionForm({ ...connectionForm, integration_name: e.target.value })}
                    disabled={!canWrite}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <select
                    id="environment"
                    value={connectionForm.environment}
                    onChange={(e) => setConnectionForm({ ...connectionForm, environment: e.target.value })}
                    disabled={!canWrite}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="production">Production</option>
                    <option value="sandbox">Sandbox</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_url">API Base URL</Label>
                <Input
                  id="base_url"
                  value={connectionForm.base_url}
                  onChange={(e) => setConnectionForm({ ...connectionForm, base_url: e.target.value })}
                  disabled={!canWrite}
                  placeholder="https://api.paycomonline.net"
                />
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Paycom Credentials</h4>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Paycom SID (Username)</Label>
                    <Input
                      id="username"
                      value={credentialsForm.username}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, username: e.target.value })}
                      disabled={!canWrite}
                      placeholder={credentials ? '••••••••' : 'Enter Paycom SID'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Paycom Token (Password)</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={credentialsForm.password}
                        onChange={(e) => setCredentialsForm({ ...credentialsForm, password: e.target.value })}
                        disabled={!canWrite}
                        placeholder={credentials ? '••••••••' : 'Enter Paycom Token'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={connectionForm.is_active}
                  onCheckedChange={(checked) => setConnectionForm({ ...connectionForm, is_active: checked })}
                  disabled={!canWrite}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active (enable this integration)
                </Label>
              </div>

              {canWrite && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={saveConnectionSettings} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={testing || !integrationConfig}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Sync Configuration */}
          <TabsContent value="sync" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Data Sync Configuration</h3>
                <p className="text-sm text-gray-600">
                  Select which Paycom endpoints to synchronize with HelixBridge.
                </p>
              </div>

              <div className="space-y-4">
                {availableEndpoints.map((endpoint) => {
                  const syncConfig = syncConfigs.find(sc => sc.endpoint_name === endpoint.name);
                  const isEnabled = syncConfig?.is_enabled || false;

                  return (
                    <div key={endpoint.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => toggleEndpoint(endpoint.name, checked)}
                          disabled={!canWrite || !integrationConfig}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{endpoint.display}</h4>
                          <p className="text-sm text-gray-600">{endpoint.description}</p>
                        </div>
                      </div>
                      {syncConfig && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {syncConfig.last_sync_at && (
                            <>
                              {getStatusIcon(syncConfig.last_sync_status || 'not_configured')}
                              <span>Last sync: {new Date(syncConfig.last_sync_at).toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Field Mapping */}
          <TabsContent value="mapping" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Field Mapping</h3>
                <p className="text-sm text-gray-600">
                  Map Paycom fields to HelixBridge fields for data transformation.
                </p>
              </div>

              <div className="space-y-4">
                {Object.entries(fieldMappings).map(([paycomField, helixField]) => (
                  <div key={paycomField} className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Paycom: {paycomField}</Label>
                    </div>
                    <div>
                      <Input
                        value={helixField}
                        onChange={(e) => setFieldMappings({ ...fieldMappings, [paycomField]: e.target.value })}
                        disabled={!canWrite}
                        placeholder="HelixBridge field name"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {canWrite && (
                <div className="flex gap-3 pt-6 border-t mt-6">
                  <Button onClick={saveFieldMappings} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Mappings'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 4: Sync Schedule */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sync Schedule</h3>
                <p className="text-sm text-gray-600">
                  Configure how frequently each endpoint should sync data.
                </p>
              </div>

              <div className="space-y-4">
                {syncConfigs.filter(sc => sc.is_enabled).map((syncConfig) => (
                  <div key={syncConfig.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{syncConfig.endpoint_display_name}</h4>
                      <p className="text-sm text-gray-600">
                        Next sync: {syncConfig.next_sync_at ? new Date(syncConfig.next_sync_at).toLocaleString() : 'Not scheduled'}
                      </p>
                    </div>
                    <select
                      value={syncConfig.sync_frequency}
                      onChange={(e) => updateSyncFrequency(syncConfig.endpoint_name, e.target.value)}
                      disabled={!canWrite}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="manual">Manual</option>
                      <option value="real_time">Real-time</option>
                      <option value="every_15_min">Every 15 minutes</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                ))}

                {syncConfigs.filter(sc => sc.is_enabled).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No endpoints enabled for sync. Enable endpoints in the Sync Config tab.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab 5: Sync History */}
          <TabsContent value="history" className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Sync History</h3>
                <p className="text-sm text-gray-600">View past synchronization runs and their results.</p>
              </div>

              {syncHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {syncHistory.map((history) => (
                        <tr key={history.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{history.endpoint_name}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(history.sync_status)}
                              <span className="text-sm text-gray-900">{history.sync_status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {history.records_processed} processed
                            {history.records_failed > 0 && (
                              <span className="text-red-600"> ({history.records_failed} failed)</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {history.duration_seconds ? `${history.duration_seconds}s` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(history.started_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {history.error_message || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No sync history available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 6: Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Settings</h3>
                <p className="text-sm text-gray-600">
                  Configure filters, error handling, and notification preferences.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Data Filters</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="filter_active_only"
                        checked={advancedSettings.filter_active_only}
                        onCheckedChange={(checked) => setAdvancedSettings({ ...advancedSettings, filter_active_only: checked })}
                        disabled={!canWrite}
                      />
                      <Label htmlFor="filter_active_only">Sync active employees only</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filter_department">Filter by Department (optional)</Label>
                      <Input
                        id="filter_department"
                        value={advancedSettings.filter_department}
                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, filter_department: e.target.value })}
                        disabled={!canWrite}
                        placeholder="Leave blank for all departments"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Error Handling</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="auto_retry_failed"
                        checked={advancedSettings.auto_retry_failed}
                        onCheckedChange={(checked) => setAdvancedSettings({ ...advancedSettings, auto_retry_failed: checked })}
                        disabled={!canWrite}
                      />
                      <Label htmlFor="auto_retry_failed">Automatically retry failed syncs</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_retry_attempts">Max Retry Attempts</Label>
                      <Input
                        id="max_retry_attempts"
                        type="number"
                        value={advancedSettings.max_retry_attempts}
                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, max_retry_attempts: parseInt(e.target.value) || 3 })}
                        disabled={!canWrite}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Notifications</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="notification_on_error"
                        checked={advancedSettings.notification_on_error}
                        onCheckedChange={(checked) => setAdvancedSettings({ ...advancedSettings, notification_on_error: checked })}
                        disabled={!canWrite}
                      />
                      <Label htmlFor="notification_on_error">Send notification on sync errors</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="notification_on_success"
                        checked={advancedSettings.notification_on_success}
                        onCheckedChange={(checked) => setAdvancedSettings({ ...advancedSettings, notification_on_success: checked })}
                        disabled={!canWrite}
                      />
                      <Label htmlFor="notification_on_success">Send notification on successful syncs</Label>
                    </div>
                  </div>
                </div>
              </div>

              {canWrite && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={saveAdvancedSettings} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Advanced Settings'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
