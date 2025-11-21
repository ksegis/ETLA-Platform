import { supabase } from '@/lib/supabase'
import { 
  RBACMatrixRowUser, 
  RBACPermissionCatalog, 
  RBACPermissionCell, 
  RBACUserDetail,
  RBACApplyChangesRequest,
  Tenant,
  User
} from '@/types'
import { FEATURES, PERMISSIONS } from '@/hooks/usePermissions'

export class RBACAdminService {
  /**
   * List all tenants accessible to the current user
   */
  static async listTenants(): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error listing tenants:', error)
      throw error
    }
  }

  /**
   * List ALL users across ALL tenants (for host admins)
   */
  static async listAllUsers(
    options: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{
    users: Array<{
      userId: string;
      email: string;
      display_name?: string;
      role: string;
      is_active: boolean;
      tenant_id: string;
      tenant_name: string;
    }>;
    total: number;
  }> {
    try {
      const { page = 1, limit = 200, search } = options
      const offset = (page - 1) * limit

      // Use RPC function for better join support
      let query = supabase.rpc('list_all_users_with_tenants')

      // Fallback to direct query if RPC doesn't exist
      const { data: rpcData, error: rpcError } = await query
      
      if (rpcError) {
        // Fallback: use direct query with manual join
        const { data: tuData, error: tuError } = await supabase
          .from('tenant_users')
          .select('user_id, tenant_id, role, is_active')
          .range(offset, offset + limit - 1)
        
        if (tuError) throw tuError
        
        // Manually fetch related data
        const userIds = tuData?.map((tu: any) => tu.user_id) || []
        const tenantIds = tuData?.map((tu: any) => tu.tenant_id) || []
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds)
        
        const { data: tenants } = await supabase
          .from('tenants')
          .select('id, name')
          .in('id', tenantIds)
        
        // Create lookup maps
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
        const tenantMap = new Map(tenants?.map(t => [t.id, t]) || [])
        
        const users = tuData?.map((item: any) => {
          const profile = profileMap.get(item.user_id)
          const tenant = tenantMap.get(item.tenant_id)
          return {
            userId: item.user_id,
            email: profile?.email || 'unknown@example.com',
            display_name: profile?.full_name || profile?.email || 'Unknown User',
            role: item.role,
            is_active: item.is_active,
            tenant_id: item.tenant_id,
            tenant_name: tenant?.name || 'Unknown Tenant'
          }
        }) || []
        
        const { count } = await supabase
          .from('tenant_users')
          .select('*', { count: 'exact', head: true })
        
        return {
          users,
          total: count || 0
        }
      }
      
      const users = rpcData || []
      
      const { count } = await supabase
        .from('tenant_users')
        .select('*', { count: 'exact', head: true })

      return {
        users,
        total: count || 0
      }
    } catch (error) {
      console.error('Error listing all users:', error)
      throw error
    }
  }

  /**
   * List users for a specific tenant with pagination and search.
   */
  static async listTenantUsers(
    tenantId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{
    users: Array<{
      userId: string;
      email: string;
      display_name?: string;
      role: string;
      is_active: boolean;
    }>;
    total: number;
  }> {
    try {
      const { page = 1, limit = 50, search } = options
      const offset = (page - 1) * limit

      let query = supabase
        .from('tenant_users')
        .select(`
          user_id,
          role,
          is_active,
          profiles!tenant_users_user_id_fkey(
            id,
            email,
            full_name
          )
        `)
        .eq('tenant_id', tenantId)

      // Add search filter if provided
      if (search) {
        query = query.or(`profiles.email.ilike.%${search}%,profiles.first_name.ilike.%${search}%,profiles.last_name.ilike.%${search}%`)
      }

      // Get total count
      const { count } = await supabase
        .from('tenant_users')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)

      // Get paginated results
      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('profiles(email)')

      if (error) throw error

      const users = data?.map((item: any) => ({
        userId: item.user_id,
        email: item.profiles?.email || 'unknown@example.com',
        display_name: item.profiles?.full_name || item.profiles?.email || 'Unknown User',
        role: item.role,
        is_active: item.is_active
      })) || []

      return {
        users,
        total: count || 0
      }
    } catch (error) {
      console.error('Error listing tenant users:', error)
      throw error
    }
  }

  /**
   * Get the permission catalog (all available permissions)
   */
  static async listPermissionCatalog(): Promise<RBACPermissionCatalog[]> {
    // Build permission catalog from FEATURES and PERMISSIONS constants
    const catalog: RBACPermissionCatalog[] = []

    Object.values(FEATURES).forEach((feature: any) => {
      Object.values(PERMISSIONS).forEach((permission: any) => {
        catalog.push({
          resource: feature,
          action: permission,
          permissionId: `${feature}:${permission}`,
          description: `${permission.charAt(0).toUpperCase() + permission.slice(1)} ${feature.replace('-', ' ')}`
        })
      })
    })

    return catalog
  }

  /**
   * Get effective permissions for multiple users.
   */
  static async getEffectivePermissions(
    tenantId: string,
    userIds: string[]
  ): Promise<Map<string, RBACPermissionCell[]>> {
    try {
      const permissionCatalog = await this.listPermissionCatalog()
      const effectivePermissions = new Map<string, RBACPermissionCell[]>()

      // For each user, calculate their effective permissions
      for (const userId of userIds) {
        try {
          const userDetail = await this.getUserDetail(tenantId, userId)
          const userCells: RBACPermissionCell[] = []

          // Process each permission in the catalog
          for (const catalogItem of permissionCatalog) {
            const cell = await this.calculateEffectivePermission(
              userDetail,
              catalogItem.permissionId,
              catalogItem.resource,
              catalogItem.action
            )
            userCells.push(cell)
          }

          effectivePermissions.set(userId, userCells)
        } catch (userError) {
          console.warn(`Skipping user ${userId}:`, userError)
          // Set empty permissions for users that fail
          effectivePermissions.set(userId, [])
        }
      }

      return effectivePermissions
    } catch (error) {
      console.error('Error getting effective permissions:', error)
      throw error
    }
  }

  /**
   * Get detailed information for a specific user
   */
  static async getUserDetail(tenantId: string, userId: string): Promise<RBACUserDetail> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) throw profileError

      // Get tenant membership
      const { data: membership, error: membershipError } = await supabase
        .from('tenant_users')
        .select('role, is_active, tenant_id')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (membershipError) throw membershipError

      // Handle case where user or membership doesn't exist
      if (!membership) {
        throw new Error(`User ${userId} is not a member of tenant ${tenantId}`)
      }

      // Get user overrides from new role_permission_overrides table
      let overrides: Array<{ permissionId: string; effect: 'allow' | 'deny' }> = []
      try {
        const { data: overrideData } = await supabase
          .from('role_permission_overrides')
          .select('feature_key, can_create, can_read, can_update, can_delete')
          .eq('user_id', userId)
          .eq('tenant_id', tenantId)

        // Convert new format to old format for compatibility
        overrides = overrideData?.flatMap((item: any) => {
          const perms = []
          if (item.can_create) perms.push({ permissionId: `${item.feature_key}:create`, effect: 'allow' as const })
          if (item.can_read) perms.push({ permissionId: `${item.feature_key}:read`, effect: 'allow' as const })
          if (item.can_update) perms.push({ permissionId: `${item.feature_key}:update`, effect: 'allow' as const })
          if (item.can_delete) perms.push({ permissionId: `${item.feature_key}:delete`, effect: 'allow' as const })
          return perms
        }) || []
      } catch (err) {
        // Table might not exist yet or query failed, ignore error
        console.warn('Failed to load permission overrides:', err)
      }

      // Get tenant information
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, tenant_type')
        .eq('id', tenantId)
        .maybeSingle()

      // Return flat structure that matches UserDetailPanel expectations
      return {
        userId: userId,
        email: profile?.email || 'unknown@example.com',
        profile: {
          id: userId,
          email: profile?.email || 'unknown@example.com',
          full_name: (profile as any)?.full_name || null,
          first_name: (profile as any)?.first_name || null,
          last_name: (profile as any)?.last_name || null,
          phone: (profile as any)?.phone || null
        },
        role: membership.role,
        is_active: membership.is_active,
        tenant: tenant || null,
        permission_scope: 'tenant_scope',
        permissions: overrides,
        overrides,
        roles: [membership.role]
      } as any
    } catch (error) {
      console.error('Error getting user detail:', error)
      throw error
    }
  }

  /**
   * Calculate effective permission for a user
   */
  private static async calculateEffectivePermission(
    userDetail: RBACUserDetail,
    permissionId: string,
    resource: string,
    action: string
  ): Promise<RBACPermissionCell> {
    // Check for user override first
    const override = userDetail.overrides.find((o: any) => o.permissionId === permissionId)
    if (override) {
      return {
        permissionId,
        resource,
        action,
        state: override.effect,
        origin: 'override',
        roleNames: userDetail.roles
      }
    }

    // Check role-based permission
    const hasRolePermission = this.checkRolePermission(userDetail.membership.role, resource, action)
    if (hasRolePermission) {
      return {
        permissionId,
        resource,
        action,
        state: 'allow',
        origin: 'role',
        roleNames: [userDetail.membership.role]
      }
    }

    // Default to none
    return {
      permissionId,
      resource,
      action,
      state: 'none',
      origin: 'none',
      roleNames: userDetail.roles
    }
  }

  /**
   * Check if a role has a specific permission
   */
  private static checkRolePermission(role: string, resource: string, action: string): boolean {
    // This would typically come from your role permission configuration
    // For now, use simplified logic based on role hierarchy
    
    if (role === 'host_admin') {
      return true // Host admin has all permissions
    }

    if (role === 'client_admin') {
      // Client admin has most permissions except system-level ones
      const systemFeatures = ['tenant-management', 'system-settings']
      return !systemFeatures.includes(resource)
    }

    if (role === 'program_manager') {
      // Program manager has project-related permissions
      const projectFeatures = ['project-management', 'work-requests', 'project-charter', 'risk-management']
      return projectFeatures.includes(resource) && ['view', 'create', 'update'].includes(action)
    }

    if (role === 'client_user') {
      // Client user has limited permissions
      const userFeatures = ['work-requests', 'reporting']
      return userFeatures.includes(resource) && ['view', 'create'].includes(action)
    }

    return false
  }

  /**
   * Apply staged changes to the database
   */
  static async applyChanges(request: RBACApplyChangesRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Start a transaction by calling a stored procedure
      const { data, error } = await supabase.rpc('apply_rbac_changes', {
        p_tenant_id: request.tenantId,
        p_actor_user_id: request.actorUserId,
        p_role_assignments: request.roleAssignments || [],
        p_user_overrides: request.userOverrides || [],
        p_audit_note: request.auditNote || 'RBAC changes applied via admin interface'
      })

      if (error) {
        console.error('Error applying RBAC changes:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error applying RBAC changes:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get audit log for RBAC changes.
   */
  static async getAuditLog(tenantId: string, limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          profiles!activity_log_user_id_fkey(full_name, email)
        `)
        .eq('tenant_id', tenantId)
        .in('action', ['rbac_role_assigned', 'rbac_role_removed', 'rbac_override_set', 'rbac_override_cleared'])
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting audit log:', error)
      return []
    }
  }
}

export default RBACAdminService