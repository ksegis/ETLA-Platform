// server-safe RBAC
import { ROLES, FEATURES, PERMISSIONS, ROLE_MATRIX } from "@/rbac/constants";

type ActorCtx = { userId: string; tenantId: string; role: (typeof ROLES)[keyof typeof ROLES] };

export function assertPermission(
  actor: ActorCtx,
  feature: (typeof FEATURES)[keyof typeof FEATURES],
  permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
) {
  const rolePerms = new Set(ROLE_MATRIX[actor.role]?.[feature as keyof typeof ROLE_MATRIX[typeof ROLES[keyof typeof ROLES]]] ?? []);
  if (!rolePerms.has(permission)) {
    throw new Error("Forbidden: missing permission");
  }
}




