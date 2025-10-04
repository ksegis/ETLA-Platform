"use client";
import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Feature, Permission } from "@/rbac/constants";

export type PermissionGuardProps = {
  feature: Feature;
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function PermissionGuard({ feature, permission, fallback, children }: PermissionGuardProps) {
  const { checkPermission, loading } = usePermissions();
  if (loading) return null;
  return checkPermission(feature, permission) ? <>{children}</> : <>{fallback ?? null}</>;
}

