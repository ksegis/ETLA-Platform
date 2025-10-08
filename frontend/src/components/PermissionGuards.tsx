"use client";

import React from "react";
import {
  usePermissions,
  FEATURES,
  PERMISSIONS,
  type Feature,
  type Permission,
} from "@/hooks/usePermissions";

/* =========================
 * Generic PermissionGuard
 * ========================= */
type GuardProps = {
  feature: Feature;
  permission?: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGuard({
  feature,
  permission = PERMISSIONS.VIEW,
  children,
  fallback = null,
}: GuardProps) {
  const { hasPermission, isAuthenticated, isLoading } = usePermissions();

  if (isLoading) return null;
  if (!isAuthenticated) return <>{fallback}</>;

  return hasPermission(feature, permission) ? <>{children}</> : <>{fallback}</>;
}

/* =========================
 * Convenience Guards
 * ========================= */
type WrapperGuardProps = Omit<GuardProps, "feature">;

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

/* =========================
 * Action Buttons (guarded)
 * ========================= */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fallback?: React.ReactNode;
};

export function WorkRequestCreateButton({
  fallback = null,
  ...btnProps
}: ButtonProps) {
  const { canCreate } = usePermissions();
  return canCreate(FEATURES.WORK_REQUESTS)
    ? <button {...btnProps} />
    : <>{fallback}</>;
}

export function WorkRequestApproveButton({
  fallback = null,
  ...btnProps
}: ButtonProps) {
  const { canApprove } = usePermissions();
  return canApprove(FEATURES.WORK_REQUESTS)
    ? <button {...btnProps} />
    : <>{fallback}</>;
}

export function ProjectCreateButton({
  fallback = null,
  ...btnProps
}: ButtonProps) {
  const { canCreate } = usePermissions();
  return canCreate(FEATURES.PROJECT_MANAGEMENT)
    ? <button {...btnProps} />
    : <>{fallback}</>;
}

export function ReportExportButton({
  fallback = null,
  ...btnProps
}: ButtonProps) {
  const { canExport } = usePermissions();
  // Use DASHBOARDS as the reporting feature proxy
  return canExport(FEATURES.DASHBOARDS)
    ? <button {...btnProps} />
    : <>{fallback}</>;
}

/* =========================
 * Small helpers / UI bits
 * ========================= */
export function NoAccessFallback({
  message = "You do not have access to this content.",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 ${className}`}
    >
      {message}
    </div>
  );
}

export function PermissionStatus({
  feature,
  permission = PERMISSIONS.VIEW,
}: {
  feature: Feature;
  permission?: Permission;
}) {
  const { hasPermission } = usePermissions();
  const ok = hasPermission(feature, permission);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
      }`}
    >
      {ok ? "Allowed" : "No access"}
    </span>
  );
}

/* =========================
 * Debug panel (optional)
 * ========================= */
export function PermissionDebugPanel() {
  const {
    currentUserRole,
    getAccessibleFeatures,
    getPermissionLevel,
    FEATURES: F,
  } = usePermissions();

  const features = getAccessibleFeatures();
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 text-sm text-gray-600">
        <strong>Role:</strong> {String(currentUserRole ?? "unknown")}
      </div>
      <div className="text-xs text-gray-700 space-y-1">
        {features.length === 0 && <div>No accessible features.</div>}
        {features.map((feat) => (
          <div key={feat}>
            <span className="font-mono">{feat}</span>{" "}
            <span className="opacity-70">
              [
              {getPermissionLevel(feat)
                .map((p) => p)
                .join(", ")}
              ]
            </span>
          </div>
        ))}
      </div>

      <details className="mt-3 text-xs text-gray-500">
        <summary className="cursor-pointer select-none">Feature keys</summary>
        <pre className="mt-2 max-h-56 overflow-auto rounded bg-gray-50 p-2">
          {JSON.stringify(F, null, 2)}
        </pre>
      </details>
    </div>
  );
}
