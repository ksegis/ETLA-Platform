// src/hooks/usePermissions.ts
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Import the PURE constants (no hooks) and re-export for compatibility.
import {
  FEATURES,
  PERMISSIONS,
  ROLES,
  CORE_PERMISSIONS,
  type Feature,
  type Permission,
  type Role,
} from '@/rbac/constants';

export { FEATURES, PERMISSIONS, ROLES };
export type { Feature, Permission, Role };

type RolePermissionEntry = { feature: Feature; permission: Permission };


const DEFAULT_ROLE_PERMISSIONS: Record<Role, { role: Role; permissions: RolePermissionEntry[] }> = {
  [ROLES.HOST_ADMIN]: {
    role: ROLES.HOST_ADMIN,
    permissions: Object.values(FEATURES).map((feature) => ({ feature, permission: CORE_PERMISSIONS.MANAGE })),
  },

  [ROLES.PROGRAM_MANAGER]: {
    role: ROLES.PROGRAM_MANAGER,
    permissions: [
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.PROJECT_CHARTER, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.RISK_MANAGEMENT, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.RESOURCE_MANAGEMENT, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.DASHBOARDS, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.ANALYTICS, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.USER_MANAGEMENT, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.MIGRATION_WORKBENCH, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.DATA_VALIDATION, permission: CORE_PERMISSIONS.VIEW },
    ],
  },

  [ROLES.PRIMARY_CLIENT_ADMIN]: {
    role: ROLES.PRIMARY_CLIENT_ADMIN,
    permissions: [
      { feature: FEATURES.USER_MANAGEMENT, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.ACCESS_CONTROL, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.DASHBOARDS, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.EMPLOYEE_RECORDS, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.FILE_UPLOAD, permission: CORE_PERMISSIONS.CREATE },
      { feature: FEATURES.DATA_VALIDATION, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.MIGRATION_WORKBENCH, permission: CORE_PERMISSIONS.VIEW },
    ],
  },

  [ROLES.CLIENT_ADMIN]: {
    role: ROLES.CLIENT_ADMIN,
    permissions: [
      { feature: FEATURES.USER_MANAGEMENT, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.ACCESS_CONTROL, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.DASHBOARDS, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.EMPLOYEE_RECORDS, permission: CORE_PERMISSIONS.MANAGE },
      { feature: FEATURES.FILE_UPLOAD, permission: CORE_PERMISSIONS.CREATE },
      { feature: FEATURES.DATA_VALIDATION, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.MIGRATION_WORKBENCH, permission: CORE_PERMISSIONS.VIEW },
    ],
  },

  [ROLES.CLIENT_USER]: {
    role: ROLES.CLIENT_USER,
    permissions: [
      { feature: FEATURES.WORK_REQUESTS, permission: CORE_PERMISSIONS.CREATE },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE_PERMISSIONS.UPDATE },
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.DASHBOARDS, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.FILE_UPLOAD, permission: CORE_PERMISSIONS.CREATE },
      { feature: FEATURES.ACCESS_CONTROL, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.USER_MANAGEMENT, permission: CORE_PERMISSIONS.VIEW },
    ],
  },

  [ROLES.USER]: {
    role: ROLES.USER,
    permissions: [
      { feature: FEATURES.WORK_REQUESTS, permission: CORE_PERMISSIONS.CREATE },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE_PERMISSIONS.UPDATE },
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.DASHBOARDS, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.FILE_UPLOAD, permission: CORE_PERMISSIONS.CREATE },
      { feature: FEATURES.ACCESS_CONTROL, permission: CORE_PERMISSIONS.VIEW },
      { feature: FEATURES.USER_MANAGEMENT, permission: CORE_PERMISSIONS.VIEW },
    ],
  },
};

export function usePermissions() {
  const { user, tenantUser, isAuthenticated, isDemoMode } = useAuth();
  const [userPermissions, setUserPermissions] = useState<RolePermissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPermissionsFromDatabase() {
      // Keep loading until we have authentication state
      if (!isAuthenticated) {
        setUserPermissions([]);
        setIsLoading(false);
        return;
      }
      
      // If authenticated but tenantUser not loaded yet, keep loading
      if (!tenantUser) {
        setIsLoading(true);
        return;
      }

      const role = (tenantUser.role ?? ROLES.CLIENT_USER) as Role;
      
      try {
        // Import the service dynamically to avoid circular dependencies
        const { getRoleWithPermissions } = await import('@/services/role_permissions_service');
        
        // Load permissions from database
        const roleData = await getRoleWithPermissions(role);
        
        if (roleData && roleData.permissions) {
          // Convert database permissions to RolePermissionEntry format
          const permissions: RolePermissionEntry[] = [];
          
          roleData.permissions.forEach((perm) => {
            // Add permission entries based on what's enabled in the database
            if (perm.can_manage) {
              permissions.push({ feature: perm.feature_key as Feature, permission: CORE_PERMISSIONS.MANAGE });
            } else {
              // Add specific CRUD permissions
              if (perm.can_create) {
                permissions.push({ feature: perm.feature_key as Feature, permission: CORE_PERMISSIONS.CREATE });
              }
              if (perm.can_read) {
                permissions.push({ feature: perm.feature_key as Feature, permission: CORE_PERMISSIONS.VIEW });
              }
              if (perm.can_update) {
                permissions.push({ feature: perm.feature_key as Feature, permission: CORE_PERMISSIONS.UPDATE });
              }
              if (perm.can_delete) {
                permissions.push({ feature: perm.feature_key as Feature, permission: CORE_PERMISSIONS.DELETE });
              }
            }
          });
          
          console.log(`✅ Loaded ${permissions.length} permissions from database for role: ${role}`);
          setUserPermissions(permissions);
        } else {
          // Fallback to hardcoded defaults if database load fails
          console.warn(`⚠️ No database permissions found for role: ${role}, using defaults`);
          const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role] ?? DEFAULT_ROLE_PERMISSIONS[ROLES.CLIENT_USER];
          setUserPermissions(rolePermissions.permissions);
        }
      } catch (error) {
        console.error('Error loading permissions from database:', error);
        // Fallback to hardcoded defaults on error
        const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role] ?? DEFAULT_ROLE_PERMISSIONS[ROLES.CLIENT_USER];
        setUserPermissions(rolePermissions.permissions);
      } finally {
        setIsLoading(false);
      }
    }

    loadPermissionsFromDatabase();
  }, [isAuthenticated, tenantUser]);

  // Map aliases to core
  function normalizePermission(p: Permission): Permission {
    switch (p) {
      case PERMISSIONS.JOB_MANAGE:
      case PERMISSIONS.INTERVIEW_MANAGE:
      case PERMISSIONS.OFFER_MANAGE:
      case PERMISSIONS.DATA_MANAGE:
      case PERMISSIONS.DATA_VALIDATE:
      case PERMISSIONS.SYSTEM_SETTINGS_MANAGE:
      case PERMISSIONS.API_CONFIG_MANAGE:
      case PERMISSIONS.INTEGRATION_MANAGE:
      case PERMISSIONS.EMPLOYEE_PROCESS:
      case CORE_PERMISSIONS.MANAGE:
        return CORE_PERMISSIONS.MANAGE;

      case PERMISSIONS.CANDIDATE_READ:
      case PERMISSIONS.DATA_PROCESS:
      case PERMISSIONS.DATA_ANALYZE:
      case PERMISSIONS.AUDIT_VIEW:
      case PERMISSIONS.SYSTEM_HEALTH_VIEW:
      case PERMISSIONS.ADMIN_ACCESS:
      case PERMISSIONS.EMPLOYEE_READ:
      case PERMISSIONS.TENANT_READ:
      case PERMISSIONS.USER_READ:
      case PERMISSIONS.PROJECT_READ:
      case PERMISSIONS.WORK_REQUEST_READ:
      case PERMISSIONS.REPORTING_VIEW:
      case CORE_PERMISSIONS.VIEW:
        return CORE_PERMISSIONS.VIEW;

      case PERMISSIONS.WORK_REQUESTS_CREATE:
      case CORE_PERMISSIONS.CREATE:
        return CORE_PERMISSIONS.CREATE;

      case PERMISSIONS.WORK_REQUESTS_UPDATE:
      case CORE_PERMISSIONS.UPDATE:
        return CORE_PERMISSIONS.UPDATE;

      case PERMISSIONS.WORK_REQUESTS_DELETE:
      case CORE_PERMISSIONS.DELETE:
        return CORE_PERMISSIONS.DELETE;

      case PERMISSIONS.FILE_UPLOAD:
      case CORE_PERMISSIONS.IMPORT:
        return CORE_PERMISSIONS.IMPORT;

      case CORE_PERMISSIONS.EXPORT:
        return CORE_PERMISSIONS.EXPORT;

      case CORE_PERMISSIONS.APPROVE:
        return CORE_PERMISSIONS.APPROVE;

      default:
        return p;
    }
  }

  // Core permission check
  function hasPermission(feature: Feature, permission: Permission): boolean {
    if (isDemoMode) return true;
    if (!isAuthenticated || !tenantUser) return false;
    if (String(tenantUser.role).toLowerCase() === ROLES.HOST_ADMIN) return true;
    const normalized = normalizePermission(permission);
    return userPermissions.some((p) => p.feature === feature && normalizePermission(p.permission) === normalized);
  }

  /**
   * Compatibility: allow (feature, permission) or "feature.permission"
   * Also tolerate undefined feature (treat as visible) and arbitrary string feature values.
   */
  function checkPermission(arg1: Feature | string | undefined, arg2?: any): boolean {
    if (arg1 === undefined) return true;
    if (typeof arg1 === 'string' && !arg2) {
      const [f, p] = String(arg1).split('.') as [Feature, Permission];
      return hasPermission(f, normalizePermission(p));
    }
    return hasPermission(arg1 as Feature, normalizePermission(arg2 as Permission));
  }

  function checkAnyPermission(feature: Feature, permissions: Permission[]) {
    return permissions.some((perm) => hasPermission(feature, perm));
  }

  function canAccessFeature(feature: Feature): boolean {
    if (isDemoMode) return true;
    if (!isAuthenticated || !tenantUser) return false;
    if (String(tenantUser.role).toLowerCase() === ROLES.HOST_ADMIN) return true;
    return userPermissions.some((p) => p.feature === feature);
  }

  function getPermissionLevel(feature: Feature): Permission[] {
    if (isDemoMode || String(tenantUser?.role).toLowerCase() === ROLES.HOST_ADMIN) return [CORE_PERMISSIONS.MANAGE];
    if (!isAuthenticated || !tenantUser) return [];
    return userPermissions
      .filter((p) => p.feature === feature)
      .map((p) => normalizePermission(p.permission));
  }

  // Helpers (feature-first)
  const canCreate = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.CREATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE);

  const canUpdate = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.UPDATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE);

  const canDelete = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.DELETE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE);

  const canView = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.VIEW) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE) ||
    canCreate(f) || canUpdate(f);

  /**
   * canManage accepts either:
   *  - a Feature (usual case), or
   *  - a permission-like string ('create'|'update'|'delete'|'view'|'manage') in legacy sites
   *    in which case we assume WORK_REQUESTS feature (to satisfy calls like canManage(PERMISSIONS.WORK_REQUESTS_CREATE)).
   */
  const canManage = (arg: Feature | string): boolean => {
    const lowered = String(arg).toLowerCase();
    if (['create', 'update', 'delete', 'view', 'manage'].includes(lowered)) {
      const perm = lowered as Permission;
      const feature = FEATURES.WORK_REQUESTS;
      if (perm === CORE_PERMISSIONS.MANAGE) return hasPermission(feature, CORE_PERMISSIONS.MANAGE);
      return hasPermission(feature, normalizePermission(perm));
    }
    return hasPermission(arg as Feature, CORE_PERMISSIONS.MANAGE);
  };

  const canApprove = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.UPDATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE);

  const canExport = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.VIEW) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE);

  const canImport = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.IMPORT) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE);

  function resolveFeatureFromArg(arg: Feature | string): Feature {
    const values = Object.values(FEATURES) as string[];
    if (values.includes(String(arg))) return arg as Feature;
    return FEATURES.WORK_REQUESTS;
  }

  const getAccessibleFeatures = (): Feature[] => {
    if (isDemoMode) return Object.values(FEATURES);
    if (!isAuthenticated || !tenantUser) return [];
    if ((tenantUser.role as Role) === ROLES.HOST_ADMIN) return Object.values(FEATURES);
    return Array.from(new Set(userPermissions.map((p) => p.feature))) as Feature[];
  };

  // Admin helpers (relax type to avoid union-narrowing error)
  const isAdmin = () =>
    !!tenantUser && ([ROLES.HOST_ADMIN, ROLES.CLIENT_ADMIN, ROLES.PRIMARY_CLIENT_ADMIN] as ReadonlyArray<string>).includes(String(tenantUser.role));

  const isHostAdmin = () => String(tenantUser?.role).toLowerCase() === ROLES.HOST_ADMIN;

  const canManageUsers = () => hasPermission(FEATURES.USER_MANAGEMENT, CORE_PERMISSIONS.MANAGE);

  const canAccessAdmin = () =>
    canAccessFeature(FEATURES.ACCESS_CONTROL) ||
    canAccessFeature(FEATURES.USER_MANAGEMENT) ||
    canAccessFeature(FEATURES.SYSTEM_SETTINGS);

  const isSuperAdmin = () => {
    if (!isAuthenticated || !tenantUser) return false;
    return ([ROLES.HOST_ADMIN, ROLES.CLIENT_ADMIN, ROLES.PRIMARY_CLIENT_ADMIN] as ReadonlyArray<string>).includes(String(tenantUser.role));
  };

  const getUserPermissions = () => ({
    workRequests: {
      view:   canView(FEATURES.WORK_REQUESTS),
      create: canCreate(FEATURES.WORK_REQUESTS),
      update: canUpdate(FEATURES.WORK_REQUESTS),
      approve: canApprove(FEATURES.WORK_REQUESTS),
    },
    projects: {
      view:   canView(FEATURES.PROJECT_MANAGEMENT),
      create: canCreate(FEATURES.PROJECT_MANAGEMENT),
      update: canUpdate(FEATURES.PROJECT_MANAGEMENT),
      delete: canDelete(FEATURES.PROJECT_MANAGEMENT),
    },
    risks: {
      view:   canView(FEATURES.RISK_MANAGEMENT),
      manage: canManage(FEATURES.RISK_MANAGEMENT),
    },
    users: {
      view:   canView(FEATURES.USER_MANAGEMENT),
      manage: canManageUsers(),
    },
    reports: {
      view:   canView(FEATURES.DASHBOARDS),
      export: canExport(FEATURES.DASHBOARDS),
    },
    admin: {
      access: canAccessAdmin(),
      isAdmin: isAdmin(),
      isHostAdmin: isHostAdmin(),
    },
  });

  return {
    // Checkers
    hasPermission,
    checkPermission,
    checkAnyPermission,
    canAccessFeature,
    getPermissionLevel,

    // Action helpers
    canCreate,
    canUpdate,
    canDelete,
    canView,
    canManage,
    canApprove,
    canExport,
    canImport,

    // Utilities
    getAccessibleFeatures,
    getUserPermissions,
    isAdmin,
    isHostAdmin,
    canManageUsers,
    canAccessAdmin,

    // State
    userPermissions,
    isLoading,
    loading: isLoading,        // compat alias expected by your code/tests
    Loading: isLoading,        // compat alias (some code reads `Loading`)
    isDemoMode,
    isAuthenticated,

    // Current user info
    currentRole: tenantUser?.role,
    currentUserRole: tenantUser?.role, // compat alias expected by your code/tests
    currentUserId: user?.id,
    currentTenantId: tenantUser?.tenant_id,
    isSuperAdmin,

    // Re-export constants for legacy imports from this hook file
    FEATURES,
    PERMISSIONS,
    ROLES,
  };
}

export default usePermissions;
