export const FEATURES = {
  ACCESS_CONTROL: 'access_control',
  TENANT_MANAGEMENT: 'tenant_management',
  WORK_REQUESTS: 'work_requests',
  PROJECTS: 'projects',
  EMPLOYEES: 'employees',
  PROFILES: 'profiles',
  TIMEKEEPING: 'timekeeping',

  // Aliases so existing callsites like page-rbac.tsx compile
  PROJECT_MANAGEMENT: 'projects',
  RISK_MANAGEMENT: 'risks',
} as const;

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
} as const;

// Canonical key unions for compile-time safety
export type FeatureKey = keyof typeof FEATURES;
export type PermissionKey = keyof typeof PERMISSIONS;

// ---- Add these aliases to satisfy existing imports ----
export type Feature = FeatureKey;
export type Permission = PermissionKey;

