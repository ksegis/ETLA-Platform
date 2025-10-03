// src/rbac/constants.ts
export const FEATURES = {
  ACCESS_CONTROL: 'access_control',
  TENANT_MANAGEMENT: 'tenant_management',
  WORK_REQUESTS: 'work_requests',
  PROJECTS: 'projects',
  EMPLOYEES: 'employees',
  PROFILES: 'profiles',
  TIMEKEEPING: 'timekeeping',

  // --- Added aliases to fix TS errors in page-rbac.tsx ---
  PROJECT_MANAGEMENT: 'projects',  // alias -> existing slug
  RISK_MANAGEMENT: 'risks',        // choose canonical slug for risks
} as const;

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
} as const;

export type FeatureKey = keyof typeof FEATURES;
export type PermissionKey = keyof typeof PERMISSIONS;
