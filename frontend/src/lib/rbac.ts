// src/lib/rbac.ts

// --- Features (broad + aliases used around the app) ---
export const FEATURES = {
  ACCESS_CONTROL: "access-control",
  TENANT_MANAGEMENT: "tenant-management",
  WORK_REQUESTS: "work-requests",
  PROJECTS: "project-management",
  PROJECT_MANAGEMENT: "project-management", // alias
  RISK_MANAGEMENT: "risk-management",

  EMPLOYEES: "employee-records",
  EMPLOYEE_RECORDS: "employee-records",
  EMPLOYEE_DIRECTORY: "employee-directory",
  PROFILES: "profiles",
  TIMEKEEPING: "timekeeping",

  REPORTING: "reporting",
  DASHBOARDS: "dashboard", // singular to match database
  ANALYTICS: "analytics",
  AUDIT_LOGS: "audit-log",

  SYSTEM_SETTINGS: "system-settings",
  API_CONFIG: "api-config",
  INTEGRATIONS: "integrations",
  SYSTEM_HEALTH: "system-health",

  DATA_MANAGEMENT: "data-management",
  FILE_UPLOAD: "file-upload",
  DATA_VALIDATION: "data-validation",

  PAYROLL: "payroll-processing",
  BENEFITS: "benefits-management",

  JOBS: "job-management",
  CANDIDATES: "candidates",
  INTERVIEWS: "interviews",
  OFFERS: "offers",
  PIPELINE: "pipeline",
  
  // Talent Management features
  TALENT_DASHBOARD: "talent-dashboard",
  TALENT_JOBS: "job-management",
  TALENT_CANDIDATES: "candidates",
  TALENT_INTERVIEWS: "interviews",
  TALENT_OFFERS: "offers",
  TALENT_PIPELINE: "pipeline",
  USER_MANAGEMENT: "user-management",
  
  // Customer Portal features
  CUSTOMER_NOTIFICATIONS: "customer-notifications",
  CUSTOMER_PROJECTS: "customer-projects",
  CUSTOMER_PORTFOLIO: "customer-portfolio",
  
  // ETL features
  ETL_DASHBOARD: "etl-dashboard",
  ETL_JOBS: "etl-jobs",
  AUDIT_LOG: "audit-log",
  
  // HR Analytics
  HR_ANALYTICS: "hr-analytics",
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];

// --- Permissions ---
export const PERMISSIONS = {
  // Core verbs
  VIEW: "VIEW",
  READ: "VIEW",        // alias
  CREATE: "CREATE",
  ADD: "CREATE",       // alias
  UPDATE: "UPDATE",
  EDIT: "UPDATE",      // alias
  DELETE: "DELETE",
  MANAGE: "MANAGE",
  APPROVE: "APPROVE",
  EXPORT: "EXPORT",
  IMPORT: "IMPORT",

  // User management
  USER_READ: "VIEW",
  USER_CREATE: "CREATE",
  USER_UPDATE: "UPDATE",
  USER_DELETE: "DELETE",
  USER_ASSIGN_ROLE: "MANAGE",

  // Tenant
  TENANT_READ: "VIEW",
  TENANT_CREATE: "CREATE",
  TENANT_UPDATE: "UPDATE",
  TENANT_DELETE: "DELETE",

  // Projects
  PROJECT_READ: "VIEW",
  PROJECT_CREATE: "CREATE",
  PROJECT_UPDATE: "UPDATE",
  PROJECT_DELETE: "DELETE",

  // Work Requests (singular)
  WORK_REQUEST_READ: "VIEW",
  WORK_REQUEST_CREATE: "CREATE",
  WORK_REQUEST_UPDATE: "UPDATE",
  WORK_REQUEST_DELETE: "DELETE",

  // Work Requests (plural legacy keys found in code)
  WORK_REQUESTS_CREATE: "CREATE",
  WORK_REQUESTS_UPDATE: "UPDATE",
  WORK_REQUESTS_DELETE: "DELETE",

  // Reporting & dashboards
  REPORTING_VIEW: "VIEW",

  // Talent/ATS area (used by DashboardLayout)
  JOB_MANAGE: "MANAGE",
  CANDIDATE_READ: "VIEW",
  INTERVIEW_MANAGE: "MANAGE",
  OFFER_MANAGE: "MANAGE",

  // Data ops / system pages (used by DashboardLayout)
  DATA_PROCESS: "MANAGE",
  DATA_MANAGE: "MANAGE",
  DATA_ANALYZE: "VIEW",
  FILE_UPLOAD: "CREATE",
  DATA_VALIDATE: "VIEW",
  SYSTEM_HEALTH_VIEW: "VIEW",
  SYSTEM_SETTINGS_MANAGE: "MANAGE",
  API_CONFIG_MANAGE: "MANAGE",
  INTEGRATION_MANAGE: "MANAGE",
  AUDIT_VIEW: "VIEW",

  // Admin gating
  ADMIN_ACCESS: "VIEW",

  // HR / payroll
  EMPLOYEE_READ: "VIEW",
  EMPLOYEE_PROCESS: "MANAGE", // alias for your layout
  BENEFITS_MANAGE: "MANAGE",
  PAYROLL_MANAGE: "MANAGE",
  TIMECARD_READ_ALL: "VIEW",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// --- Roles ---
export const ROLES = {
  HOST_ADMIN: "host_admin",
  CLIENT_ADMIN: "client_admin",
  PRIMARY_CLIENT_ADMIN: "primary_client_admin",
  PROGRAM_MANAGER: "program_manager",
  CLIENT_USER: "client_user",
  USER: "user",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [
  ROLES.HOST_ADMIN,
  ROLES.CLIENT_ADMIN,
  ROLES.PRIMARY_CLIENT_ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.CLIENT_USER,
  ROLES.USER,
];

// --- ROLE_PERMISSIONS (simple map used by RBACTestPanel) ---
// Array of *permission strings* a role is considered to have globally.
// We include a string index signature so code like ROLE_PERMISSIONS[role] compiles
// even if `role` is typed as string upstream.
export type RolePermissionMapSimple =
  (Record<Role, Permission[]> & { [key: string]: Permission[] });

export const ROLE_PERMISSIONS: RolePermissionMapSimple = {
  [ROLES.HOST_ADMIN]: Object.values(PERMISSIONS) as Permission[],
  [ROLES.CLIENT_ADMIN]: [
    PERMISSIONS.VIEW,
    PERMISSIONS.CREATE,
    PERMISSIONS.UPDATE,
    PERMISSIONS.DELETE,
    PERMISSIONS.MANAGE,
  ],
  [ROLES.PRIMARY_CLIENT_ADMIN]: [
    PERMISSIONS.VIEW,
    PERMISSIONS.CREATE,
    PERMISSIONS.UPDATE,
  ],
  [ROLES.PROGRAM_MANAGER]: [
    PERMISSIONS.VIEW,
    PERMISSIONS.CREATE,
    PERMISSIONS.UPDATE,
    PERMISSIONS.MANAGE,
  ],
  [ROLES.CLIENT_USER]: [
    PERMISSIONS.VIEW,
    PERMISSIONS.CREATE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW,
    PERMISSIONS.CREATE,
  ],
};
