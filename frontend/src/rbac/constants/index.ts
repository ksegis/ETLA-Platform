// src/rbac/constants/index.ts

// Re-export single source of truth
export { FEATURES, PERMISSIONS, ROLES } from '@/hooks/usePermissions'
export type { Feature, Permission, Role } from '@/hooks/usePermissions'

// Common helpers some files expect
export const ALL_ROLES: import('@/hooks/usePermissions').Role[] = [
  ROLES.HOST_ADMIN,
  ROLES.CLIENT_ADMIN,
  ROLES.TENANT_ADMIN,     // alias of CLIENT_ADMIN
  ROLES.PROGRAM_MANAGER,
  ROLES.CLIENT_USER,
  ROLES.USER,
]

// Optional legacy mirrors (for older imports / code search)
export const FEATURES_LEGACY = {
  ACCESS_CONTROL:     FEATURES.ACCESS_CONTROL,
  TENANT_MANAGEMENT:  FEATURES.TENANT_MANAGEMENT,
  WORK_REQUESTS:      FEATURES.WORK_REQUESTS,
  PROJECTS:           FEATURES.PROJECT_MANAGEMENT,
  PROJECT_MANAGEMENT: FEATURES.PROJECT_MANAGEMENT,
  RISK_MANAGEMENT:    FEATURES.RISK_MANAGEMENT,
  EMPLOYEES:          FEATURES.EMPLOYEES,
  PROFILES:           FEATURES.EMPLOYEE_RECORDS,
  DASHBOARDS:         FEATURES.DASHBOARDS,
  REPORTING:          FEATURES.REPORTING,
  ANALYTICS:          FEATURES.ANALYTICS,
} as const

export const PERMISSIONS_LEGACY = {
  VIEW:                 PERMISSIONS.VIEW,
  CREATE:               PERMISSIONS.CREATE,
  EDIT:                 PERMISSIONS.UPDATE, // map EDIT -> UPDATE
  DELETE:               PERMISSIONS.DELETE,
  APPROVE:              PERMISSIONS.APPROVE,
  WORK_REQUESTS_CREATE: PERMISSIONS.WORK_REQUESTS_CREATE,
  WORK_REQUESTS_UPDATE: PERMISSIONS.WORK_REQUESTS_UPDATE,
  WORK_REQUESTS_DELETE: PERMISSIONS.WORK_REQUESTS_DELETE,
} as const

// Convenience re-exports (so imports from '@//rbac/constants' work)
export { FeatureGuard, PermissionGuard, RoleGuard } from '@/hooks/usePermissions'
