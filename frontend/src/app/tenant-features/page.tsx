'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  getFeatureCatalog,
  getTenantEnabledFeatures,
  bulkUpdateTenantFeatures,
  type FeatureCatalogItem
} from '@/services/tenant_feature_service';
import { Sparkles, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
}

export default function TenantFeaturesPage() {
  const router = useRouter();
  const { tenantUser, isAuthenticated } = useAuth();
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [featureCatalog, setFeatureCatalog] = useState<FeatureCatalogItem[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Check if user is host_admin
  useEffect(() => {
    if (isAuthenticated && tenantUser) {
      if (tenantUser.role?.toLowerCase() !== 'host_admin') {
        router.push('/');
      }
    }
  }, [isAuthenticated, tenantUser, router]);

  // Load tenants
  useEffect(() => {
    async function loadTenants() {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setTenants(data || []);
        
        // Auto-select first tenant
        if (data && data.length > 0) {
          setSelectedTenantId(data[0].id);
        }
      } catch (error) {
        console.error('Error loading tenants:', error);
      }
    }

    loadTenants();
  }, []);

  // Load feature catalog
  useEffect(() => {
    async function loadCatalog() {
      try {
        const catalog = await getFeatureCatalog();
        setFeatureCatalog(catalog);
      } catch (error) {
        console.error('Error loading feature catalog:', error);
      }
    }

    loadCatalog();
  }, []);

  // Load tenant's enabled features when tenant changes
  useEffect(() => {
    async function loadTenantFeatures() {
      if (!selectedTenantId) return;

      setLoading(true);
      try {
        const features = await getTenantEnabledFeatures(selectedTenantId);
        setEnabledFeatures(features);
      } catch (error) {
        console.error('Error loading tenant features:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTenantFeatures();
  }, [selectedTenantId]);

  // Toggle feature
  const toggleFeature = (featureKey: string) => {
    setEnabledFeatures(prev => {
      if (prev.includes(featureKey)) {
        return prev.filter(f => f !== featureKey);
      } else {
        return [...prev, featureKey];
      }
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedTenantId) return;

    setSaving(true);
    setMessage(null);

    try {
      const success = await bulkUpdateTenantFeatures(
        selectedTenantId,
        enabledFeatures,
        tenantUser?.user_id
      );

      if (success) {
        setMessage({ type: 'success', text: 'Features updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update features. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving features:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setSaving(false);
    }
  };

  // Group features by category
  const featuresByCategory = featureCatalog.reduce((acc, feature) => {
    if (!acc[feature.feature_category]) {
      acc[feature.feature_category] = [];
    }
    acc[feature.feature_category].push(feature);
    return acc;
  }, {} as Record<string, FeatureCatalogItem[]>);

  const categoryNames: Record<string, string> = {
    operations: 'Operations',
    talent: 'Talent Management',
    analytics: 'Analytics & Reporting',
    benefits: 'Benefits',
    payroll: 'Payroll',
    etl: 'ETL & Data Processing',
    data: 'Data Management',
    configuration: 'Configuration',
    administration: 'Administration',
    tools: 'Tools & Utilities'
  };

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tenant Feature Management
          </h1>
          <p className="text-gray-600">
            Enable or disable features for specific tenants. Features marked with 💎 are uplift (premium) features.
          </p>
        </div>

        {/* Tenant Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tenant
          </label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Features by Category */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading features...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(featuresByCategory).map(([category, features]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {categoryNames[category] || category}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map(feature => (
                      <label
                        key={feature.feature_key}
                        className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={enabledFeatures.includes(feature.feature_key)}
                          onChange={() => toggleFeature(feature.feature_key)}
                          className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {feature.feature_name}
                            </span>
                            {feature.is_uplift && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Sparkles className="h-3 w-3" />
                                Uplift
                              </span>
                            )}
                          </div>
                          {feature.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600">
            {selectedTenant && (
              <>
                <span className="font-medium">{enabledFeatures.length}</span> features enabled for{' '}
                <span className="font-medium">{selectedTenant.name}</span>
              </>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !selectedTenantId}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
