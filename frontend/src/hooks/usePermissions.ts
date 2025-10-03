import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, hasAnyPermission, type Feature, type Permission } from "@/rbac/constants";

export function usePermissions() {
  const { currentUserRole: role, loading: isLoading } = useAuth();

  // Existing permission check functions (assuming they are defined elsewhere or will be adapted)
  // For now, let's assume a simplified version or that they will be refactored.
  // If your actual hasPermission and hasAnyPermission are different, adjust accordingly.

  // ── Aliases expected by page-rbac.tsx ──────────────────────────────────────────
  const checkPermission = (feature: Feature, permission: Permission): boolean => {
    if (isLoading) {
      return false;
    }
    return hasPermission(role, feature, permission);
  };

  const checkAnyPermission = (feature: Feature, permissions: Permission[]): boolean => {
    if (isLoading) {
      return false;
    }
    return hasAnyPermission(role, feature, permissions);
  };

  return {
    // existing API (if any, otherwise remove)
    // hasPermission: (f, p) => hasPermission(role, f, p),
    // canAccessFeature: (f) => canAccessFeature(role, f),
    // getPermissionLevel: (f) => getPermissionLevel(role, f),
    // canCreate: (f) => canCreate(role, f),

    // ✅ aliases for page-rbac.tsx
    checkPermission,
    checkAnyPermission,

    // ✅ normalize names the page expects
    currentUserRole: role ?? null,
    loading: isLoading === undefined ? false : isLoading,
  };
}

