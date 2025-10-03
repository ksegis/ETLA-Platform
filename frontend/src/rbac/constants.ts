// src/rbac/constants.ts

// Canonical feature keys used to compose "<feature>:<action>" permission strings
export const FEATURES = {
  ACCESS_CONTROL: "access_control",
  TENANT_MANAGEMENT: "tenant_management",
  WORK_REQUESTS: "work_requests",
  PROJECTS: "projects",
  EMPLOYEES: "employees",
  PROFILES: "profiles",
  TIMEKEEPING: "timekeeping",
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];

// Canonical actions
export const PERMISSIONS = {
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  APPROVE: "approve",

  // Back-compat legacy keys some pages still reference
  WORK_REQUESTS_CREATE: `${FEATURES.WORK_REQUESTS}:create`,
  WORK_REQUESTS_UPDATE: `${FEATURES.WORK_REQUESTS}:edit`,
  WORK_REQUESTS_DELETE: `${FEATURES.WORK_REQUESTS}:delete`,
} as const;

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve";

// Optional helper (useful elsewhere if needed)
export const permKey = (feature: Feature, action: PermissionAction) =>
  `${feature}:${action}`;
