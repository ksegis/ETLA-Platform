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
 * Core permission names used across the app (lowercase, single words).
 * Exposed so hooks/components can normalize against a stable set.
 */
export const CORE_PERMISSIONS = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  APPROVE: "approve",
  EXPORT: "export",
  IMPORT: "import",
} as const;

// -----------------------------
// FEATURES (with safe backfills)
// -----------------------------
const F = (BASE_FEATURES ?? {}) as Record<string, string>;

export const FEATURES = {
  ...F,

  // Data Management
  MIGRATION_WORKBENCH: F.MIGRATION_WORKBENCH ?? "migration-workbench",
  FILE_UPLOAD: F.FILE_UPLOAD ?? "file-upload",
  DATA_VALIDATION: F.DATA_VALIDATION ?? "data-validation",
  EMPLOYEE_DATA_PROCESSING: F.EMPLOYEE_DATA_PROCESSING ?? "employee-data-processing",

  // Core Business / Projects
  PROJECT_MANAGEMENT: F.PROJECT_MANAGEMENT ?? F.PROJECTS ?? "project-management",
  PROJECTS: F.PROJECTS ?? F.PROJECT_MANAGEMENT ?? "project-management",
  WORK_REQUESTS: F.WORK_REQUESTS ?? "work-requests",
  PROJECT_CHARTER: F.PROJECT_CHARTER ?? "project-charter",
  RISK_MANAGEMENT: F.RISK_MANAGEMENT ?? "risk-management",
  RESOURCE_MANAGEMENT: F.RESOURCE_MANAGEMENT ?? "resource-management",

  // Reporting & Analytics
  REPORTING: F.REPORTING ?? "reporting",
  DASHBOARDS: F.DASHBOARDS ?? "dashboards",
  ANALYTICS: F.ANALYTICS ?? "analytics",
  HISTORICAL_DATA: F.HISTORICAL_DATA ?? "historical-data",

  // Administration
  USER_MANAGEMENT: F.USER_MANAGEMENT ?? "user-management",
  ACCESS_CONTROL: F.ACCESS_CONTROL ?? "access-control",
  TENANT_MANAGEMENT: F.TENANT_MANAGEMENT ?? F.TENANT ?? "tenant-management",
  SYSTEM_SETTINGS: F.SYSTEM_SETTINGS ?? "system-settings",
  AUDIT_LOGS: F.AUDIT_LOGS ?? "audit-logs",
  AUDIT: F.AUDIT ?? "audit",
  SYSTEM_HEALTH: F.SYSTEM_HEALTH ?? "system-health",
  API_CONFIG: F.API_CONFIG ?? "api-config",
  INTEGRATIONS: F.INTEGRATIONS ?? "integrations",

  // Directory / HR
  EMPLOYEES: F.EMPLOYEES ?? F.EMPLOYEE_RECORDS ?? "employee-records",
  EMPLOYEE_RECORDS: F.EMPLOYEE_RECORDS ?? "employee-records",
  BENEFITS_MANAGEMENT: F.BENEFITS_MANAGEMENT ?? "benefits-management",
  PAYROLL_PROCESSING: F.PAYROLL_PROCESSING ?? "payroll-processing",

  // Talent (to satisfy DashboardLayout/guards)
  TALENT_JOBS: F.TALENT_JOBS ?? "talent-jobs",
  TALENT_CANDIDATES: F.TALENT_CANDIDATES ?? "talent-candidates",
  TALENT_INTERVIEWS: F.TALENT_INTERVIEWS ?? "talent-interviews",
  TALENT_OFFERS: F.TALENT_OFFERS ?? "talent-offers",
} as const;

// -----------------------------
// PERMISSIONS (normalized)
// -----------------------------
const PBASE = (BASE_PERMISSIONS ?? {}) as Record<string, string>;

/**
 * Merge any base permissions but force our core/aliases to the normalized (lowercase)
 * values expected by guards and the hook’s normalizer.
 */
export const PERMISSIONS = {
  // keep any project/local additions
  ...PBASE,

  // core, normalized
  ...CORE_PERMISSIONS,

  // menu/route gating aliases
  JOB_MANAGE: CORE_PERMISSIONS.MANAGE,
  CANDIDATE_READ: CORE_PERMISSIONS.VIEW,
  INTERVIEW_MANAGE: CORE_PERMISSIONS.MANAGE,
  OFFER_MANAGE: CORE_PERMISSIONS.MANAGE,

  DATA_PROCESS: CORE_PERMISSIONS.VIEW,
  DATA_ANALYZE: CORE_PERMISSIONS.VIEW,
  DATA_MANAGE: CORE_PERMISSIONS.MANAGE,
  DATA_VALIDATE: CORE_PERMISSIONS.MANAGE,
  FILE_UPLOAD: CORE_PERMISSIONS.IMPORT,

  AUDIT_VIEW: CORE_PERMISSIONS.VIEW,
  SYSTEM_HEALTH_VIEW: CORE_PERMISSIONS.VIEW,
  SYSTEM_SETTINGS_MANAGE: CORE_PERMISSIONS.MANAGE,
  API_CONFIG_MANAGE: CORE_PERMISSIONS.MANAGE,
  INTEGRATION_MANAGE: CORE_PERMISSIONS.MANAGE,
  ADMIN_ACCESS: CORE_PERMISSIONS.VIEW,

  EMPLOYEE_READ: CORE_PERMISSIONS.VIEW,
  EMPLOYEE_PROCESS: CORE_PERMISSIONS.MANAGE,
  BENEFITS_MANAGE: CORE_PERMISSIONS.MANAGE,
  PAYROLL_MANAGE: CORE_PERMISSIONS.MANAGE,

  // misc / RouteGuard helpers
  TENANT_READ: CORE_PERMISSIONS.VIEW,
  USER_READ: CORE_PERMISSIONS.VIEW,
  PROJECT_READ: CORE_PERMISSIONS.VIEW,
  WORK_REQUEST_READ: CORE_PERMISSIONS.VIEW,
  REPORTING_VIEW: CORE_PERMISSIONS.VIEW,

  // composite legacy (feature_permission)
  WORK_REQUESTS_CREATE: CORE_PERMISSIONS.CREATE,
  WORK_REQUESTS_UPDATE: CORE_PERMISSIONS.UPDATE,
  WORK_REQUESTS_DELETE: CORE_PERMISSIONS.DELETE,
} as const;

// -----------------------------
// ROLES (with safe alias)
// -----------------------------
const R = (BASE_ROLES ?? {}) as Record<string, string>;

export const ROLES = {
  ...R,
  HOST_ADMIN: R.HOST_ADMIN ?? "host_admin",
  CLIENT_ADMIN: R.CLIENT_ADMIN ?? "client_admin",
  TENANT_ADMIN: R.TENANT_ADMIN ?? R.CLIENT_ADMIN ?? "client_admin", // alias used by some pages
  PROGRAM_MANAGER: R.PROGRAM_MANAGER ?? "program_manager",
  CLIENT_USER: R.CLIENT_USER ?? "client_user",
  USER: R.USER ?? R.CLIENT_USER ?? "client_user", // alias
} as const;

// All roles list (update if you add roles in lib/rbac)
export const ALL_ROLES: Role[] = [
  ROLES.HOST_ADMIN,
  ROLES.CLIENT_ADMIN,
  ROLES.TENANT_ADMIN,     // alias of CLIENT_ADMIN
  ROLES.PROGRAM_MANAGER,
  ROLES.CLIENT_USER,
  ROLES.USER,
];

// -----------------------------
// Legacy mirrors (search/refactor helpers)
// -----------------------------
export const FEATURES_LEGACY = {
  ACCESS_CONTROL: FEATURES.ACCESS_CONTROL,
  TENANT_MANAGEMENT: FEATURES.TENANT_MANAGEMENT,
  WORK_REQUESTS: FEATURES.WORK_REQUESTS,
  PROJECTS: FEATURES.PROJECT_MANAGEMENT,
  PROJECT_MANAGEMENT: FEATURES.PROJECT_MANAGEMENT,
  RISK_MANAGEMENT: FEATURES.RISK_MANAGEMENT,
  EMPLOYEES: FEATURES.EMPLOYEES,
  PROFILES: FEATURES.EMPLOYEE_RECORDS,
  DASHBOARDS: FEATURES.DASHBOARDS,
  REPORTING: FEATURES.REPORTING,
  ANALYTICS: FEATURES.ANALYTICS,
} as const;

export const PERMISSIONS_LEGACY = {
  VIEW: PERMISSIONS.VIEW,
  CREATE: PERMISSIONS.CREATE,
  EDIT: PERMISSIONS.UPDATE, // EDIT -> UPDATE
  DELETE: PERMISSIONS.DELETE,
  APPROVE: PERMISSIONS.APPROVE,
  WORK_REQUESTS_CREATE: PERMISSIONS.WORK_REQUESTS_CREATE,
  WORK_REQUESTS_UPDATE: PERMISSIONS.WORK_REQUESTS_UPDATE,
  WORK_REQUESTS_DELETE: PERMISSIONS.WORK_REQUESTS_DELETE,
} as const;

// Optional alias if helpful
export { FEATURES as DEFAULT_FEATURES };
