import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { type Role } from "rbac/constants";

type RoleGuardProps = {
  allow: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function RoleGuard({ allow, fallback = null, children }: RoleGuardProps) {
  const { hasRole } = useAuth();
  const allowed = allow.some((r) => hasRole(r));
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}




