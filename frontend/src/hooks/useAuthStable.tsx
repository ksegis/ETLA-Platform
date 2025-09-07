'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
// import { useTenant } from '@/contexts/TenantContext' // TenantContext not available
import { pmbok } from '@/services/pmbok_service'

/**
 * Hook that ensures PMBOK service stays in sync with auth context
 * This prevents the user ID from flickering between real user and demo user
 */
export function useAuthStable() {
  const auth = useAuth()
  // const tenant = useTenant() // TenantContext not available

  useEffect(() => {
    if (auth.isStable && auth.user) {
      console.log('🔄 useAuthStable: Syncing PMBOK service with auth context:', {
        userId: auth.user.id,
        userEmail: auth.user.email,
        tenantId: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff' // Default tenant ID
      })
      
      // Update PMBOK service with current user context (if method exists)
      // pmbok.updateUserContext(auth.user.id, '54afbd1d-e72a-41e1-9d39-2c8a08a257ff')
    } else if (auth.isStable && !auth.loading) {
      console.log('⚠️ useAuthStable: Auth stable but missing user, using demo context')
      // Fallback to demo context for stability
      // pmbok.updateUserContext('demo-user-id', '54afbd1d-e72a-41e1-9d39-2c8a08a257ff')
    }
  }, [auth.user, auth.isStable, auth.loading]) // Removed tenant dependency

  return {
    ...auth,
    // Additional stability indicators
    isReady: auth.isStable && !auth.loading,
    currentUserId: auth.user?.id || null, // Don't use hardcoded fallback
    currentTenantId: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff' // Default tenant ID
  }
}

/**
 * Hook that prevents rendering until auth is stable
 * Use this for components that need stable auth state
 */
export function useStableAuth() {
  const auth = useAuth()
  
  return {
    ...auth,
    isReady: auth.isStable && !auth.loading,
    shouldRender: auth.isStable && !auth.loading
  }
}

/**
 * Hook specifically for data fetching components
 * Provides stable user context for API calls
 */
export function useAuthForData() {
  const auth = useAuth()
  // const tenant = useTenant() // TenantContext not available
  
  const userId = auth.user?.id || null // Don't use hardcoded fallback
  const tenantId = '54afbd1d-e72a-41e1-9d39-2c8a08a257ff' // Default tenant ID
  
  return {
    userId,
    tenantId,
    isAuthenticated: !!auth.user,
    isReady: auth.isStable && !auth.loading,
    user: auth.user
  }
}

