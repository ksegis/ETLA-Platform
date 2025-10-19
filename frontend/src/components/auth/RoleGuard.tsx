import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { type RoleKeyKey } from "../../contexts/AuthContext";

type RoleKeyGuardProps = {
  allow: RoleKey[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function RoleGuard({ allow, fallback = null, children }: RoleGuardProps) {
  const { hasRole } = useAuth();
  const allowed = allow.some((r) => hasRole(r));
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}





