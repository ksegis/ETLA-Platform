"use client";
import { createContext, useContext, useState, useEffect } from "react";
// use your existing TenantUser type if you have one
// adjust import path as needed:
import type { TenantUser } from "@/types"; // Assuming TenantUser is in @/types/index.ts or similar

export type TenantContextType = {
  tenantId: string | null;
  selectedTenant: string | null;
  tenantUser: TenantUser | null; // <-- ADD
  // ...existing fields
};

const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  selectedTenant: null,
  tenantUser: null, // <-- ADD default
  // ...existing defaults
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null); // <-- ADD state

  // TODO: wherever you load tenant user today, call setTenantUser(...)
  // Example:
  // useEffect(() => { fetchTenantUser().then(setTenantUser); }, [tenantId]);

  const value: TenantContextType = {
    tenantId,
    selectedTenant,
    tenantUser, // <-- INCLUDE in value
    // ...existing fields
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export const useTenant = () => useContext(TenantContext);
export default TenantContext;





