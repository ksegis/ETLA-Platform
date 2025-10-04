export const FEATURES = {
  ACCESS_CONTROL: "access_control",
  TENANT_MANAGEMENT: "tenant_management",
  WORK_REQUESTS: "work_requests",
  PROJECTS: "projects",
  EMPLOYEES: "employees",
  PROFILES: "profiles",
  TIMEKEEPING: "timekeeping",
  // Keep this if any page uses it; safe to have
  DASHBOARDS: "dashboards",
} as const;

export const PERMISSIONS = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",

  // Backward-compat for any old call sites you haven’t cleaned yet
  USER_READ: "view",
} as const;

export const ROLES = {
  PLATFORM_ADMIN: "platform_admin",
  TENANT_ADMIN: "tenant_admin",
  MANAGER: "manager",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type Role = typeof ROLES[keyof typeof ROLES];



// Minor change to trigger new build after persistent Vercel cache issue

