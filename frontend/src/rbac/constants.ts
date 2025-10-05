export const FEATURES = {
  ACCESS_CONTROL: "access_control",
  TENANT_MANAGEMENT: "tenant_management",
  WORK_REQUESTS: "work_requests",
  PROJECTS: "projects",
  PROJECT_MANAGEMENT: "projects",  // legacy alias used in older code
  RISK_MANAGEMENT: "risks",
  EMPLOYEES: "employees",
  PROFILES: "profiles",
  TIMEKEEPING: "timekeeping",
  DASHBOARDS: "dashboards",
} as const;
export type FeatureKey = keyof typeof FEATURES;
export type Feature = typeof FEATURES[FeatureKey];

export const PERMISSIONS = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",

  // legacy “read” aliases some pages still use:
  USER_READ: "view",
  TENANT_READ: "view",
} as const;
export type PermissionKey = keyof typeof PERMISSIONS;
export type Permission = typeof PERMISSIONS[PermissionKey];

export const ROLES = {
  PLATFORM_ADMIN: "platform_admin",
  HOST_ADMIN: "platform_admin",   // legacy alias used by some UIs
  TENANT_ADMIN: "tenant_admin",
  MANAGER: "manager",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;
export type RoleKey = keyof typeof ROLES;
export type Role = typeof ROLES[RoleKey];

