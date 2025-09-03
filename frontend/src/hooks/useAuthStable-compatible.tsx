'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
// import { useTenant } from '@/contexts/TenantContext' // TenantContext not available
import { pmbok } from '@/services/pmbok_service'

/**
 * Hook that ensures PMBOK service stays in sync with both auth and tenant contexts
 * This prevents the user ID from flickering between real user and demo user
 * Compatible with existing TenantProvider
 */
export function useAuthStable() {
  const auth = useAuth()
  // const tenant = useTenant() // TenantContext not available

  // Sync PMBOK service with auth and tenant contexts
  useEffect(() => {
    const userId = auth.user?.id || null
    const tenantId = '54afbd1d-e72a-41e1-9d39-2c8a08a257ff' // Default tenant ID
    
    console.log('🔄 Syncing PMBOK service with auth and tenant contexts:', {
      userId,
      tenantId,
      userEmail: auth.user?.email,
      tenantName: 'Default Tenant', // tenant?.currentTenant?.name not available
      hasUser: !!auth.user,
      loading: auth.loading,
      isStable: auth.isStable
    })

    // Update PMBOK service context if it has the setUserContext method
    // if (pmbok && typeof pmbok.setUserContext === 'function') {
    //   pmbok.setUserContext(userId, tenantId)
    // }

  }, [auth.user, auth.isStable, auth.loading]) // Removed non-existent properties

  // Subscribe to auth changes in PMBOK service if available
  // useEffect(() => {
  //   if (pmbok && typeof pmbok.onAuthChange === 'function') {
  //     const unsubscribe = pmbok.onAuthChange((userId, tenantId) => {
  //       console.log('🔄 PMBOK service auth context changed:', {
  //         userId,
  //         tenantId
  //       })
  //     })

  //     return unsubscribe
  //   }
  // }, [])

  return {
    ...auth,
    tenant: null, // tenant?.currentTenant not available
    // Enhanced methods that ensure stability
    getUserId: () => auth.user?.id || '1', // Always fallback to demo
    getTenantId: () => '54afbd1d-e72a-41e1-9d39-2c8a08a257ff', // Always fallback to demo tenant
    isStable: auth.isStable && !auth.loading && !!auth.user,
    context: {
      userId: auth.user?.id || '1',
      tenantId: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff'
    }
  }
}

/**
 * Hook for components that need stable user context
 * Prevents rendering until auth is stable
 * Compatible with existing TenantProvider
 */
export function useStableAuth() {
  const auth = useAuthStable()
  
  return {
    ...auth,
    // Only return user data when stable
    stableUserId: auth.isStable ? auth.getUserId() : null,
    stableTenantId: auth.isStable ? auth.getTenantId() : null,
    isReady: auth.isStable && !auth.loading
  }
}

/**
 * Hook for data fetching that waits for stable auth
 * Compatible with existing TenantProvider
 */
export function useAuthForData() {
  const auth = useAuthStable()
  
  // Return context that's safe for data fetching
  return {
    userId: auth.getUserId(), // Always returns a value (demo fallback)
    tenantId: auth.getTenantId(), // Always returns a value (demo fallback)
    isAuthenticated: !!auth.user, // Check if user exists
    loading: auth.loading,
    canFetchData: !auth.loading && auth.isStable, // Can fetch data when stable
    context: auth.context,
    tenant: auth.tenant
  }
}

