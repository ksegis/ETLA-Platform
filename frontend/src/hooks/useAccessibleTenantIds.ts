"use client";
import { useTenant } from "@/contexts/TenantContext";

/** Return the list of tenantIds the current user can access. */
export function useAccessibleTenantIds(): string[] {
  const { tenantId } = useTenant();
  // Replace with real logic (RBAC service call)
  return tenantId ? [tenantId] : [];
}

export default useAccessibleTenantIds;

