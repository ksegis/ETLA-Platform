'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FEATURES, PERMISSIONS } from '@/rbac/constants';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Settings, Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface APIConfig {
  id: string;
  tenant_id: string;
  integration_type: string;
  integration_name: string;
  environment: string;
  base_url: string;
  is_active: boolean;
  connection_status: string;
  last_connection_test: string | null;
  configuration_metadata: {
    timeout_seconds?: number;
    max_retries?: number;
    retry_delay_seconds?: number;
  };
  created_at: string;
  updated_at: string;
  credentials?: {
    id: string;
    credential_type: string;
    has_api_key: boolean;
  };
}

interface APICredentials {
  credential_type: string;
  api_key: string;
}

export default function APIConfigurationPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const { canAccessFeature, hasPermission } = usePermissions();

  const [configs, setConfigs] = useState<APIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<APIConfig | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    integration_type: 'api',
    integration_name: '',
    environment: 'production',
    base_url: '',
    timeout_seconds: 30,
    max_retries: 3,
    retry_delay_seconds: 5,
    is_active: true,
  });

  const [credentialData, setCredentialData] = useState({
    credential_type: 'api_key',
    api_key: '',
  });

  const [showApiKey, setShowApiKey] = useState(false);

  // Check permissions
  useEffect(() => {
    if (!canAccessFeature(FEATURES.API_CONFIGURATION)) {
      router.push('/dashboard');
    }
  }, [canAccessFeature, router]);

  // Load API configurations
  useEffect(() => {
    if (user && tenant?.id) {
      loadConfigs();
    }
  }, [user, tenant]);

  const loadConfigs = async () => {
    try {
      setLoading(true);

      // Load integration configs
      const { data: configsData, error: configsError } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .eq('integration_type', 'api')
        .order('created_at', { ascending: false });

      if (configsError) throw configsError;

      // Load credentials info (without decrypting)
      const configIds = configsData?.map(c => c.id) || [];
      let credentialsMap: Record<string, any> = {};

      if (configIds.length > 0) {
        const { data: credsData, error: credsError } = await supabase
          .from('integration_credentials')
          .select('id, integration_config_id, credential_type')
          .in('integration_config_id', configIds);

        if (!credsError && credsData) {
          credentialsMap = credsData.reduce((acc, cred) => {
            acc[cred.integration_config_id] = {
              id: cred.id,
              credential_type: cred.credential_type,
              has_api_key: true,
            };
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Merge configs with credentials info
      const enrichedConfigs = (configsData || []).map(config => ({
        ...config,
        credentials: credentialsMap[config.id] || null,
      }));

      setConfigs(enrichedConfigs);
    } catch (error) {
      console.error('Error loading API configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      integration_type: 'api',
      integration_name: '',
      environment: 'production',
      base_url: '',
      timeout_seconds: 30,
      max_retries: 3,
      retry_delay_seconds: 5,
      is_active: true,
    });
    setCredentialData({
      credential_type: 'api_key',
      api_key: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (config: APIConfig) => {
    setSelectedConfig(config);
    setFormData({
      integration_type: config.integration_type,
      integration_name: config.integration_name,
      environment: config.environment,
      base_url: config.base_url,
      timeout_seconds: config.configuration_metadata?.timeout_seconds || 30,
      max_retries: config.configuration_metadata?.max_retries || 3,
      retry_delay_seconds: config.configuration_metadata?.retry_delay_seconds || 5,
      is_active: config.is_active,
    });
    setCredentialData({
      credential_type: 'api_key',
      api_key: '', // Don't load existing key for security
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (config: APIConfig) => {
    setSelectedConfig(config);
    setIsDeleteDialogOpen(true);
  };

  const saveConfig = async () => {
    try {
      setSaving(true);

      const configPayload = {
        tenant_id: tenant!.id,
        integration_type: formData.integration_type,
        integration_name: formData.integration_name,
        environment: formData.environment,
        base_url: formData.base_url,
        is_active: formData.is_active,
        configuration_metadata: {
          timeout_seconds: formData.timeout_seconds,
          max_retries: formData.max_retries,
          retry_delay_seconds: formData.retry_delay_seconds,
        },
        updated_at: new Date().toISOString(),
      };

      let configId: string;

      if (isEditModalOpen && selectedConfig) {
        // Update existing config
        const { error: updateError } = await supabase
          .from('integration_configs')
          .update(configPayload)
          .eq('id', selectedConfig.id);

        if (updateError) throw updateError;
        configId = selectedConfig.id;
      } else {
        // Create new config
        const { data: newConfig, error: insertError } = await supabase
          .from('integration_configs')
          .insert([configPayload])
          .select()
          .single();

        if (insertError) throw insertError;
        configId = newConfig.id;
      }

      // Save credentials if API key is provided
      if (credentialData.api_key) {
        // Encrypt the API key
        const { data: encryptedKey, error: encryptError } = await supabase.rpc(
          'encrypt_credential',
          { plaintext: credentialData.api_key }
        );

        if (encryptError) throw encryptError;

        // Check if credentials already exist
        const { data: existingCreds } = await supabase
          .from('integration_credentials')
          .select('id')
          .eq('integration_config_id', configId)
          .eq('credential_type', 'api_key')
          .single();

        if (existingCreds) {
          // Update existing credentials
          const { error: updateCredsError } = await supabase
            .from('integration_credentials')
            .update({
              encrypted_api_key: encryptedKey,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingCreds.id);

          if (updateCredsError) throw updateCredsError;
        } else {
          // Insert new credentials
          const { error: insertCredsError } = await supabase
            .from('integration_credentials')
            .insert([{
              integration_config_id: configId,
              credential_type: 'api_key',
              encrypted_api_key: encryptedKey,
            }]);

          if (insertCredsError) throw insertCredsError;
        }
      }

      // Reload configs
      await loadConfigs();

      // Close modals
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedConfig(null);
    } catch (error) {
      console.error('Error saving API configuration:', error);
      alert('Failed to save API configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedConfig) return;

    try {
      setSaving(true);

      // Delete config (credentials will cascade delete)
      const { error } = await supabase
        .from('integration_configs')
        .delete()
        .eq('id', selectedConfig.id);

      if (error) throw error;

      // Reload configs
      await loadConfigs();

      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedConfig(null);
    } catch (error) {
      console.error('Error deleting API configuration:', error);
      alert('Failed to delete API configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (config: APIConfig) => {
    try {
      setTesting(config.id);

      // Update connection status to testing
      await supabase
        .from('integration_configs')
        .update({
          connection_status: 'testing',
          last_connection_test: new Date().toISOString(),
        })
        .eq('id', config.id);

      // Simulate connection test (in production, this would call the actual API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For now, randomly succeed or fail for demo purposes
      const success = Math.random() > 0.3;

      await supabase
        .from('integration_configs')
        .update({
          connection_status: success ? 'connected' : 'failed',
          last_connection_error: success ? null : 'Connection timeout or invalid credentials',
        })
        .eq('id', config.id);

      // Reload configs
      await loadConfigs();
    } catch (error) {
      console.error('Error testing connection:', error);
    } finally {
      setTesting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'testing':
        return <AlertCircle className="w-5 h-5 text-yellow-600 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'failed':
        return 'Failed';
      case 'testing':
        return 'Testing...';
      default:
        return 'Not Configured';
    }
  };

  const canWrite = hasPermission(FEATURES.API_CONFIGURATION, PERMISSIONS.WRITE);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Configuration</h1>
              <p className="text-sm text-gray-600">Manage external API integrations and credentials</p>
            </div>
          </div>
          {canWrite && (
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add API Configuration
            </Button>
          )}
        </div>

        {/* API Configurations Table */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading API configurations...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API Configurations</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first API configuration.</p>
              {canWrite && (
                <Button onClick={handleCreate} className="flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Add API Configuration
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Environment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credentials
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{config.integration_name}</div>
                        <div className="text-sm text-gray-500">
                          {config.configuration_metadata?.timeout_seconds || 30}s timeout, {config.configuration_metadata?.max_retries || 3} retries
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{config.base_url}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          config.environment === 'production' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {config.environment}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(config.connection_status)}
                          <span className="text-sm text-gray-900">{getStatusText(config.connection_status)}</span>
                        </div>
                        {config.last_connection_test && (
                          <div className="text-xs text-gray-500 mt-1">
                            Tested {new Date(config.last_connection_test).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {config.credentials ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {config.credentials.credential_type}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Not configured</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          config.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => testConnection(config)}
                            disabled={testing === config.id || !config.credentials}
                            title="Test Connection"
                          >
                            {testing === config.id ? 'Testing...' : 'Test'}
                          </Button>
                          {canWrite && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(config)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(config)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedConfig(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditModalOpen ? 'Edit API Configuration' : 'Add API Configuration'}</DialogTitle>
              <DialogDescription>
                Configure external API integration settings and credentials.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="integration_name">API Name *</Label>
                    <Input
                      id="integration_name"
                      value={formData.integration_name}
                      onChange={(e) => setFormData({ ...formData, integration_name: e.target.value })}
                      placeholder="e.g., External HR System"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Environment *</Label>
                    <select
                      id="environment"
                      value={formData.environment}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="production">Production</option>
                      <option value="sandbox">Sandbox</option>
                      <option value="staging">Staging</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_url">Base URL *</Label>
                  <Input
                    id="base_url"
                    value={formData.base_url}
                    onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                    placeholder="https://api.example.com/v1"
                  />
                </div>
              </div>

              {/* Connection Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900">Connection Settings</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout_seconds">Timeout (seconds)</Label>
                    <Input
                      id="timeout_seconds"
                      type="number"
                      value={formData.timeout_seconds}
                      onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) || 30 })}
                      min="1"
                      max="300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_retries">Max Retries</Label>
                    <Input
                      id="max_retries"
                      type="number"
                      value={formData.max_retries}
                      onChange={(e) => setFormData({ ...formData, max_retries: parseInt(e.target.value) || 3 })}
                      min="0"
                      max="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retry_delay_seconds">Retry Delay (seconds)</Label>
                    <Input
                      id="retry_delay_seconds"
                      type="number"
                      value={formData.retry_delay_seconds}
                      onChange={(e) => setFormData({ ...formData, retry_delay_seconds: parseInt(e.target.value) || 5 })}
                      min="1"
                      max="60"
                    />
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900">Credentials</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key {isEditModalOpen && '(leave blank to keep existing)'}</Label>
                  <div className="relative">
                    <Input
                      id="api_key"
                      type={showApiKey ? 'text' : 'password'}
                      value={credentialData.api_key}
                      onChange={(e) => setCredentialData({ ...credentialData, api_key: e.target.value })}
                      placeholder={isEditModalOpen ? '••••••••••••••••' : 'Enter API key'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active (enable this API configuration)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedConfig(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={saveConfig} disabled={saving || !formData.integration_name || !formData.base_url}>
                {saving ? 'Saving...' : isEditModalOpen ? 'Update Configuration' : 'Create Configuration'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete API Configuration</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{selectedConfig?.integration_name}</strong>?
                This will also delete all associated credentials. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
