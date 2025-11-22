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
import { Shield, AlertTriangle, CheckCircle, XCircle, Plus, Trash2, Settings } from 'lucide-react';

interface ValidationRule {
  field: string;
  type: string;
  params?: any;
}

interface SyncConfig {
  id: string;
  endpoint_name: string;
  endpoint_display_name: string;
  validation_enabled: boolean;
  validation_action: string;
  validation_rules: ValidationRule[];
  required_fields: string[];
  unique_fields: string[];
}

interface ValidationError {
  id: string;
  sync_history_id: string;
  field_name: string;
  validation_type: string;
  error_message: string;
  actual_value: string;
  created_at: string;
  resolution_action: string | null;
}

interface QualitySummary {
  integration_config_id: string;
  integration_name: string;
  endpoint_name: string;
  total_records: number;
  total_validated: number;
  total_invalid: number;
  avg_quality_score: number;
  last_sync_at: string;
}

export default function DataValidationPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const { canAccessFeature, hasPermission, isHostAdmin } = usePermissions();

  const [activeTab, setActiveTab] = useState('rules');
  const [loading, setLoading] = useState(true);

  // Tenant selector for host admins
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  // Data
  const [syncConfigs, setSyncConfigs] = useState<SyncConfig[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [qualitySummary, setQualitySummary] = useState<QualitySummary[]>([]);

  // Selected config for editing
  const [selectedConfig, setSelectedConfig] = useState<SyncConfig | null>(null);
  const [newRule, setNewRule] = useState<ValidationRule>({ field: '', type: 'required' });
  const [newRequiredField, setNewRequiredField] = useState('');

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
    try {
      setLoading(true);

      // Load sync configs with validation settings
      const { data: configsData, error: configsError } = await supabase
        .from('integration_sync_configs')
        .select(`
          id,
          endpoint_name,
          endpoint_display_name,
          validation_enabled,
          validation_action,
          validation_rules,
          required_fields,
          unique_fields,
          integration_config_id
        `)
        .eq('integration_configs.tenant_id', tenantId)
        .order('endpoint_name');

      if (configsError) throw configsError;
      setSyncConfigs(configsData || []);

      // Load validation errors (last 100)
      const { data: errorsData, error: errorsError } = await supabase
        .from('integration_validation_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (errorsError) throw errorsError;
      setValidationErrors(errorsData || []);

      // Load quality summary
      const { data: qualityData, error: qualityError } = await supabase
        .from('data_quality_summary')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('avg_quality_score', { ascending: true });

      if (qualityError) throw qualityError;
      setQualitySummary(qualityData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleValidation = async (configId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('integration_sync_configs')
        .update({ validation_enabled: enabled })
        .eq('id', configId);

      if (error) throw error;
      
      const tenantId = isHostAdmin() ? selectedTenantId : tenant!.id;
      await loadData(tenantId);
    } catch (error) {
      console.error('Error toggling validation:', error);
    }
  };

  const updateValidationAction = async (configId: string, action: string) => {
    try {
      const { error } = await supabase
        .from('integration_sync_configs')
        .update({ validation_action: action })
        .eq('id', configId);

      if (error) throw error;
      
      const tenantId = isHostAdmin() ? selectedTenantId : tenant!.id;
      await loadData(tenantId);
    } catch (error) {
      console.error('Error updating validation action:', error);
    }
  };

  const addValidationRule = async () => {
    if (!selectedConfig || !newRule.field || !newRule.type) return;

    try {
      const updatedRules = [...(selectedConfig.validation_rules || []), newRule];
      
      const { error } = await supabase
        .from('integration_sync_configs')
        .update({ validation_rules: updatedRules })
        .eq('id', selectedConfig.id);

      if (error) throw error;
      
      setNewRule({ field: '', type: 'required' });
      const tenantId = isHostAdmin() ? selectedTenantId : tenant!.id;
      await loadData(tenantId);
    } catch (error) {
      console.error('Error adding validation rule:', error);
    }
  };

  const removeValidationRule = async (ruleIndex: number) => {
    if (!selectedConfig) return;

    try {
      const updatedRules = selectedConfig.validation_rules?.filter((_, i) => i !== ruleIndex) || [];
      
      const { error } = await supabase
        .from('integration_sync_configs')
        .update({ validation_rules: updatedRules })
        .eq('id', selectedConfig.id);

      if (error) throw error;
      
      const tenantId = isHostAdmin() ? selectedTenantId : tenant!.id;
      await loadData(tenantId);
    } catch (error) {
      console.error('Error removing validation rule:', error);
    }
  };

  const addRequiredField = async () => {
    if (!selectedConfig || !newRequiredField) return;

    try {
      const updatedFields = [...(selectedConfig.required_fields || []), newRequiredField];
      
      const { error } = await supabase
        .from('integration_sync_configs')
        .update({ required_fields: updatedFields })
        .eq('id', selectedConfig.id);

      if (error) throw error;
      
      setNewRequiredField('');
      const tenantId = isHostAdmin() ? selectedTenantId : tenant!.id;
      await loadData(tenantId);
    } catch (error) {
      console.error('Error adding required field:', error);
    }
  };

  const removeRequiredField = async (fieldIndex: number) => {
    if (!selectedConfig) return;

    try {
      const updatedFields = selectedConfig.required_fields?.filter((_, i) => i !== fieldIndex) || [];
      
      const { error } = await supabase
        .from('integration_sync_configs')
        .update({ required_fields: updatedFields })
        .eq('id', selectedConfig.id);

      if (error) throw error;
      
      const tenantId = isHostAdmin() ? selectedTenantId : tenant!.id;
      await loadData(tenantId);
    } catch (error) {
      console.error('Error removing required field:', error);
    }
  };

  const getValidationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      required: 'Required',
      email: 'Email Format',
      phone: 'Phone Number',
      number: 'Number',
      date: 'Date Format',
      min_length: 'Minimum Length',
      max_length: 'Maximum Length',
      regex: 'Pattern Match',
    };
    return labels[type] || type;
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Validation</h1>
              <p className="text-sm text-gray-600">Configure validation rules and monitor data quality</p>
            </div>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Quality
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Validation Rules */}
          <TabsContent value="rules" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Endpoint List */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Endpoints</h3>
                <div className="space-y-3">
                  {syncConfigs.map((config) => (
                    <div
                      key={config.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedConfig?.id === config.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedConfig(config)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{config.endpoint_display_name}</h4>
                          <p className="text-sm text-gray-600">
                            {config.validation_enabled ? (
                              <span className="text-green-600">✓ Validation enabled</span>
                            ) : (
                              <span className="text-gray-400">Validation disabled</span>
                            )}
                          </p>
                        </div>
                        <Switch
                          checked={config.validation_enabled}
                          onCheckedChange={(checked) => toggleValidation(config.id, checked)}
                          disabled={!canWrite}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Rule Configuration */}
              {selectedConfig && (
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {selectedConfig.endpoint_display_name} - Validation Rules
                    </h3>

                    {/* Validation Action */}
                    <div className="mb-6">
                      <Label className="text-sm font-medium text-gray-700">Action on Validation Failure</Label>
                      <select
                        value={selectedConfig.validation_action}
                        onChange={(e) => updateValidationAction(selectedConfig.id, e.target.value)}
                        disabled={!canWrite}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="skip">Skip Record (Continue sync)</option>
                        <option value="fail">Fail Sync (Stop immediately)</option>
                        <option value="fix">Auto-fix (Attempt correction)</option>
                      </select>
                    </div>

                    {/* Required Fields */}
                    <div className="mb-6">
                      <Label className="text-sm font-medium text-gray-700 mb-2">Required Fields</Label>
                      <div className="space-y-2">
                        {selectedConfig.required_fields?.map((field, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm font-mono">{field}</span>
                            <Button
                              onClick={() => removeRequiredField(index)}
                              disabled={!canWrite}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={newRequiredField}
                            onChange={(e) => setNewRequiredField(e.target.value)}
                            placeholder="Field name"
                            disabled={!canWrite}
                          />
                          <Button onClick={addRequiredField} disabled={!canWrite || !newRequiredField}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Validation Rules */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">Validation Rules</Label>
                      <div className="space-y-2 mb-4">
                        {selectedConfig.validation_rules?.map((rule, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <span className="text-sm font-mono font-medium">{rule.field}</span>
                              <span className="text-sm text-gray-600 ml-2">→ {getValidationTypeLabel(rule.type)}</span>
                              {rule.params && (
                                <span className="text-xs text-gray-500 ml-2">({JSON.stringify(rule.params)})</span>
                              )}
                            </div>
                            <Button
                              onClick={() => removeValidationRule(index)}
                              disabled={!canWrite}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add New Rule */}
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          value={newRule.field}
                          onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                          placeholder="Field name"
                          disabled={!canWrite}
                        />
                        <select
                          value={newRule.type}
                          onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                          disabled={!canWrite}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="required">Required</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="min_length">Min Length</option>
                          <option value="max_length">Max Length</option>
                          <option value="regex">Regex</option>
                        </select>
                      </div>
                      <Button
                        onClick={addValidationRule}
                        disabled={!canWrite || !newRule.field}
                        className="mt-2 w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Rule
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Validation Errors */}
          <TabsContent value="errors" className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Validation Errors</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {validationErrors.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No validation errors found
                          </td>
                        </tr>
                      ) : (
                        validationErrors.map((error) => (
                          <tr key={error.id}>
                            <td className="px-4 py-3 text-sm font-mono">{error.field_name}</td>
                            <td className="px-4 py-3 text-sm">{getValidationTypeLabel(error.validation_type)}</td>
                            <td className="px-4 py-3 text-sm text-red-600">{error.error_message}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-600">{error.actual_value}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(error.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {error.resolution_action ? (
                                <span className="text-green-600">✓ {error.resolution_action}</span>
                              ) : (
                                <span className="text-yellow-600">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Data Quality */}
          <TabsContent value="quality" className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data Quality Summary (Last 30 Days)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Integration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Records</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Validated</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invalid</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quality Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {qualitySummary.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            No quality data available
                          </td>
                        </tr>
                      ) : (
                        qualitySummary.map((summary) => (
                          <tr key={`${summary.integration_config_id}-${summary.endpoint_name}`}>
                            <td className="px-4 py-3 text-sm">{summary.integration_name}</td>
                            <td className="px-4 py-3 text-sm">{summary.endpoint_name}</td>
                            <td className="px-4 py-3 text-sm text-right">{summary.total_records?.toLocaleString() || 0}</td>
                            <td className="px-4 py-3 text-sm text-right">{summary.total_validated?.toLocaleString() || 0}</td>
                            <td className="px-4 py-3 text-sm text-right text-red-600">{summary.total_invalid?.toLocaleString() || 0}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      summary.avg_quality_score >= 95 ? 'bg-green-500' :
                                      summary.avg_quality_score >= 80 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${summary.avg_quality_score || 0}%` }}
                                  ></div>
                                </div>
                                <span className="font-medium">{summary.avg_quality_score?.toFixed(1) || 0}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {summary.last_sync_at ? new Date(summary.last_sync_at).toLocaleString() : 'Never'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
