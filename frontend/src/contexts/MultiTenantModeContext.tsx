"use client";

import { createContext, useContext } from "react";

export type MultiTenantMode = "single" | "multi";
type Ctx = { mode: MultiTenantMode };

const MultiTenantModeContext = createContext<Ctx>({ mode: "single" });

export const useMultiTenantMode = () => useContext(MultiTenantModeContext);
export const MultiTenantModeProvider = MultiTenantModeContext.Provider;

export default MultiTenantModeContext;

