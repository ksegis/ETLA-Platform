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
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import type { User, Session } from '@supabase/supabase-js';

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
  | 'TENANT_UPDATE';

export type RoleKey = 'host_admin' | 'tenant_admin' | 'program_manager' | 'client_admin' | 'client_user';

type PermissionEntry = { feature: Feature; permission: Permission };
type RolePermissions = { role: RoleKey; permissions: PermissionEntry[] };

export type TenantUserLite = {
  user_id: string;
  tenant_id: string;
  role: RoleKey;
};

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  currentTenantId: string | null;
  currentUserRole: RoleKey | null;
  tenantUser: TenantUserLite | null;
  isStable: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: RoleKey) => boolean;
  hasPermission: (feature: Feature, permission: Permission) => boolean;
  checkPermission: (feature: Feature, permission?: Permission) => boolean;
  checkAnyPermission: (feature: Feature, permissions: Permission[]) => boolean;
  setCurrentTenantId: (id: string | null) => void;
  setCurrentUserRole: (role: RoleKey | null) => void;
  ROLES: Record<RoleKey, RolePermissions>;
  signOut: () => Promise<void>;
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
      { feature: 'tenants', permission: 'TENANT_UPDATE' },
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<RoleKey | null>(null);
  const [tenantUser, setTenantUser] = useState<TenantUserLite | null>(null);
  const [isStable, setIsStable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Supabase auth listener
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsStable(true);
      setLoading(false);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user's tenant and role when user logs in
  useEffect(() => {
    if (!user) {
      setCurrentTenantId(null);
      setCurrentUserRole(null);
      return;
    }

    const loadUserTenantAndRole = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        
        // Load the user's tenant_users record
        const { data, error } = await supabase
          .from('tenant_users')
          .select('tenant_id, role')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setCurrentTenantId(data.tenant_id);
          setCurrentUserRole(data.role as RoleKey);
        }
      } catch (error) {
        console.error('Error loading user tenant and role:', error);
      }
    };

    loadUserTenantAndRole();
  }, [user]);

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
    (role: RoleKey) => !!currentUserRole && currentUserRole === role,
    [currentUserRole]
  );

  const ROLES = defaultRoles;

  const hasPermission = useCallback(
    (feature: Feature, permission: Permission) => {
      if (!currentUserRole) return false;
      const rolePerms = ROLES[currentUserRole]?.permissions ?? [];
      return rolePerms.some(
        (p) => p.feature === feature && (p.permission === permission || p.permission === 'manage')
      );
    },
    [currentUserRole, ROLES]
  );

  const checkPermission = useCallback(
    (feature: Feature, permission: Permission = 'view') => hasPermission(feature, permission),
    [hasPermission]
  );

  const checkAnyPermission = useCallback(
    (feature: Feature, permissions: Permission[]) => permissions.some((p) => hasPermission(feature, p)),
    [hasPermission]
  );

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setCurrentTenantId(null);
    setCurrentUserRole(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      currentTenantId,
      currentUserRole,
      tenantUser,
      isStable,
      loading,
      isAuthenticated: !!user, hasRole,      loading,
      isAuthenticated: !!user, hasRole,
      hasPermission,
      checkPermission,
      checkAnyPermission,
      setCurrentTenantId,
      setCurrentUserRole,
      ROLES,
      signOut,
    }),
    [
      user,
      session,
      currentTenantId,
      currentUserRole,
      tenantUser,
      isStable, loading,
      isAuthenticated: !!user, hasRole,      loading,
      isAuthenticated: !!user, hasRole,
      hasPermission,
      checkPermission,
      checkAnyPermission,
      ROLES,
      signOut,
    ]
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



