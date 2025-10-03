import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, hasAnyPermission } from "@/lib/rbac";

export function usePermissions() {
  const { currentUserRole, loading } = useAuth();

  const checkPermission = (permission: string): boolean => {
    if (loading) {
      return false; 
    }
    return hasPermission(currentUserRole, permission);
  };

  const checkAnyPermission = (permissions: string[]): boolean => {
    if (loading) {
      return false;
    }
    return hasAnyPermission(currentUserRole, permissions);
  };

  return {
    checkPermission,
    checkAnyPermission,
    currentUserRole,
    loading,
  };
}

