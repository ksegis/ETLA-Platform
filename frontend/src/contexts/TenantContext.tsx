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

export type Tenant = { id: string; name: string };

export type TenantContextType = {
  currentTenantId: string | null;
  setTenantId: (id: string | null) => void;
  currentTenant: Tenant | null;

  /** legacy aliases used around the app */
  selectedTenant: Tenant | null;        // alias of currentTenant
  tenantId: string | null;
  setTenantId: (id: string | null) => void;              // alias of currentTenantId

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
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>(
    initialTenants.length ? initialTenants : [],
  );
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(initialTenantId);
  const [Loading] = useState<boolean>(false);

  useEffect(() => {
    if (!availableTenants.length) {
      setAvailableTenants([{ id: 'default', name: 'Default Tenant' }]);
      if (!currentTenantId) setCurrentTenantId('default');
    }
  }, [availableTenants.length, currentTenantId]);

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

