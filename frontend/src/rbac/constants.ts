export const FEATURES = {
  PROJECTS: "projects",
  WORK_REQUESTS: "work_requests",
  ACCESS_CONTROL: "access-control",
  TENANT_MANAGEMENT: "tenant-management",
  PROFILES: "profiles",
  EMPLOYEES: "employees",
} as const;

export const PERMISSIONS = {
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  APPROVE: "approve",
} as const;
