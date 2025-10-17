// src/contexts/MultiTenantModeContext.ts
'use client';

import React, { createContext, useContext, PropsWithChildren } from 'react';
import { useTenant } from './TenantContext';
import { useAuth } from './AuthContext';

type Mode = 'single' | 'multi';

export type MultiTenantMode = {
  mode: Mode;
  isMultiTenant: boolean;
  isDemoMode: boolean;
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
};

// Safe defaults for SSR/initialization
const MultiTenantModeContext = createContext<MultiTenantMode>({
  mode: 'single',
  isMultiTenant: false,
  isDemoMode: false,
  tenantId: null,
  setTenantId: () => {},
});

/**
 * Provider for legacy trees that used <MultiTenantModeProvider>.
 * This derives values from the canonical TenantContext + AuthContext.
 * Assumes TenantProvider and AuthProvider are mounted higher in the tree.
 */
export const MultiTenantModeProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { tenantId, setTenantId } = useTenant();
  const { isDemoMode } = useAuth();

  const isMultiTenant = Boolean(tenantId);
  const value: MultiTenantMode = {
    mode: isMultiTenant ? 'multi' : 'single',
    isMultiTenant,
    isDemoMode: Boolean(isDemoMode),
    tenantId,
    setTenantId,
  };

  return (
    <MultiTenantModeContext.Provider value={value}>
      {children}
    </MultiTenantModeContext.Provider>
  );
};

/**
 * Legacy hook, now a thin adapter over TenantContext + AuthContext.
 * Prefer using useTenant() directly in new code.
 */
export function useMultiTenantMode(): MultiTenantMode {
  const { tenantId, setTenantId } = useTenant();
  const { isDemoMode } = useAuth();

  const isMultiTenant = Boolean(tenantId);
  return {
    mode: isMultiTenant ? 'multi' : 'single',
    isMultiTenant,
    isDemoMode: Boolean(isDemoMode),
    tenantId,
    setTenantId,
  };
}

// Optional convenience if some code still reads the context directly
export const useMultiTenantModeContext = () => useContext(MultiTenantModeContext);

export default MultiTenantModeContext;
