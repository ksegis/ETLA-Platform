// src/rbac/constants.ts
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


export const ROLES = {
  HOST_ADMIN: 'host_admin',
  CLIENT_ADMIN: 'client_admin',
  TENANT_ADMIN: 'tenant_admin',
  ETL_MANAGER: 'etl_manager',
  DATA_ANALYST: 'data_analyst',
} as const;

export type RoleKey = keyof typeof ROLES;
export type Role = RoleKey;

