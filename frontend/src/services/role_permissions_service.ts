/**
 * Role Permissions Service
 * 
 * Handles all database operations for role permissions management.
 * Provides CRUD operations for role definitions and feature permissions.
 */

import { createClient } from '@/lib/supabase/client';

export type RoleDefinition = {
  id: string;
  role_key: string;
  role_name: string;
  description: string | null;
  is_system_role: boolean;
  is_active: boolean;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RoleFeaturePermission = {
  id: string;
  role_id: string;
  feature_key: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_manage: boolean;
  created_at: string;
  updated_at: string;
};

export type RoleWithPermissions = RoleDefinition & {
  permissions: RoleFeaturePermission[];
};

export type PermissionUpdate = {
  feature_key: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_manage: boolean;
};

/**
 * Get all role definitions
 */
export async function getAllRoles(): Promise<RoleDefinition[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('role_definitions')
    .select('*')
    .eq('is_active', true)
    .order('role_name');

  if (error) {
    console.error('Error fetching roles:', error);
    throw new Error(`Failed to fetch roles: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a specific role by role_key
 */
export async function getRoleByKey(roleKey: string): Promise<RoleDefinition | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('role_definitions')
    .select('*')
    .eq('role_key', roleKey)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching role:', error);
    throw new Error(`Failed to fetch role: ${error.message}`);
  }

  return data;
}

/**
 * Get permissions for a specific role
 */
export async function getRolePermissions(roleId: string): Promise<RoleFeaturePermission[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('role_feature_permissions')
    .select('*')
    .eq('role_id', roleId)
    .order('feature_key');

  if (error) {
    console.error('Error fetching role permissions:', error);
    throw new Error(`Failed to fetch role permissions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a role with all its permissions
 */
export async function getRoleWithPermissions(roleKey: string): Promise<RoleWithPermissions | null> {
  const role = await getRoleByKey(roleKey);
  if (!role) return null;

  const permissions = await getRolePermissions(role.id);

  return {
    ...role,
    permissions,
  };
}

/**
 * Get all roles with their permissions
 */
export async function getAllRolesWithPermissions(): Promise<RoleWithPermissions[]> {
  const roles = await getAllRoles();
  
  const rolesWithPermissions = await Promise.all(
    roles.map(async (role) => {
      const permissions = await getRolePermissions(role.id);
      return {
        ...role,
        permissions,
      };
    })
  );

  return rolesWithPermissions;
}

/**
 * Update permissions for a role
 * This replaces all existing permissions for the role with the new ones
 */
export async function updateRolePermissions(
  roleKey: string,
  permissions: PermissionUpdate[]
): Promise<void> {
  const supabase = createClient();
  
  // Get role ID
  const role = await getRoleByKey(roleKey);
  if (!role) {
    throw new Error(`Role not found: ${roleKey}`);
  }

  if (role.is_system_role) {
    // For system roles, we still allow updates but log a warning
    console.warn(`Updating permissions for system role: ${roleKey}`);
  }

  // Delete existing permissions
  const { error: deleteError } = await supabase
    .from('role_feature_permissions')
    .delete()
    .eq('role_id', role.id);

  if (deleteError) {
    console.error('Error deleting old permissions:', deleteError);
    throw new Error(`Failed to delete old permissions: ${deleteError.message}`);
  }

  // Insert new permissions
  const permissionsToInsert = permissions.map((perm) => ({
    role_id: role.id,
    feature_key: perm.feature_key,
    can_create: perm.can_create,
    can_read: perm.can_read,
    can_update: perm.can_update,
    can_delete: perm.can_delete,
    can_manage: perm.can_manage,
  }));

  const { error: insertError } = await supabase
    .from('role_feature_permissions')
    .insert(permissionsToInsert);

  if (insertError) {
    console.error('Error inserting new permissions:', insertError);
    throw new Error(`Failed to insert new permissions: ${insertError.message}`);
  }
}

/**
 * Create a new custom role
 */
export async function createRole(
  roleKey: string,
  roleName: string,
  description: string,
  tenantId: string | null = null
): Promise<RoleDefinition> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('role_definitions')
    .insert({
      role_key: roleKey,
      role_name: roleName,
      description,
      is_system_role: false,
      is_active: true,
      tenant_id: tenantId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating role:', error);
    throw new Error(`Failed to create role: ${error.message}`);
  }

  return data;
}

/**
 * Delete a custom role (system roles cannot be deleted)
 */
export async function deleteRole(roleKey: string): Promise<void> {
  const supabase = createClient();
  
  // Check if it's a system role
  const role = await getRoleByKey(roleKey);
  if (!role) {
    throw new Error(`Role not found: ${roleKey}`);
  }

  if (role.is_system_role) {
    throw new Error('Cannot delete system roles');
  }

  const { error } = await supabase
    .from('role_definitions')
    .delete()
    .eq('role_key', roleKey);

  if (error) {
    console.error('Error deleting role:', error);
    throw new Error(`Failed to delete role: ${error.message}`);
  }
}

/**
 * Get user count for a role
 */
export async function getRoleUserCount(roleKey: string): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from('tenant_users')
    .select('*', { count: 'exact', head: true })
    .eq('role', roleKey);

  if (error) {
    console.error('Error counting users:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get permissions for current user
 */
export async function getCurrentUserPermissions(tenantId: string): Promise<Record<string, {
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_manage: boolean;
}>> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .rpc('get_user_permissions', {
      p_user_id: user.id,
      p_tenant_id: tenantId,
    });

  if (error) {
    console.error('Error fetching user permissions:', error);
    throw new Error(`Failed to fetch user permissions: ${error.message}`);
  }

  // Convert array to object keyed by feature_key
  const permissionsMap: Record<string, any> = {};
  (data || []).forEach((perm: any) => {
    permissionsMap[perm.feature_key] = {
      can_create: perm.can_create,
      can_read: perm.can_read,
      can_update: perm.can_update,
      can_delete: perm.can_delete,
      can_manage: perm.can_manage,
    };
  });

  return permissionsMap;
}
