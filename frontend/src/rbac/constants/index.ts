// src/rbac/constants/index.ts

/**
 * Central RBAC constants (no imports to avoid cycles).
 * - Exposes FEATURES, CORE_PERMISSIONS, PERMISSIONS, ROLES
 * - Exposes types: Feature, Permission, Role
 * - Includes helpful ALL_ROLES and legacy alias maps
 */

/* =========================
 * Features
 * ========================= */
export const FEATURES = {
  // Data Management
  MIGRATION_WORKBENCH: 'migration-workbench',
  FILE_UPLOAD: 'file-upload',
  DATA_VALIDATION: 'data-validation',
  EMPLOYEE_DATA_PROCESSING: 'employee-data-processing',

  // Core Business / Projects
  PROJECT_MANAGEMENT: 'project-management',
  WORK_REQUESTS: 'work-requests',
  PROJECT_CHARTER: 'project-charter',
  RISK_MANAGEMENT: 'risk-management',
  RESOURCE_MANAGEMENT: 'resource-management',

  // Reporting & Analytics
  REPORTING: 'reporting',
  DASHBOARDS: 'dashboards',
  ANALYTICS: 'analytics',
  HISTORICAL_DATA: 'historical-data',

  // Administration
  USER_MANAGEMENT: 'user-management',
  ACCESS_CONTROL: 'access-control',
  TENANT_MANAGEMENT: 'tenant-management',
  SYSTEM_SETTINGS: 'system-settings',
  AUDIT_LOGS: 'audit-logs',
  AUDIT: 'audit',
  SYSTEM_HEALTH: 'system-health',
  API_CONFIG: 'api-config',
  INTEGRATIONS: 'integrations',

  // Directory / HR
  EMPLOYEES: 'employees',
  EMPLOYEE_RECORDS: 'employee-records',
  BENEFITS_MANAGEMENT: 'benefits-management',
  PAYROLL_PROCESSING: 'payroll-processing',

  // Talent (for dashboard/menu compatibility)
  TALENT_JOBS: 'talent-jobs',
  TALENT_CANDIDATES: 'talent-candidates',
  TALENT_INTERVIEWS: 'talent-interviews',
  TALENT_OFFERS: 'talent-offers',
} as const;
export type Feature = typeof FEATURES[keyof typeof FEATURES];

/* =========================
 * Permissions
 * ========================= */
export const CORE_PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  APPROVE: 'approve',
  EXPORT: 'export',
  IMPORT: 'import',
} as const;

export const PERMISSIONS = {
  ...CORE_PERMISSIONS,

  // Menu/route gating aliases (legacy)
  // Legacy aliases mapped to canonical permissions
  JOB_MANAGE: CORE_PERMISSIONS.EDIT,
  CANDIDATE_READ: CORE_PERMISSIONS.VIEW,
  INTERVIEW_MANAGE: CORE_PERMISSIONS.EDIT,
  OFFER_MANAGE: CORE_PERMISSIONS.EDIT,

  DATA_PROCESS: CORE_PERMISSIONS.VIEW,
  DATA_ANALYZE: CORE_PERMISSIONS.VIEW,
  DATA_MANAGE: CORE_PERMISSIONS.EDIT,
  DATA_VALIDATE: CORE_PERMISSIONS.EDIT,
  FILE_UPLOAD: CORE_PERMISSIONS.IMPORT,

  AUDIT_VIEW: CORE_PERMISSIONS.VIEW,
  SYSTEM_HEALTH_VIEW: CORE_PERMISSIONS.VIEW,
  SYSTEM_SETTINGS_MANAGE: CORE_PERMISSIONS.EDIT,
  API_CONFIG_MANAGE: CORE_PERMISSIONS.EDIT,
  INTEGRATION_MANAGE: CORE_PERMISSIONS.EDIT,
  ADMIN_ACCESS: CORE_PERMISSIONS.VIEW,

  EMPLOYEE_READ: CORE_PERMISSIONS.VIEW,
  EMPLOYEE_PROCESS: CORE_PERMISSIONS.EDIT,
  BENEFITS_MANAGE: CORE_PERMISSIONS.EDIT,
  PAYROLL_MANAGE: CORE_PERMISSIONS.EDIT,

  // RouteGuard / misc
  TENANT_READ: CORE_PERMISSIONS.VIEW,
  USER_READ: CORE_PERMISSIONS.VIEW,
  PROJECT_READ: CORE_PERMISSIONS.VIEW,
  WORK_REQUEST_READ: CORE_PERMISSIONS.VIEW,
  REPORTING_VIEW: CORE_PERMISSIONS.VIEW,

  // Composite legacy (feature_permission) - these should ideally be refactored to use feature + canonical permission directly
  WORK_REQUESTS_CREATE: CORE_PERMISSIONS.CREATE,
  WORK_REQUESTS_UPDATE: CORE_PERMISSIONS.UPDATE,
  WORK_REQUESTS_DELETE: CORE_PERMISSIONS.DELETE,
} as const;
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/* =========================
 * Roles
 * ========================= */
export const ROLES = {
  HOST_ADMIN: 'host_admin',
  CLIENT_ADMIN: 'client_admin',
  TENANT_ADMIN: 'tenant_admin', // keep explicit key for UI checks
  PROGRAM_MANAGER: 'program_manager',
  CLIENT_USER: 'client_user',
  USER: 'user', // alias used in some placess
} as const;
export type Role = typeof ROLES[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [
  ROLES.HOST_ADMIN,
  ROLES.CLIENT_ADMIN,
  ROLES.TENANT_ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.CLIENT_USER,
  ROLES.USER,
];

/* =========================
 * Legacy mirrors (optional)
 * ========================= */
export const FEATURES_LEGACY = {
  ACCESS_CONTROL:     FEATURES.ACCESS_CONTROL,
  TENANT_MANAGEMENT:  FEATURES.TENANT_MANAGEMENT,
  WORK_REQUESTS:      FEATURES.WORK_REQUESTS,
  PROJECTS:           FEATURES.PROJECT_MANAGEMENT,
  PROJECT_MANAGEMENT: FEATURES.PROJECT_MANAGEMENT,
  RISK_MANAGEMENT:    FEATURES.RISK_MANAGEMENT,
  EMPLOYEES:          FEATURES.EMPLOYEES,
  PROFILES:           FEATURES.EMPLOYEE_RECORDS,
  DASHBOARDS:         FEATURES.DASHBOARDS,
  REPORTING:          FEATURES.REPORTING,
  ANALYTICS:          FEATURES.ANALYTICS,
} as const;

export const PERMISSIONS_LEGACY = {
  VIEW:                 PERMISSIONS.VIEW,
  CREATE:               PERMISSIONS.CREATE,
  EDIT:                 PERMISSIONS.UPDATE, // EDIT -> UPDATE
  DELETE:               PERMISSIONS.DELETE,
  APPROVE:              PERMISSIONS.APPROVE,
  WORK_REQUESTS_CREATE: PERMISSIONS.WORK_REQUESTS_CREATE,
  WORK_REQUESTS_UPDATE: PERMISSIONS.WORK_REQUESTS_UPDATE,
  WORK_REQUESTS_DELETE: PERMISSIONS.WORK_REQUESTS_DELETE,
} as const;
