export const FEATURES = {
  ACCESS_CONTROL: 'ACCESS_CONTROL',
  TENANT_MANAGEMENT: 'tenant_management',
  WORK_REQUESTS: 'work_requests',
  PROJECTS: 'projects',
  EMPLOYEES: 'employees',
  PROFILES: 'profiles',
  TIMEKEEPING: 'timekeeping',

  // you already have these variants
  PROJECT_MANAGEMENT: 'projects',
  RISK_MANAGEMENT: 'risk_management',

  // ADD THIS:
  DASHBOARDS: 'dashboards',
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];

export const PERMISSIONS = {
  VIEW: 'VIEW',
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  DELETE: 'DELETE',
  APPROVE: 'APPROVE',
  WORK_REQUESTS_CREATE: 'WORK_REQUESTS_CREATE',
  WORK_REQUESTS_UPDATE: 'WORK_REQUESTS_UPDATE',
  WORK_REQUESTS_DELETE: 'WORK_REQUESTS_DELETE',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ---- Roles ----
export const ROLES = {
  PLATFORM_ADMIN: "platform_admin",
  TENANT_ADMIN: "tenant_admin",
  TENANT_MEMBER: "tenant_member",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Optional ordered list if you need to iterate in the UI
export const ALL_ROLES: Role[] = [
  ROLES.PLATFORM_ADMIN,
  ROLES.TENANT_ADMIN,
  ROLES.TENANT_MEMBER,
];

