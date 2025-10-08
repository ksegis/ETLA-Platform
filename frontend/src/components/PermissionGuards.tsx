"use client";

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { FEATURES, PERMISSIONS } from "@/rbac/constants";
import type { Feature, Permission } from "@/hooks/usePermissions";

/**
 * Core guard props
 */
type PermissionGuardProps = {
  feature: Feature;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Base PermissionGuard: renders children if allowed, fallback otherwise.
 */
export function PermissionGuard({
  feature,
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { checkPermission, loading } = usePermissions();
  if (loading) return null;
  const allowed = checkPermission(feature, permission);
  return <>{allowed ? children : fallback}</>;
}

/**
 * Wrapper guards (default to VIEW permission)
 */
type WrapperGuardProps = {
  permission?: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function WorkRequestGuard({
  permission = PERMISSIONS.VIEW,
  children,
  fallback = null,
}: WrapperGuardProps) {
  return (
    <PermissionGuard
      feature={FEATURES.WORK_REQUESTS as Feature}
      permission={permission}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function ProjectGuard({
  permission = PERMISSIONS.VIEW,
  children,
  fallback = null,
}: WrapperGuardProps) {
  return (
    <PermissionGuard
      feature={FEATURES.PROJECT_MANAGEMENT as Feature}
      permission={permission}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function RiskGuard({
  permission = PERMISSIONS.VIEW,
  children,
  fallback = null,
}: WrapperGuardProps) {
  return (
    <PermissionGuard
      feature={FEATURES.RISK_MANAGEMENT as Feature}
      permission={permission}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Guarded buttons
 */
type GuardedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
};

export function WorkRequestCreateButton({
  children,
  fallback = null,
  ...btnProps
}: GuardedButtonProps) {
  return (
    <PermissionGuard
      feature={FEATURES.WORK_REQUESTS as Feature}
      permission={PERMISSIONS.CREATE}
      fallback={fallback}
    >
      <button {...btnProps}>{children}</button>
    </PermissionGuard>
  );
}

export function WorkRequestApproveButton({
  children,
  fallback = null,
  ...btnProps
}: GuardedButtonProps) {
  // If you don't have APPROVE in your PERMISSIONS, use UPDATE as the gate.
  const approvePerm: Permission =
    (PERMISSIONS as any).APPROVE ?? PERMISSIONS.UPDATE;
  return (
    <PermissionGuard
      feature={FEATURES.WORK_REQUESTS as Feature}
      permission={approvePerm}
      fallback={fallback}
    >
      <button {...btnProps}>{children}</button>
    </PermissionGuard>
  );
}

export function ProjectCreateButton({
  children,
  fallback = null,
  ...btnProps
}: GuardedButtonProps) {
  return (
    <PermissionGuard
      feature={FEATURES.PROJECT_MANAGEMENT as Feature}
      permission={PERMISSIONS.CREATE}
      fallback={fallback}
    >
      <button {...btnProps}>{children}</button>
    </PermissionGuard>
  );
}

export function ReportExportButton({
  children,
  fallback = null,
  ...btnProps
}: GuardedButtonProps) {
  // Some code refers to FEATURES.DASHBOARDS; your constants have DASHBOARDS.
  const REPORTING_FEATURE: Feature =
    ((FEATURES as any).REPORTING as Feature) ?? (FEATURES.DASHBOARDS as Feature);

  return (
    <PermissionGuard
      feature={REPORTING_FEATURE}
      permission={PERMISSIONS.VIEW}
      fallback={fallback}
    >
      <button {...btnProps}>{children}</button>
    </PermissionGuard>
  );
}

/**
 * Status pill to show permission result
 */
export function PermissionStatus({
  feature,
  permission,
}: {
  feature: Feature;
  permission: Permission;
}) {
  const { checkPermission, loading } = usePermissions();
  if (loading) return null;
  const ok = checkPermission(feature, permission);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {ok ? "Allowed" : "Denied"}
    </span>
  );
}

/**
 * Minimal debug panel (kept so imports compile)
 */
export function PermissionDebugPanel() {
  const { currentUserRole, loading } = usePermissions();
  if (loading) return null;
  return (
    <div className="text-sm text-gray-700">
      <div>Current Role: {currentUserRole ?? "unknown"}</div>
    </div>
  );
}

/**
 * Simple fallback block
 */
export function NoAccessFallback({
  message = "You don’t have access to this.",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-gray-600 ${className}`}
    >
      {message}
    </div>
  );
}
