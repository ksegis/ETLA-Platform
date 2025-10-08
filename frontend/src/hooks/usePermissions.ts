import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

/**
 * RBAC — Single source of truth
 * - Exported constants/types so other modules can import from here.
 * - Compatibility aliases on PERMISSIONS and ROLES to unblock legacy call-sites.
 * - Hook returns `currentRole`, `currentUserRole`, `loading`, and all helpers.
 */

/* =========================
 * Features
 * ========================= */
export const FEATURES = {
  // Data Management
  MIGRATION_WORKBENCH: 'migration-workbench',
  FILE_UPLOAD: 'file-upload',
  DATA_VALIDATION: 'data-validation',
  EMPLOYEE_DATA_PROCESSING: 'employee-data-processing',

  // Core Business / Projects
  PROJECT_MANAGEMENT: 'project-management',
  WORK_REQUESTS: 'work-requests',
  PROJECT_CHARTER: 'project-charter',
  RISK_MANAGEMENT: 'risk-management',
  RESOURCE_MANAGEMENT: 'resource-management',

  // Reporting & Analytics
  REPORTING: 'reporting',
  DASHBOARDS: 'dashboards',
  ANALYTICS: 'analytics',
  HISTORICAL_DATA: 'historical-data',

  // Administration
  USER_MANAGEMENT: 'user-management',
  ACCESS_CONTROL: 'access-control',
  TENANT_MANAGEMENT: 'tenant-management',
  SYSTEM_SETTINGS: 'system-settings',
  AUDIT_LOGS: 'audit-logs',
  AUDIT: 'audit',
  SYSTEM_HEALTH: 'system-health',
  API_CONFIG: 'api-config',
  INTEGRATIONS: 'integrations',

  // Directory / HR
  EMPLOYEES: 'employees',
  EMPLOYEE_RECORDS: 'employee-records',
  BENEFITS_MANAGEMENT: 'benefits-management',
  PAYROLL_PROCESSING: 'payroll-processing',

  // Talent (to satisfy DashboardLayout)
  TALENT_JOBS: 'talent-jobs',
  TALENT_CANDIDATES: 'talent-candidates',
  TALENT_INTERVIEWS: 'talent-interviews',
  TALENT_OFFERS: 'talent-offers',
} as const
export type Feature = typeof FEATURES[keyof typeof FEATURES]

/* =========================
 * Permissions
 * ========================= */
const CORE_PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  APPROVE: 'approve',
  EXPORT: 'export',
  IMPORT: 'import',
} as const

// Legacy / compatibility keys mapped onto core semantics
export const PERMISSIONS = {
  ...CORE_PERMISSIONS,

  // Menu/route gating aliases
  JOB_MANAGE: 'manage',
  CANDIDATE_READ: 'view',
  INTERVIEW_MANAGE: 'manage',
  OFFER_MANAGE: 'manage',

  DATA_PROCESS: 'view',
  DATA_ANALYZE: 'view',
  DATA_MANAGE: 'manage',
  DATA_VALIDATE: 'manage',
  FILE_UPLOAD: 'import',

  AUDIT_VIEW: 'view',
  SYSTEM_HEALTH_VIEW: 'view',
  SYSTEM_SETTINGS_MANAGE: 'manage',
  API_CONFIG_MANAGE: 'manage',
  INTEGRATION_MANAGE: 'manage',
  ADMIN_ACCESS: 'view',

  EMPLOYEE_READ: 'view',
  EMPLOYEE_PROCESS: 'manage',
  BENEFITS_MANAGE: 'manage',
  PAYROLL_MANAGE: 'manage',

  // RouteGuard / misc
  TENANT_READ: 'view',
  USER_READ: 'view',
  PROJECT_READ: 'view',
  WORK_REQUEST_READ: 'view',
  REPORTING_VIEW: 'view',

  // Composite legacy (feature_permission)
  WORK_REQUESTS_CREATE: 'create',
  WORK_REQUESTS_UPDATE: 'update',
  WORK_REQUESTS_DELETE: 'delete',
} as const
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

/* =========================
 * Roles
 * ========================= */
export const ROLES = {
  HOST_ADMIN: 'host_admin',
  CLIENT_ADMIN: 'client_admin',
  TENANT_ADMIN: 'client_admin', // <-- alias so ROLES.TENANT_ADMIN works
  PROGRAM_MANAGER: 'program_manager',
  CLIENT_USER: 'client_user',
  USER: 'user', // alias for client_user
} as const
export type Role = typeof ROLES[keyof typeof ROLES]

/* =========================
 * Role matrices (default)
 * ========================= */

type RolePermissionEntry = { feature: Feature; permission: Permission }
type RolePermissionsMatrix = Record<Role, { role: Role; permissions: RolePermissionEntry[] }>

const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMatrix = {
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
}

/* =========================
 * Hook
 * ========================= */
export function usePermissions() {
  const { user, tenantUser, isAuthenticated, isDemoMode } = useAuth()
  const [userPermissions, setUserPermissions] = useState<RolePermissionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !tenantUser) {
      setUserPermissions([])
      setIsLoading(false)
      return
    }
    const role = (tenantUser.role ?? ROLES.CLIENT_USER) as Role
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role] ?? DEFAULT_ROLE_PERMISSIONS[ROLES.CLIENT_USER]
    setUserPermissions(rolePermissions.permissions)
    setIsLoading(false)
  }, [isAuthenticated, tenantUser])

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
        return CORE_PERMISSIONS.MANAGE

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
        return CORE_PERMISSIONS.VIEW

      case PERMISSIONS.WORK_REQUESTS_CREATE:
      case CORE_PERMISSIONS.CREATE:
        return CORE_PERMISSIONS.CREATE

      case PERMISSIONS.WORK_REQUESTS_UPDATE:
      case CORE_PERMISSIONS.UPDATE:
        return CORE_PERMISSIONS.UPDATE

      case PERMISSIONS.WORK_REQUESTS_DELETE:
      case CORE_PERMISSIONS.DELETE:
        return CORE_PERMISSIONS.DELETE

      case PERMISSIONS.FILE_UPLOAD:
      case CORE_PERMISSIONS.IMPORT:
        return CORE_PERMISSIONS.IMPORT

      case CORE_PERMISSIONS.EXPORT:
        return CORE_PERMISSIONS.EXPORT

      case CORE_PERMISSIONS.APPROVE:
        return CORE_PERMISSIONS.APPROVE

      default:
        return p
    }
  }

  // Core permission check
  function hasPermission(feature: Feature, permission: Permission): boolean {
    if (isDemoMode) return true
    if (!isAuthenticated || !tenantUser) return false
    if ((tenantUser.role as Role) === ROLES.HOST_ADMIN) return true
    const normalized = normalizePermission(permission)
    return userPermissions.some((p) => p.feature === feature && normalizePermission(p.permission) === normalized)
  }

  /**
   * Compatibility: allow (feature, permission) or "feature.permission"
   * Also tolerate undefined feature (treat as visible) and arbitrary string feature values.
   */
  function checkPermission(arg1: Feature | string | undefined, arg2?: any): boolean {
    if (arg1 === undefined) return true
    if (typeof arg1 === 'string' && !arg2) {
      const [f, p] = String(arg1).split('.') as [Feature, Permission]
      return hasPermission(f, normalizePermission(p))
    }
    return hasPermission(arg1 as Feature, normalizePermission(arg2 as Permission))
  }

  function checkAnyPermission(feature: Feature, permissions: Permission[]) {
    return permissions.some((perm) => hasPermission(feature, perm))
  }

  function canAccessFeature(feature: Feature): boolean {
    if (isDemoMode) return true
    if (!isAuthenticated || !tenantUser) return false
    if ((tenantUser.role as Role) === ROLES.HOST_ADMIN) return true
    return userPermissions.some((p) => p.feature === feature)
  }

  function getPermissionLevel(feature: Feature): Permission[] {
    if (isDemoMode || (tenantUser?.role as Role) === ROLES.HOST_ADMIN) return [CORE_PERMISSIONS.MANAGE]
    if (!isAuthenticated || !tenantUser) return []
    return userPermissions
      .filter((p) => p.feature === feature)
      .map((p) => normalizePermission(p.permission))
  }

  // Action helpers (feature-first)
  const canCreate = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.CREATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canUpdate = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.UPDATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canDelete = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.DELETE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canView   = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.VIEW) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE) ||
    canCreate(f) || canUpdate(f)

  /**
   * canManage accepts either:
   *  - a Feature (usual case), or
   *  - a permission-like string ('create'|'update'|'delete'|'view'|'manage') in legacy sites
   *    in which case we assume WORK_REQUESTS feature (to satisfy calls like canManage(PERMISSIONS.WORK_REQUESTS_CREATE)).
   */
  const canManage = (arg: Feature | string): boolean => {
    // if legacy "create/update/delete/view/manage" string is passed, assume WORK_REQUESTS feature context
    const lowered = String(arg).toLowerCase()
    if (['create', 'update', 'delete', 'view', 'manage'].includes(lowered)) {
      const perm = lowered as Permission
      const feature = FEATURES.WORK_REQUESTS
      if (perm === CORE_PERMISSIONS.MANAGE) return hasPermission(feature, CORE_PERMISSIONS.MANAGE)
      return hasPermission(feature, normalizePermission(perm))
    }
    return hasPermission(arg as Feature, CORE_PERMISSIONS.MANAGE)
  }

  const canApprove = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.UPDATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canExport = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.VIEW) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canImport = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.IMPORT) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  function resolveFeatureFromArg(arg: Feature | string): Feature {
    // If a raw string equals one of our feature values, keep it; otherwise default to WORK_REQUESTS for legacy calls.
    const values = Object.values(FEATURES) as string[]
    if (values.includes(String(arg))) return arg as Feature
    return FEATURES.WORK_REQUESTS
  }

  const getAccessibleFeatures = (): Feature[] => {
    if (isDemoMode) return Object.values(FEATURES)
    if (!isAuthenticated || !tenantUser) return []
    if ((tenantUser.role as Role) === ROLES.HOST_ADMIN) return Object.values(FEATURES)
    return Array.from(new Set(userPermissions.map((p) => p.feature))) as Feature[]
  }

  // Admin helpers (relax type to avoid union-narrowing error)
  const isAdmin = () =>
    !!tenantUser && ([ROLES.HOST_ADMIN, ROLES.CLIENT_ADMIN] as ReadonlyArray<string>).includes(String(tenantUser.role))

  const isHostAdmin = () => String(tenantUser?.role) === ROLES.HOST_ADMIN

  const canManageUsers = () => hasPermission(FEATURES.USER_MANAGEMENT, CORE_PERMISSIONS.MANAGE)

  const canAccessAdmin = () =>
    canAccessFeature(FEATURES.ACCESS_CONTROL) ||
    canAccessFeature(FEATURES.USER_MANAGEMENT) ||
    canAccessFeature(FEATURES.SYSTEM_SETTINGS)

  const isSuperAdmin = () => {
    if (!isAuthenticated || !tenantUser) return false
    return ([ROLES.HOST_ADMIN, ROLES.CLIENT_ADMIN] as ReadonlyArray<string>).includes(String(tenantUser.role))
  }

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
  })

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

    // Expose constants so callers can import from here
    FEATURES,
    PERMISSIONS,
    ROLES,
  }
}

export default usePermissions
