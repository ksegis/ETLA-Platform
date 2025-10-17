'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

/** ---- Minimal domain types (kept loose to unblock compile) ---- */
export type Feature =
  | 'project-management'
  | 'work-requests'
  | 'reporting'
  | 'users'
  | 'tenants'
  | 'migration-workbench'
  | 'file-upload'
  | 'data-validation'
  | 'employee-data-processing'
  | 'talent-jobs'
  | 'talent-offers'
  | 'analytics';

export type Permission =
  | 'view'
  | 'edit'
  | 'manage'
  | 'analyze'
  | 'process'
  | 'TENANT_UPDATE'; // keep this literal so references compile

export type RoleKey = 'host_admin' | 'tenant_admin' | 'program_manager' | 'client_admin' | 'client_user';

type PermissionEntry = { feature: Feature; permission: Permission };
type RolePermissions = { role: RoleKey; permissions: PermissionEntry[] };

export type TenantUserLite = {
  user_id: string;
  tenant_id: string;
  role: RoleKey;
};

export type AuthContextType = {
  /** Auth-ish state (loose to avoid supabase type dependency) */
  user: { id: string } | null;
  session: any | null;

  /** Multitenant bits used around the app */
  currentTenantId: string | null;
  currentUserRole: RoleKey | null;
  tenantUser: TenantUserLite | null;

  /** Stabilization flag used by some hooks */
  isStable: boolean;

  /** Role/permission helpers expected by components */
  hasRole: (role: RoleKey) => boolean;
  hasPermission: (feature: Feature, permission: Permission) => boolean;
  checkPermission: (feature: Feature, permission?: Permission) => boolean;
  checkAnyPermission: (feature: Feature, permissions: Permission[]) => boolean;

  /** Setters */
  setCurrentTenantId: (id: string | null) => void;
  setCurrentUserRole: (role: RoleKey | null) => void;

  /** Central permissions map used by RoleGuard etc. */
  ROLES: Record<RoleKey, RolePermissions>;
};

const defaultRoles: Record<RoleKey, RolePermissions> = {
  host_admin: {
    role: 'host_admin',
    permissions: [
      { feature: 'tenants', permission: 'manage' },
      { feature: 'users', permission: 'manage' },
      { feature: 'migration-workbench', permission: 'manage' },
      { feature: 'file-upload', permission: 'manage' },
      { feature: 'data-validation', permission: 'process' },
      { feature: 'analytics', permission: 'analyze' },
      { feature: 'project-management', permission: 'manage' },
      { feature: 'work-requests', permission: 'manage' },
      { feature: 'reporting', permission: 'view' },
      { feature: 'tenants', permission: 'TENANT_UPDATE' }, // keep literal available
    ],
  },
  tenant_admin: {
    role: 'tenant_admin',
    permissions: [
      { feature: 'users', permission: 'manage' },
      { feature: 'project-management', permission: 'manage' },
      { feature: 'work-requests', permission: 'manage' },
      { feature: 'reporting', permission: 'view' },
      { feature: 'tenants', permission: 'TENANT_UPDATE' },
    ],
  },
  program_manager: {
    role: 'program_manager',
    permissions: [
      { feature: 'project-management', permission: 'manage' },
      { feature: 'work-requests', permission: 'manage' },
      { feature: 'reporting', permission: 'view' },
    ],
  },
  client_admin: {
    role: 'client_admin',
    permissions: [
      { feature: 'work-requests', permission: 'manage' },
      { feature: 'reporting', permission: 'view' },
    ],
  },
  client_user: {
    role: 'client_user',
    permissions: [
      { feature: 'work-requests', permission: 'view' },
      { feature: 'reporting', permission: 'view' },
    ],
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<RoleKey | null>(null);
  const [tenantUser, setTenantUser] = useState<TenantUserLite | null>(null);
  const [isStable, setIsStable] = useState<boolean>(false);

  // Simulate stabilization after first render (replace with real auth bootstrap as needed)
  useEffect(() => {
    setIsStable(true);
  }, []);

  // Keep tenantUser aligned to current selections
  useEffect(() => {
    if (user && currentTenantId && currentUserRole) {
      setTenantUser({
        user_id: user.id,
        tenant_id: currentTenantId,
        role: currentUserRole,
      });
    } else {
      setTenantUser(null);
    }
  }, [user, currentTenantId, currentUserRole]);

  const hasRole = useCallback(
    (role: RoleKey) => (!!currentUserRole && currentUserRole === role),
    [currentUserRole],
  );

  const ROLES = defaultRoles;

  const hasPermission = useCallback(
    (feature: Feature, permission: Permission) => {
      if (!currentUserRole) return false;
      const rolePerms = ROLES[currentUserRole]?.permissions ?? [];
      return rolePerms.some(
        (p) => p.feature === feature && (p.permission === permission || p.permission === 'manage'),
      );
    },
    [currentUserRole, ROLES],
  );

  const checkPermission = useCallback(
    (feature: Feature, permission: Permission = 'view') => hasPermission(feature, permission),
    [hasPermission],
  );

  const checkAnyPermission = useCallback(
    (feature: Feature, permissions: Permission[]) => permissions.some((p) => hasPermission(feature, p)),
    [hasPermission],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      currentTenantId,
      currentUserRole,
      tenantUser,
      isStable,
      hasRole,
      hasPermission,
      checkPermission,
      checkAnyPermission,
      setCurrentTenantId,
      setCurrentUserRole,
      ROLES,
    }),
    [
      user,
      session,
      currentTenantId,
      currentUserRole,
      tenantUser,
      isStable,
      hasRole,
      hasPermission,
      checkPermission,
      checkAnyPermission,
      ROLES,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
