"use client";

// src/hooks/usePermissions.tsx
import { useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES, FEATURES, CORE_PERMISSIONS, PERMISSIONS, ROLE_MATRIX } from '@/rbac/constants';

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
      ROLE_MATRIX[role] ?? ROLE_MATRIX[ROLES.CLIENT_USER]
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
    if (isDemoMode || (tenantUser?.role as Role) === ROLES.HOST_ADMIN) return [CORE_PERMISSIONS.MANAGE]
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
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.CREATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canUpdate = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.UPDATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canDelete = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.DELETE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canView = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.VIEW) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE) ||
    canCreate(f) ||
    canUpdate(f)

  const canManage = (arg: Feature | string): boolean => {
    if (typeof arg !== 'string') {
      return hasPermission(arg, CORE_PERMISSIONS.MANAGE);
    }
    const feature = resolveFeatureFromArg(arg);
    return hasPermission(feature, CORE_PERMISSIONS.MANAGE);
  };

  const canApprove = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.UPDATE) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canExport = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.VIEW) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

  const canImport = (f: Feature | string) =>
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.IMPORT) ||
    hasPermission(resolveFeatureFromArg(f), CORE_PERMISSIONS.MANAGE)

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
  const canManageUsers = () => hasPermission(FEATURES.USER_MANAGEMENT, CORE_PERMISSIONS.MANAGE)
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





