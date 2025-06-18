'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email?: string
}

interface Tenant {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  tenantUser: TenantUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshTenant: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: '1',
    email: 'demo@company.com'
  })
  const [tenant, setTenant] = useState<Tenant | null>({
    id: '1',
    name: 'Demo Company',
    slug: 'demo-company',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  const [tenantUser, setTenantUser] = useState<TenantUser | null>({
    id: '1',
    tenant_id: '1',
    user_id: '1',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  const [loading, setLoading] = useState(false)

  const refreshTenant = async () => {
    // Mock implementation
  }

  const signOut = async () => {
    setUser(null)
    setTenant(null)
    setTenantUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      tenant,
      tenantUser,
      loading,
      signOut,
      refreshTenant
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

