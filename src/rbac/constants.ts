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

  // add this to satisfy page-rbac usage
  DASHBOARDS: 'dashboards',
} as const;

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
} as const;

export const ROLES = {
  HOST_ADMIN: "host_admin",
  TENANT_ADMIN: "tenant_admin",
  PROJECT_MANAGER: "project_manager",
  TEAM_MEMBER: "team_member",
  VIEWER: "viewer",
} as const;

// Canonical key unions for compile-time safety
export type FeatureKey = keyof typeof FEATURES;
export type PermissionKey = keyof typeof PERMISSIONS;
export type RoleKey = keyof typeof ROLES;

// ---- Add these aliases to satisfy existing imports ----
export type Feature = FeatureKey;
export type Permission = PermissionKey;
export type Role = RoleKey;

