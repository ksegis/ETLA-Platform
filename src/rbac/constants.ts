// src/rbac/constants.ts
// SHIM: Single source of truth lives in `usePermissions`.
// This file re-exports the canonical RBAC constants/types and provides
// backwards-compatible mirrors for any legacy consumers.

export {
  FEATURES,
  PERMISSIONS,
  ROLES,
} from '@/hooks/usePermissions'

export type {
  Feature,
  Permission,
  Role,
} from '@/hooks/usePermissions'

// ---- Ordered roles list (convenience for UI selectors) ----
export const ALL_ROLES: Role[] = [
  ROLES.HOST_ADMIN,
  ROLES.CLIENT_ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.CLIENT_USER,
  ROLES.USER,
]

// ---- Legacy mirrors (optional) --------------------------------------------
// If you had callers that referenced UPPER_CASE feature/permission tokens,
// keep these maps so they can translate to the canonical values without edits.
// These DO NOT replace the canonical exports above; they’re helpers only.

export const FEATURES_LEGACY = {
  ACCESS_CONTROL:            FEATURES.ACCESS_CONTROL,
  TENANT_MANAGEMENT:         FEATURES.TENANT_MANAGEMENT,
  WORK_REQUESTS:             FEATURES.WORK_REQUESTS,
  PROJECTS:                  FEATURES.PROJECT_MANAGEMENT,  // old alias
  PROJECT_MANAGEMENT:        FEATURES.PROJECT_MANAGEMENT,
  RISK_MANAGEMENT:           FEATURES.RISK_MANAGEMENT,
  EMPLOYEES:                 FEATURES.EMPLOYEES,
  PROFILES:                  FEATURES.EMPLOYEE_RECORDS ?? FEATURES.EMPLOYEES, // fallback
  TIMEKEEPING:               FEATURES.TIMEKEEPING ?? FEATURES.EMPLOYEES,      // fallback if defined later
  DASHBOARDS:                FEATURES.DASHBOARDS,
  REPORTING:                 FEATURES.REPORTING ?? FEATURES.DASHBOARDS,
  ANALYTICS:                 FEATURES.ANALYTICS ?? FEATURES.DASHBOARDS,
} as const

export const PERMISSIONS_LEGACY = {
  VIEW:                      PERMISSIONS.VIEW,
  CREATE:                    PERMISSIONS.CREATE,
  EDIT:                      PERMISSIONS.UPDATE, // map EDIT -> UPDATE
  DELETE:                    PERMISSIONS.DELETE,
  APPROVE:                   PERMISSIONS.APPROVE,

  // Composite legacy names used in some JSX
  WORK_REQUESTS_CREATE:      PERMISSIONS.WORK_REQUESTS_CREATE ?? PERMISSIONS.CREATE,
  WORK_REQUESTS_UPDATE:      PERMISSIONS.WORK_REQUESTS_UPDATE ?? PERMISSIONS.UPDATE,
  WORK_REQUESTS_DELETE:      PERMISSIONS.WORK_REQUESTS_DELETE ?? PERMISSIONS.DELETE,
} as const

// ---------------------------------------------------------------------------
// If your previous file contained additional helpers (labels, groupings,
// navigation config, etc.), paste them BELOW this line. They will continue to
// work, now powered by the canonical exports from usePermissions.
// Example:
//
// export const FEATURE_LABELS: Record<Feature, string> = {
//   [FEATURES.WORK_REQUESTS]: 'Work Requests',
//   [FEATURES.PROJECT_MANAGEMENT]: 'Projects',
//   ...
// }
// ---------------------------------------------------------------------------
