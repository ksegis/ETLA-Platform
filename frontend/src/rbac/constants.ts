// src/rbac/constants.ts

// NOTE: Import from the server-safe source of truth.
import {
  FEATURES as BASE_FEATURES,
  PERMISSIONS as BASE_PERMISSIONS,
  ROLES as BASE_ROLES,
} from "@/lib/rbac";

// Types (kept simple so they don't depend on client-only code)
export type Feature = string;
export type Permission = string;
export type Role = string;

/**
 * FEATURES re-export with safe legacy backfills.
 * We cast to a loose record to avoid TS errors if some keys are absent in BASE_FEATURES.
 */
const F = BASE_FEATURES as Record<string, string>;

export const FEATURES = {
  ...F,

  // Common aliases/synonyms used across the app (fallbacks keep SSR happy)
  ACCESS_CONTROL: F.ACCESS_CONTROL ?? "access_control",
  TENANT_MANAGEMENT: F.TENANT_MANAGEMENT ?? F.TENANT ?? "tenant",
  WORK_REQUESTS: F.WORK_REQUESTS ?? "work_request",

  // Some code references PROJECT_MANAGEMENT explicitly
  PROJECT_MANAGEMENT: F.PROJECT_MANAGEMENT ?? F.PROJECTS ?? "project",
  RISK_MANAGEMENT: F.RISK_MANAGEMENT ?? "project",

  // Employees / profiles / records
  EMPLOYEES: F.EMPLOYEES ?? F.EMPLOYEE_RECORDS ?? "employee_records",
  EMPLOYEE_RECORDS: F.EMPLOYEE_RECORDS ?? "employee_records",
  PROFILES: F.PROFILES ?? F.EMPLOYEE_RECORDS ?? "employee_records",

  // Reporting / dashboards / analytics
  DASHBOARDS: F.DASHBOARDS ?? F.REPORTING ?? "reporting",
  REPORTING: F.REPORTING ?? "reporting",
  ANALYTICS: F.ANALYTICS ?? F.REPORTING ?? "reporting",
} as const;

// Pass-through re-exports for permissions & roles
export const PERMISSIONS = BASE_PERMISSIONS;
export const ROLES = BASE_ROLES;

// All roles list (update if you add roles in lib/rbac)
export const ALL_ROLES: Role[] = [
  ROLES.HOST_ADMIN,
  ROLES.CLIENT_ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.CLIENT_USER,
  ROLES.USER,
];

// Optional legacy mirrors to ease gradual refactors
export const FEATURES_LEGACY = {
  ACCESS_CONTROL: FEATURES["ACCESS_CONTROL"],
  TENANT_MANAGEMENT: FEATURES["TENANT_MANAGEMENT"],
  WORK_REQUESTS: FEATURES["WORK_REQUESTS"],
  PROJECTS: FEATURES["PROJECT_MANAGEMENT"],
  PROJECT_MANAGEMENT: FEATURES["PROJECT_MANAGEMENT"],
  RISK_MANAGEMENT: FEATURES["RISK_MANAGEMENT"],
  EMPLOYEES: FEATURES["EMPLOYEES"],
  PROFILES: FEATURES["EMPLOYEE_RECORDS"],
  DASHBOARDS: FEATURES["DASHBOARDS"],
  REPORTING: FEATURES["REPORTING"],
  ANALYTICS: FEATURES["ANALYTICS"],
} as const;

const P = BASE_PERMISSIONS as Record<string, string>;
export const PERMISSIONS_LEGACY = {
  VIEW: P["VIEW"],
  CREATE: P["CREATE"],
  EDIT: P["UPDATE"], // EDIT -> UPDATE
  DELETE: P["DELETE"],
  APPROVE: P["APPROVE"],
  WORK_REQUESTS_CREATE: P["WORK_REQUESTS_CREATE"],
  WORK_REQUESTS_UPDATE: P["WORK_REQUESTS_UPDATE"],
  WORK_REQUESTS_DELETE: P["WORK_REQUESTS_DELETE"],
} as const;

export { FEATURES as DEFAULT_FEATURES }; // optional alias if helpful
