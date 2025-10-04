// Re-export whatever is already in the file `../constants.ts`
// (FEATURES, PERMISSIONS, etc.)
export * from "../constants";

// Define ROLES here so imports from "@/rbac/constants" always see it,
// regardless of whether the resolver picks the folder or the file.
export const ROLES = {
  PLATFORM_ADMIN: "platform_admin",
  TENANT_ADMIN: "tenant_admin",
  TENANT_MEMBER: "tenant_member",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [
  ROLES.PLATFORM_ADMIN,
  ROLES.TENANT_ADMIN,
  ROLES.TENANT_MEMBER,
];

