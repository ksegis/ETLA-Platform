// server-safe RBAC
import { ROLES, FEATURES, PERMISSIONS, ROLE_MATRIX } from "@/rbac/constants";

type Role = (typeof ROLES)[keyof typeof ROLES];
type Feature = (typeof FEATURES)[keyof typeof FEATURES];
type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type ActorCtx = { userId: string; tenantId: string; role: Role };

// Normalize ROLE_MATRIX to a friendly typed shape so lookups don't collapse to `never`
type RoleMatrix = Record<Role, Partial<Record<Feature, readonly Permission[]>>>;

export function assertPermission(
  actor: ActorCtx,
  feature: Feature,
  permission: Permission
) {
  const matrix = ROLE_MATRIX as unknown as RoleMatrix;
  const list = matrix[actor.role]?.[feature] ?? [];
  const rolePerms = new Set<Permission>(list as Permission[]);

  if (!rolePerms.has(permission)) {
    throw new Error("Forbidden: missing permission");
  }
}



