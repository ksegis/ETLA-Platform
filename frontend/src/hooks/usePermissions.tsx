// src/hooks/usePermissions.tsx
import { useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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

  // Talent
  TALENT_JOBS: 'talent-jobs',
  TALENT_CANDIDATES: 'talent-candidates',
  TALENT_INTERVIEWS: 'talent-interviews',
  TALENT_OFFERS: 'talent-offers',
} as const
export type Feature = typeof FEATURES[keyof typeof FEATURES]

/* =========================
 * Permissions
 * ========================= */
const CORE = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  APPROVE: 'approve',
  EXPORT: 'export',
  IMPORT: 'import',
} as const

export const PERMISSIONS = {
  ...CORE,

  // Aliases
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

  TENANT_READ: 'view',
  USER_READ: 'view',
  PROJECT_READ: 'view',
  WORK_REQUEST_READ: 'view',
  REPORTING_VIEW: 'view',

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
  PROGRAM_MANAGER: 'program_manager',
  CLIENT_USER: 'client_user',
  USER: 'user',
} as const
export type Role = typeof ROLES[keyof typeof ROLES]

/* =========================
 * Default role matrix
 * ========================= */
type RolePermissionEntry = { feature: Feature; permission: Permission }
type RolePermissionsMatrix = Record<Role, { role: Role; permissions: RolePermissionEntry[] }>

const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMatrix = {
  [ROLES.HOST_ADMIN]: {
    role: ROLES.HOST_ADMIN,
    permissions: Object.values(FEATURES).map((feature) => ({ feature, permission: CORE.MANAGE })),
  },
  [ROLES.PROGRAM_MANAGER]: {
    role: ROLES.PROGRAM_MANAGER,
    permissions: [
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: CORE.MANAGE },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE.MANAGE },
      { feature: FEATURES.PROJECT_CHARTER, permission: CORE.MANAGE },
      { feature: FEATURES.RISK_MANAGEMENT, permission: CORE.MANAGE },
      { feature: FEATURES.RESOURCE_MANAGEMENT, permission: CORE.MANAGE },
      { feature: FEATURES.DASHBOARDS, permission: CORE.VIEW },
      { feature: FEATURES.ANALYTICS, permission: CORE.VIEW },
      { feature: FEATURES.USER_MANAGEMENT, permission: CORE.VIEW },
      { feature: FEATURES.MIGRATION_WORKBENCH, permission: CORE.VIEW },
      { feature: FEATURES.DATA_VALIDATION, permission: CORE.VIEW },
    ],
  },
  [ROLES.CLIENT_ADMIN]: {
    role: ROLES.CLIENT_ADMIN,
    permissions: [
      { feature: FEATURES.USER_MANAGEMENT, permission: CORE.MANAGE },
      { feature: FEATURES.ACCESS_CONTROL, permission: CORE.VIEW },
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: CORE.MANAGE },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE.MANAGE },
      { feature: FEATURES.DASHBOARDS, permission: CORE.VIEW },
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: CORE.MANAGE },
      { feature: FEATURES.EMPLOYEE_RECORDS, permission: CORE.MANAGE },
      { feature: FEATURES.FILE_UPLOAD, permission: CORE.CREATE },
      { feature: FEATURES.DATA_VALIDATION, permission: CORE.VIEW },
      { feature: FEATURES.MIGRATION_WORKBENCH, permission: CORE.VIEW },
    ],
  },
  [ROLES.CLIENT_USER]: {
    role: ROLES.CLIENT_USER,
    permissions: [
      { feature: FEATURES.WORK_REQUESTS, permission: CORE.CREATE },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE.VIEW },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE.UPDATE },
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: CORE.VIEW },
      { feature: FEATURES.DASHBOARDS, permission: CORE.VIEW },
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: CORE.VIEW },
      { feature: FEATURES.FILE_UPLOAD, permission: CORE.CREATE },
      { feature: FEATURES.ACCESS_CONTROL, permission: CORE.VIEW },
      { feature: FEATURES.USER_MANAGEMENT, permission: CORE.VIEW },
    ],
  },
  [ROLES.USER]: {
    role: ROLES.USER,
    permissions: [
      { feature: FEATURES.WORK_REQUESTS, permission: CORE.CREATE },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE.VIEW },
      { feature: FEATURES.WORK_REQUESTS, permission: CORE.UPDATE },
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: CORE.VIEW },
      { feature: FEATURES.DASHBOARDS, permission: CORE.VIEW },
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: CORE.VIEW },
      { feature: FEATURES.FILE_UPLOAD, permission: CORE.CREATE },
      { feature: FEATURES.ACCESS_CONTROL, permission: CORE.VIEW },
      { feature: FEATURES.USER_MANAGEMENT, permission: CORE.VIEW },
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
    const rolePermissions =
      DEFAULT_ROLE_PERMISSIONS[role] ?? DEFAULT_ROLE_PERMISSIONS[ROLES.CLIENT_USER]
    setUserPermissions(rolePermissions.permissions)
    setIsLoading(false)
  }, [isAuthenticated, tenantUser])

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
      case CORE.MANAGE:
        return CORE.MANAGE

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
      case CORE.VIEW:
        return CORE.VIEW

      case PERMISSIONS.WORK_REQUESTS_CREATE:
      case CORE.CREATE:
        return CORE.CREATE
      case PERMISSIONS.WORK_REQUESTS_UPDATE:
      case CORE.UPDATE:
        return CORE.UPDATE
      case PERMISSIONS.WORK_REQUESTS_DELETE:
      case CORE.DELETE:
        return CORE.DELETE

      case PERMISSIONS.FILE_UPLOAD:
      case CORE.IMPORT:
        return CORE.IMPORT
      case CORE.EXPORT:
        return CORE.EXPORT
      case CORE.APPROVE:
        return CORE.APPROVE

      default:
        return p
    }
  }

  function hasPermission(feature: Feature, permission: Permission): boolean {
    if (isDemoMode) return true
    if (!isAuthenticated || !tenantUser) return false
    if ((tenantUser.role as Role) === ROLES.HOST_ADMIN) return true
    const normalized = normalizePermission(permission)
    return userPermissions.some(
      (p) => p.feature === feature && normalizePermission(p.permission) === normalized,
    )
  }

  function checkPermission(arg1: Feature | string | undefined, arg2?: Permission): boolean {
    if (arg1 === undefined) return true
    if (typeof arg1 === 'string' && !arg2) {
      const [f, p] = String(arg1).split('.') as [Feature, Permission]
      if (!f || !p) return false
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
    if (isDemoMode || (tenantUser?.role as Role) === ROLES.HOST_ADMIN) return [CORE.MANAGE]
    if (!isAuthenticated || !tenantUser) return []
    return userPermissions
      .filter((p) => p.feature === feature)
      .map((p) => normalizePermission(p.permission))
  }

  // Convenience helpers (feature-first)
  const resolveFeatureFromArg = (arg: Feature | string): Feature => {
    const values = Object.values(FEATURES) as string[]
    return (values.includes(String(arg)) ? arg : FEATURES.WORK_REQUESTS) as Feature
  }

  const canCreate = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE.CREATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE.MANAGE)

  const canUpdate = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE.UPDATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE.MANAGE)

  const canDelete = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE.DELETE) ||
    hasPermission(resolveFeatureFromArg(f), CORE.MANAGE)

  const canView = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE.VIEW) ||
    hasPermission(resolveFeatureFromArg(f), CORE.MANAGE) ||
    canCreate(f) ||
    canUpdate(f)

  const canManage = (arg: Feature | string): boolean =>
    hasPermission(resolveFeatureFromArg(arg), CORE.MANAGE)

  const canApprove = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE.UPDATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE.MANAGE)

  const canExport = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE.VIEW) ||
    hasPermission(resolveFeatureFromArg(f), CORE.MANAGE)

  const canImport = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE.IMPORT) ||
    hasPermission(resolveFeatureFromArg(f), CORE.MANAGE)

  const getAccessibleFeatures = (): Feature[] => {
    if (isDemoMode) return Object.values(FEATURES)
    if (!isAuthenticated || !tenantUser) return []
    if ((tenantUser.role as Role) === ROLES.HOST_ADMIN) return Object.values(FEATURES)
    return Array.from(new Set(userPermissions.map((p) => p.feature))) as Feature[]
  }

  const isAdmin = () =>
    !!tenantUser &&
    ([ROLES.HOST_ADMIN, ROLES.CLIENT_ADMIN] as readonly string[]).includes(
      String(tenantUser.role),
    )

  const isHostAdmin = () => String(tenantUser?.role) === ROLES.HOST_ADMIN
  const canManageUsers = () => hasPermission(FEATURES.USER_MANAGEMENT, CORE.MANAGE)
  const canAccessAdmin = () =>
    canAccessFeature(FEATURES.ACCESS_CONTROL) ||
    canAccessFeature(FEATURES.USER_MANAGEMENT) ||
    canAccessFeature(FEATURES.SYSTEM_SETTINGS)

  const isSuperAdmin = () => {
    if (!isAuthenticated || !tenantUser) return false
    return ([ROLES.HOST_ADMIN, ROLES.CLIENT_ADMIN] as readonly string[]).includes(
      String(tenantUser.role),
    )
  }

  const getUserPermissions = () => ({
    workRequests: {
      view: canView(FEATURES.WORK_REQUESTS),
      create: canCreate(FEATURES.WORK_REQUESTS),
      update: canUpdate(FEATURES.WORK_REQUESTS),
      approve: canApprove(FEATURES.WORK_REQUESTS),
    },
    projects: {
      view: canView(FEATURES.PROJECT_MANAGEMENT),
      create: canCreate(FEATURES.PROJECT_MANAGEMENT),
      update: canUpdate(FEATURES.PROJECT_MANAGEMENT),
      delete: canDelete(FEATURES.PROJECT_MANAGEMENT),
    },
    risks: {
      view: canView(FEATURES.RISK_MANAGEMENT),
      manage: canManage(FEATURES.RISK_MANAGEMENT),
    },
    users: {
      view: canView(FEATURES.USER_MANAGEMENT),
      manage: canManageUsers(),
    },
    reports: {
      view: canView(FEATURES.DASHBOARDS),
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
    loading: isLoading,
    Loading: isLoading,
    isDemoMode,
    isAuthenticated,

    // Current user info
    currentRole: tenantUser?.role,
    currentUserRole: tenantUser?.role,
    currentUserId: user?.id,
    currentTenantId: tenantUser?.tenant_id,
    isSuperAdmin,

    // Re-export constants
    FEATURES,
    PERMISSIONS,
    ROLES,
  }
}

export default usePermissions

/* =========================
 * Lightweight Guard Components
 * ========================= */

type GuardBaseProps = {
  children: ReactNode
  fallback?: ReactNode
}

// Widened to accept Feature | string
export function FeatureGuard({
  feature,
  children,
  fallback = null,
}: GuardBaseProps & { feature: Feature | string }) {
  const { canAccessFeature, isLoading } = usePermissions()
  if (isLoading) return null
  return canAccessFeature(feature as Feature) ? <>{children}</> : <>{fallback}</>
}

// Widened to accept Feature | string and Permission | string
export function PermissionGuard({
  feature,
  permission,
  children,
  fallback = null,
}: GuardBaseProps & { feature: Feature | string; permission: Permission | string }) {
  const { hasPermission, isLoading } = usePermissions()
  if (isLoading) return null
  return hasPermission(feature as Feature, permission as Permission) ? (
    <>{children}</>
  ) : (
    <>{fallback}</>
  )
}

// Widened to accept Role or string variants
export function RoleGuard({
  allow,
  children,
  fallback = null,
}: GuardBaseProps & { allow: Role | string | Array<Role | string> }) {
  const { currentUserRole, isLoading } = usePermissions()
  if (isLoading) return null
  const allowed = (Array.isArray(allow) ? allow : [allow]).map(String)
  return allowed.includes(String(currentUserRole)) ? <>{children}</> : <>{fallback}</>
}
