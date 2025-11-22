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
import { Wand2, Plus, Trash2, Play, Save, ArrowRight, Code } from 'lucide-react';

interface Transformation {
  id: string;
  type: string;
  params?: any;
}

interface FieldMapping {
  source_field: string;
  target_field: string;
  transformations: Transformation[];
}

interface TransformationRule {
  id: string;
  integration_config_id: string;
  endpoint_name: string;
  endpoint_display_name: string;
  field_mappings: FieldMapping[];
  transformation_rules: any;
}

const TRANSFORMATION_TYPES = [
  { value: 'uppercase', label: 'Uppercase', description: 'Convert to uppercase' },
  { value: 'lowercase', label: 'Lowercase', description: 'Convert to lowercase' },
  { value: 'trim', label: 'Trim', description: 'Remove leading/trailing spaces' },
  { value: 'concat', label: 'Concatenate', description: 'Join with another field', requiresParam: true },
  { value: 'split', label: 'Split', description: 'Split by delimiter', requiresParam: true },
  { value: 'substring', label: 'Substring', description: 'Extract portion of text', requiresParam: true },
  { value: 'replace', label: 'Replace', description: 'Find and replace text', requiresParam: true },
  { value: 'date_format', label: 'Format Date', description: 'Change date format', requiresParam: true },
  { value: 'number_format', label: 'Format Number', description: 'Format as number', requiresParam: true },
  { value: 'default', label: 'Default Value', description: 'Use default if empty', requiresParam: true },
  { value: 'custom', label: 'Custom JS', description: 'Write custom JavaScript', requiresParam: true },
];

export default function TransformationsPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const { canAccessFeature, hasPermission, isHostAdmin } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tenant selector for host admins
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  // Data
  const [transformationRules, setTransformationRules] = useState<TransformationRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<TransformationRule | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);

  // Form state
  const [newSourceField, setNewSourceField] = useState('');
  const [newTargetField, setNewTargetField] = useState('');
  const [newTransformationType, setNewTransformationType] = useState('uppercase');
  const [newTransformationParam, setNewTransformationParam] = useState('');

  // Preview
  const [previewInput, setPreviewInput] = useState('');
  const [previewOutput, setPreviewOutput] = useState('');

  useEffect(() => {
    if (user && isHostAdmin()) {
      loadTenants();
    }
  }, [user]);

  useEffect(() => {
    const tenantId = isHostAdmin() ? selectedTenantId : tenant?.id;
    if (user && tenantId) {
      loadTransformationRules(tenantId);
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

  const loadTransformationRules = async (tenantId: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('integration_sync_configs')
        .select(`
          id,
          integration_config_id,
          endpoint_name,
          endpoint_display_name,
          field_mapping,
          transformation_rules
        `)
        .order('endpoint_name');

      if (error) throw error;

      // Transform data to our format
      const rules = (data || []).map((item: any) => ({
        id: item.id,
        integration_config_id: item.integration_config_id,
        endpoint_name: item.endpoint_name,
        endpoint_display_name: item.endpoint_display_name,
        field_mappings: item.field_mapping ? Object.entries(item.field_mapping).map(([source, target]) => ({
          source_field: source,
          target_field: target as string,
          transformations: []
        })) : [],
        transformation_rules: item.transformation_rules || {}
      }));

      setTransformationRules(rules);
    } catch (error) {
      console.error('Error loading transformation rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFieldMapping = () => {
    if (!selectedRule || !newSourceField || !newTargetField) return;

    const newMapping: FieldMapping = {
      source_field: newSourceField,
      target_field: newTargetField,
      transformations: []
    };

    const updatedRule = {
      ...selectedRule,
      field_mappings: [...selectedRule.field_mappings, newMapping]
    };

    setSelectedRule(updatedRule);
    setNewSourceField('');
    setNewTargetField('');
  };

  const removeFieldMapping = (index: number) => {
    if (!selectedRule) return;

    const updatedRule = {
      ...selectedRule,
      field_mappings: selectedRule.field_mappings.filter((_, i) => i !== index)
    };

    setSelectedRule(updatedRule);
    if (selectedMapping === selectedRule.field_mappings[index]) {
      setSelectedMapping(null);
    }
  };

  const addTransformation = () => {
    if (!selectedMapping) return;

    const transformationType = TRANSFORMATION_TYPES.find(t => t.value === newTransformationType);
    
    const newTransformation: Transformation = {
      id: Date.now().toString(),
      type: newTransformationType,
      params: transformationType?.requiresParam ? newTransformationParam : undefined
    };

    const updatedMapping = {
      ...selectedMapping,
      transformations: [...selectedMapping.transformations, newTransformation]
    };

    // Update in selectedRule
    if (selectedRule) {
      const updatedMappings = selectedRule.field_mappings.map(m =>
        m.source_field === selectedMapping.source_field ? updatedMapping : m
      );

      setSelectedRule({
        ...selectedRule,
        field_mappings: updatedMappings
      });
    }

    setSelectedMapping(updatedMapping);
    setNewTransformationParam('');
  };

  const removeTransformation = (transformationId: string) => {
    if (!selectedMapping) return;

    const updatedMapping = {
      ...selectedMapping,
      transformations: selectedMapping.transformations.filter(t => t.id !== transformationId)
    };

    // Update in selectedRule
    if (selectedRule) {
      const updatedMappings = selectedRule.field_mappings.map(m =>
        m.source_field === selectedMapping.source_field ? updatedMapping : m
      );

      setSelectedRule({
        ...selectedRule,
        field_mappings: updatedMappings
      });
    }

    setSelectedMapping(updatedMapping);
  };

  const previewTransformation = () => {
    if (!selectedMapping || !previewInput) {
      setPreviewOutput('');
      return;
    }

    let result = previewInput;

    try {
      for (const transformation of selectedMapping.transformations) {
        result = applyTransformation(result, transformation);
      }
      setPreviewOutput(result);
    } catch (error: any) {
      setPreviewOutput(`Error: ${error.message}`);
    }
  };

  const applyTransformation = (input: string, transformation: Transformation): string => {
    switch (transformation.type) {
      case 'uppercase':
        return input.toUpperCase();
      case 'lowercase':
        return input.toLowerCase();
      case 'trim':
        return input.trim();
      case 'concat':
        return input + (transformation.params || '');
      case 'split':
        const delimiter = transformation.params || ',';
        return input.split(delimiter)[0] || input;
      case 'substring':
        const [start, end] = (transformation.params || '0,10').split(',').map(Number);
        return input.substring(start, end);
      case 'replace':
        const [find, replace] = (transformation.params || ',').split(',');
        return input.replace(new RegExp(find, 'g'), replace);
      case 'date_format':
        // Simplified date formatting
        return new Date(input).toLocaleDateString();
      case 'number_format':
        return parseFloat(input).toLocaleString();
      case 'default':
        return input || transformation.params || '';
      case 'custom':
        // Eval custom JavaScript (use with caution in production)
        const func = new Function('value', transformation.params || 'return value;');
        return func(input);
      default:
        return input;
    }
  };

  const saveTransformations = async () => {
    if (!selectedRule) return;

    try {
      setSaving(true);

      // Convert field_mappings back to object format for database
      const fieldMappingObj = selectedRule.field_mappings.reduce((acc: any, mapping) => {
        acc[mapping.source_field] = mapping.target_field;
        return acc;
      }, {});

      // Store transformation rules separately
      const transformationRulesObj = selectedRule.field_mappings.reduce((acc: any, mapping) => {
        if (mapping.transformations.length > 0) {
          acc[mapping.source_field] = mapping.transformations;
        }
        return acc;
      }, {});

      const { error } = await supabase
        .from('integration_sync_configs')
        .update({
          field_mapping: fieldMappingObj,
          transformation_rules: transformationRulesObj
        })
        .eq('id', selectedRule.id);

      if (error) throw error;

      alert('Transformations saved successfully!');
      
      const tenantId = isHostAdmin() ? selectedTenantId : tenant!.id;
      await loadTransformationRules(tenantId);
    } catch (error) {
      console.error('Error saving transformations:', error);
      alert('Failed to save transformations');
    } finally {
      setSaving(false);
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
              <Wand2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Transformations</h1>
              <p className="text-sm text-gray-600">Configure field mappings and transformation rules</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Endpoint Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Endpoints</h3>
            <div className="space-y-2">
              {transformationRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRule?.id === rule.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedRule(rule);
                    setSelectedMapping(null);
                  }}
                >
                  <h4 className="font-medium text-gray-900">{rule.endpoint_display_name}</h4>
                  <p className="text-sm text-gray-600">{rule.field_mappings.length} mappings</p>
                </div>
              ))}
            </div>
          </div>

          {/* Middle: Field Mappings */}
          {selectedRule && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Field Mappings</h3>
              
              {/* Add New Mapping */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
                <Input
                  type="text"
                  value={newSourceField}
                  onChange={(e) => setNewSourceField(e.target.value)}
                  placeholder="Source field"
                  disabled={!canWrite}
                />
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={newTargetField}
                    onChange={(e) => setNewTargetField(e.target.value)}
                    placeholder="Target field"
                    disabled={!canWrite}
                  />
                </div>
                <Button
                  onClick={addFieldMapping}
                  disabled={!canWrite || !newSourceField || !newTargetField}
                  size="sm"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Mapping
                </Button>
              </div>

              {/* Existing Mappings */}
              <div className="space-y-2">
                {selectedRule.field_mappings.map((mapping, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedMapping?.source_field === mapping.source_field
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMapping(mapping)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-mono font-medium">{mapping.source_field}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="font-mono">{mapping.target_field}</span>
                        </div>
                        {mapping.transformations.length > 0 && (
                          <p className="text-xs text-purple-600 mt-1">
                            {mapping.transformations.length} transformation(s)
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFieldMapping(index);
                        }}
                        disabled={!canWrite}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right: Transformations */}
          {selectedMapping && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Transformations</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedMapping.source_field} → {selectedMapping.target_field}
                </p>
              </div>

              {/* Existing Transformations */}
              <div className="space-y-2">
                {selectedMapping.transformations.map((transformation, index) => (
                  <div key={transformation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-medium">
                          {TRANSFORMATION_TYPES.find(t => t.value === transformation.type)?.label}
                        </span>
                      </div>
                      {transformation.params && (
                        <p className="text-xs text-gray-600 mt-1 font-mono">{transformation.params}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => removeTransformation(transformation.id)}
                      disabled={!canWrite}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Transformation */}
              <div className="p-3 bg-purple-50 rounded-lg space-y-3">
                <Label className="text-sm font-medium">Add Transformation</Label>
                <select
                  value={newTransformationType}
                  onChange={(e) => setNewTransformationType(e.target.value)}
                  disabled={!canWrite}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {TRANSFORMATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
                
                {TRANSFORMATION_TYPES.find(t => t.value === newTransformationType)?.requiresParam && (
                  <Input
                    type="text"
                    value={newTransformationParam}
                    onChange={(e) => setNewTransformationParam(e.target.value)}
                    placeholder="Parameter (e.g., delimiter, format, code)"
                    disabled={!canWrite}
                  />
                )}

                <Button
                  onClick={addTransformation}
                  disabled={!canWrite}
                  size="sm"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transformation
                </Button>
              </div>

              {/* Preview */}
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <Label className="text-sm font-medium">Preview</Label>
                <Input
                  type="text"
                  value={previewInput}
                  onChange={(e) => setPreviewInput(e.target.value)}
                  placeholder="Enter test value"
                />
                <Button
                  onClick={previewTransformation}
                  size="sm"
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Preview
                </Button>
                {previewOutput && (
                  <div className="p-2 bg-white border rounded font-mono text-sm">
                    {previewOutput}
                  </div>
                )}
              </div>

              {/* Save */}
              <Button
                onClick={saveTransformations}
                disabled={!canWrite || saving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save All Transformations'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
