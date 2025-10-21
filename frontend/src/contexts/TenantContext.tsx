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
import { useAuth } from './AuthContext';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

export type Tenant = { id: string; name: string };

export type TenantContextType = {
  currentTenantId: string | null;
  setTenantId: (id: string | null) => void;
  currentTenant: Tenant | null;

  /** legacy aliases used around the app */
  selectedTenant: Tenant | null;        // alias of currentTenant
  tenantId: string | null;

  availableTenants: Tenant[];

  /** some parts of the app used both boolean and function-call form */
  isMultiTenant: boolean | (() => boolean);
  isDemoMode: boolean;
  canSelectTenant: boolean;

  setSelectedTenant: (tenantId: string | null) => void;

  /** Some components read this exact casing */
  Loading: boolean;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({
  children,
  initialTenants = [],
  initialTenantId = null,
  demoMode = false,
}: {
  children: ReactNode;
  initialTenants?: Tenant[];
  initialTenantId?: string | null;
  demoMode?: boolean;
}) {
  const auth = useAuth();
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>(
    initialTenants.length ? initialTenants : [],
  );
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(initialTenantId);
  const [Loading, setLoading] = useState<boolean>(true);

  // Load tenant information from AuthContext and database
  useEffect(() => {
    const loadTenantInfo = async () => {
      // Wait for auth to stabilize
      if (!auth.isStable) {
        return;
      }

      setLoading(true);

      try {
        // If user is authenticated, load their tenant from database
        if (auth.user && auth.currentTenantId) {
          const supabase = createSupabaseBrowserClient();
          
          // Load the tenant details from the tenants table
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('id, name')
            .eq('id', auth.currentTenantId)
            .maybeSingle();

          if (tenantError) {
            console.error('Error loading tenant:', tenantError);
          }

          if (tenantData) {
            // Set the available tenants and current tenant
            setAvailableTenants([tenantData]);
            setCurrentTenantId(tenantData.id);
          } else {
            // Fallback: use tenant ID from auth even if we can't load details
            console.warn('Could not load tenant details, using ID from auth');
            setAvailableTenants([{ id: auth.currentTenantId, name: 'Current Tenant' }]);
            setCurrentTenantId(auth.currentTenantId);
          }
        } else if (!auth.user && !auth.loading) {
          // User is not authenticated, use default tenant
          setAvailableTenants([{ id: 'default', name: 'Default Tenant' }]);
          setCurrentTenantId('default');
        }
      } catch (error) {
        console.error('Error in loadTenantInfo:', error);
        // Fallback to default tenant on error
        setAvailableTenants([{ id: 'default', name: 'Default Tenant' }]);
        setCurrentTenantId('default');
      } finally {
        setLoading(false);
      }
    };

    loadTenantInfo();
  }, [auth.isStable, auth.user, auth.currentTenantId, auth.loading]);

  const setSelectedTenant = useCallback((tenantId: string | null) => {
    setCurrentTenantId(tenantId);
  }, []);

  const value = useMemo<TenantContextType>(() => {
    const currentTenant =
      availableTenants.find((t) => t.id === currentTenantId) ?? null;

    const isMultiTenantBool = availableTenants.length > 1;
    const isMultiTenantFn = () => isMultiTenantBool;

    return {
      currentTenantId,
      currentTenant,
      selectedTenant: currentTenant,
      tenantId: currentTenantId,
      availableTenants,
      isMultiTenant: isMultiTenantFn, // callable (code that does isMultiTenant()) will work
      isDemoMode: demoMode,
      canSelectTenant: true,
      setSelectedTenant,
      setTenantId: setSelectedTenant, // Alias for compatibility
      Loading,
    };
  }, [availableTenants, currentTenantId, demoMode, setSelectedTenant, Loading]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextType {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within <TenantProvider>');
  return ctx;
}

/** compatibility exports */
export function useCurrentTenantId(): string | null {
  return useTenant().currentTenantId;
}
export { useTenant as useTenantContext }; // some files import this name
export default useCurrentTenantId;

