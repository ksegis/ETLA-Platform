/**
 * Tenant Feature Subscription Service
 * 
 * Manages tenant-specific feature access (feature gating)
 * Used to check if a tenant has subscribed to a particular feature
 */

import { supabase } from '@/lib/supabase';

export interface TenantFeatureSubscription {
  id: string;
  tenant_id: string;
  feature_key: string;
  is_enabled: boolean;
  enabled_at: string;
  enabled_by?: string;
  disabled_at?: string;
  disabled_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureCatalogItem {
  id: string;
  feature_key: string;
  feature_name: string;
  feature_category: string;
  description?: string;
  is_uplift: boolean;
  default_enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all enabled features for a tenant
 * Returns array of feature keys that the tenant has access to
 */
export async function getTenantEnabledFeatures(tenantId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('tenant_feature_subscriptions')
      .select('feature_key')
      .eq('tenant_id', tenantId)
      .eq('is_enabled', true);

    if (error) {
      console.error('Error loading tenant features:', error);
      return [];
    }

    return data?.map(item => item.feature_key) || [];
  } catch (error) {
    console.error('Exception loading tenant features:', error);
    return [];
  }
}

/**
 * Check if a tenant has access to a specific feature
 */
export async function tenantHasFeature(tenantId: string, featureKey: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('tenant_feature_subscriptions')
      .select('is_enabled')
      .eq('tenant_id', tenantId)
      .eq('feature_key', featureKey)
      .eq('is_enabled', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking tenant feature:', error);
      return false;
    }

    return data?.is_enabled === true;
  } catch (error) {
    console.error('Exception checking tenant feature:', error);
    return false;
  }
}

/**
 * Get all features from catalog (for admin UI)
 */
export async function getFeatureCatalog(): Promise<FeatureCatalogItem[]> {
  try {
    const { data, error } = await supabase
      .from('feature_catalog')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error loading feature catalog:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception loading feature catalog:', error);
    return [];
  }
}

/**
 * Get tenant subscriptions with feature details (for admin UI)
 */
export async function getTenantSubscriptionsWithDetails(tenantId: string) {
  try {
    const { data, error } = await supabase
      .from('tenant_feature_subscriptions')
      .select(`
        *,
        feature_catalog:feature_key (
          feature_name,
          feature_category,
          description,
          is_uplift
        )
      `)
      .eq('tenant_id', tenantId)
      .order('feature_key');

    if (error) {
      console.error('Error loading tenant subscriptions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception loading tenant subscriptions:', error);
    return [];
  }
}

/**
 * Enable a feature for a tenant (host_admin only)
 */
export async function enableFeatureForTenant(
  tenantId: string,
  featureKey: string,
  userId?: string,
  notes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tenant_feature_subscriptions')
      .upsert({
        tenant_id: tenantId,
        feature_key: featureKey,
        is_enabled: true,
        enabled_at: new Date().toISOString(),
        enabled_by: userId,
        disabled_at: null,
        disabled_by: null,
        notes: notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tenant_id,feature_key'
      });

    if (error) {
      console.error('Error enabling feature for tenant:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception enabling feature for tenant:', error);
    return false;
  }
}

/**
 * Disable a feature for a tenant (host_admin only)
 */
export async function disableFeatureForTenant(
  tenantId: string,
  featureKey: string,
  userId?: string,
  notes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tenant_feature_subscriptions')
      .upsert({
        tenant_id: tenantId,
        feature_key: featureKey,
        is_enabled: false,
        disabled_at: new Date().toISOString(),
        disabled_by: userId,
        notes: notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tenant_id,feature_key'
      });

    if (error) {
      console.error('Error disabling feature for tenant:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception disabling feature for tenant:', error);
    return false;
  }
}

/**
 * Bulk update tenant features (host_admin only)
 */
export async function bulkUpdateTenantFeatures(
  tenantId: string,
  featureKeys: string[],
  userId?: string
): Promise<boolean> {
  try {
    // Get all features from catalog
    const catalog = await getFeatureCatalog();
    
    // Create upsert data for all features
    const updates = catalog.map(feature => ({
      tenant_id: tenantId,
      feature_key: feature.feature_key,
      is_enabled: featureKeys.includes(feature.feature_key),
      enabled_at: featureKeys.includes(feature.feature_key) ? new Date().toISOString() : null,
      enabled_by: featureKeys.includes(feature.feature_key) ? userId : null,
      disabled_at: !featureKeys.includes(feature.feature_key) ? new Date().toISOString() : null,
      disabled_by: !featureKeys.includes(feature.feature_key) ? userId : null,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('tenant_feature_subscriptions')
      .upsert(updates, {
        onConflict: 'tenant_id,feature_key'
      });

    if (error) {
      console.error('Error bulk updating tenant features:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception bulk updating tenant features:', error);
    return false;
  }
}
