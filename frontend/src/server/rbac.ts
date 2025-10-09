// server-safe RBAC
import { ROLES, FEATURES, PERMISSIONS, ROLE_MATRIX } from "@/rbac/constants";

type ActorCtx = { userId: string; tenantId: string; role: keyof typeof ROLES };

export function assertPermission(
  actor: ActorCtx,
  feature: (typeof FEATURES)[keyof typeof FEATURES],
  permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
) {
  const rolePerms = ROLE_MATRIX[actor.role]?.[feature] ?? new Set<string>();
  if (!rolePerms.has(permission)) {
    throw new Error("Forbidden: missing permission");
  }
}
