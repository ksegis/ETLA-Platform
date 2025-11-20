import { supabase } from '@/lib/supabase';
import { Tenant, TenantTemplate } from '@/types';

export class TenantHierarchyService {
  /**
   * Get all child tenants of a parent
   */
  static async getChildTenants(parentId: string): Promise<Tenant[]> {
    const { data, error } = await supabase
      .rpc('get_child_tenants', { p_parent_id: parentId });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Check if user can access a specific tenant
   */
  static async canUserAccessTenant(
    userId: string, 
    tenantId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('user_can_access_tenant', { 
        p_user_id: userId, 
        p_tenant_id: tenantId 
      });
    
    if (error) throw error;
    return data || false;
  }

  /**
   * Get full tenant hierarchy starting from a root tenant
   */
  static async getTenantHierarchy(rootId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_tenant_hierarchy', { p_tenant_id: rootId });
    
    if (error) throw error;
    return data;
  }

  /**
   * Get all available tenant templates
   */
  static async getTenantTemplates(tier?: number): Promise<TenantTemplate[]> {
    let query = supabase
      .from('tenant_templates')
      .select('*')
      .eq('is_active', true);
    
    if (tier) {
      query = query.eq('tenant_tier', tier);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Create tenant from template
   */
  static async createTenantFromTemplate(
    templateId: string,
    tenantData: {
      name: string;
      code: string;
      parent_tenant_id?: string;
      contact_email?: string;
    }
  ): Promise<Tenant> {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from('tenant_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (templateError) throw templateError;

    // Create tenant with template defaults
    const insertData = {
      ...tenantData,
      tenant_tier: template.tenant_tier,
      max_users: template.max_users,
      max_projects: template.max_projects,
      can_have_children: template.can_have_children,
      max_child_tenants: template.max_child_tenants,
      settings: template.default_settings || {},
      feature_flags: template.default_feature_flags || {},
      usage_quotas: template.default_usage_quotas || {},
      rbac_settings: template.default_rbac_settings || {},
      status: 'active',
      subscription_plan: 'professional',
      is_active: true,
      current_child_count: 0,
    };

    const { data, error } = await supabase
      .from('tenants')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Get tenant tier name
   */
  static getTierName(tier: number): string {
    switch (tier) {
      case 1: return 'Platform';
      case 2: return 'Primary Customer';
      case 3: return 'Sub-Client';
      default: return 'Unknown';
    }
  }

  /**
   * Get tenants that can be parents (have can_have_children = true)
   */
  static async getAvailableParentTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('can_have_children', true)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Get tenant with children count
   */
  static async getTenantWithStats(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Check if tenant can have more children
   */
  static canAddChild(tenant: Tenant): boolean {
    if (!tenant.can_have_children) return false;
    if (tenant.max_child_tenants === 0) return true; // 0 means unlimited
    return tenant.current_child_count < tenant.max_child_tenants;
  }

  /**
   * Get permission scope display name
   */
  static getPermissionScopeName(scope: string): string {
    switch (scope) {
      case 'own': return 'Own Tenant Only';
      case 'children': return 'Own + Child Tenants';
      case 'descendants': return 'Own + All Descendants';
      case 'ancestors': return 'Own + Parent Tenants';
      case 'siblings': return 'Own + Sibling Tenants';
      default: return scope;
    }
  }
}
