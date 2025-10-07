'use client';

import React, { type ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Feature, Permission } from '@/rbac/constants';

export type PermissionGuardProps = {
  feature: Feature;
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
};



export function PermissionGuard({
  feature,
  permission,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { checkPermission, loading } = usePermissions();

  if (loading) return null;

  const allowed = checkPermission(feature, permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}


// Placeholder components for other guards mentioned in page-rbac.tsx
// These would typically have their own specific permission checks
export const WorkRequestGuard = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGuard feature="work_requests" permission="view" fallback={fallback}>
    {children}
  </PermissionGuard>
);
export const ProjectGuard = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGuard feature="projects" permission="view" fallback={fallback}>
    {children}
  </PermissionGuard>
);
export const RiskGuard = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <<PermissionGuard feature={FEATURES.RISK_MANAGEMENT} permission={PERMISSIONS.VIEW} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const WorkRequestCreateButton = ({ children, fallback, ...props }: any) => (
  <PermissionGuard feature="work_requests" permission="create" fallback={fallback}>
    <button {...props}>{children}</button>
  </PermissionGuard>
);

export const WorkRequestApproveButton = ({ children, fallback, ...props }: any) => (
  <PermissionGuard feature="work_requests" permission="approve" fallback={fallback}>
    <button {...props}>{children}</button>
  </PermissionGuard>
);

export const ProjectCreateButton = ({ children, fallback, ...props }: any) => (
  <PermissionGuard feature="project_management" permission="create" fallback={fallback}>
    <button {...props}>{children}</button>
  </PermissionGuard>
);

export const ReportExportButton = ({ children, fallback, ...props }: any) => (
  <PermissionGuard feature="reporting" permission="view" fallback={fallback}>
    <button {...props}>{children}</button>
  </PermissionGuard>
);

export const NoAccessFallback = ({ message, className }: { message: string; className?: string }) => (
  <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative ${className}`}>
    <strong className="font-bold">Access Denied:</strong>
    <span className="block sm:inline"> {message}</span>
  </div>
);

export const PermissionStatus = ({ feature, permission }: { feature: Feature; permission: Permission }) => {
  const { checkPermission } = usePermissions();
  const has = checkPermission(feature, permission);
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${has ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {has ? 'Granted' : 'Denied'}
    </span>
  );
};

export const PermissionDebugPanel = () => {
  const { currentUserRole, permissions } = usePermissions();
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium mb-2">Current User Role: {currentUserRole}</h4>
      <h4 className="font-medium mb-2">All Permissions:</h4>
      <pre className="text-xs text-gray-600 overflow-auto">
        {JSON.stringify(permissions, null, 2)}
      </pre>
    </div>
  );
};
