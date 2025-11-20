// RBAC helper functions for permission checks

import { ROLES, FEATURES, PERMISSIONS, type Role } from '@/hooks/usePermissions'

/**
 * Check if user role can approve work requests
 * Only Platform Host roles (host_admin, program_manager) can approve
 */
export function canApproveWorkRequests(userRole: string): boolean {
  return [ROLES.HOST_ADMIN, ROLES.PROGRAM_MANAGER].includes(userRole as any)
}

/**
 * Check if user role is a Platform Host role
 */
export function isPlatformHostRole(userRole: string): boolean {
  return [ROLES.HOST_ADMIN, ROLES.PROGRAM_MANAGER].includes(userRole as any)
}

/**
 * Check if user role is a Primary Customer role (Tier 2)
 */
export function isPrimaryCustomerRole(userRole: string): boolean {
  return [ROLES.CLIENT_ADMIN, ROLES.CLIENT_USER].includes(userRole as any)
}

/**
 * Check if user role is a Sub-Client role (Tier 3)
 */
export function isSubClientRole(userRole: string): boolean {
  return userRole === ROLES.USER
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(userRole: string): string {
  const roleNames: Record<string, string> = {
    [ROLES.HOST_ADMIN]: 'Platform Administrator',
    [ROLES.PROGRAM_MANAGER]: 'Program Manager',
    [ROLES.CLIENT_ADMIN]: 'Client Administrator',
    [ROLES.CLIENT_USER]: 'Client User',
    [ROLES.USER]: 'User'
  }
  return roleNames[userRole] || userRole
}

/**
 * Get permission denial reason for work request approval
 */
export function getApprovalDenialReason(userRole: string): string {
  if (isPrimaryCustomerRole(userRole)) {
    return 'Primary Customers cannot approve work requests. Only Platform Host team members can approve requests.'
  }
  if (isSubClientRole(userRole)) {
    return 'Sub-Client users cannot approve work requests. Please contact your Primary Customer or Platform Host.'
  }
  return 'You do not have permission to approve work requests.'
}

/**
 * Check if user can view portfolio rollup
 * Only Primary Customers can see portfolio across all sub-clients
 */
export function canViewPortfolioRollup(userRole: string): boolean {
  return isPrimaryCustomerRole(userRole)
}

/**
 * Check if user can access Platform Host project management
 */
export function canAccessHostProjectManagement(userRole: string): boolean {
  return isPlatformHostRole(userRole)
}

export default {
  canApproveWorkRequests,
  isPlatformHostRole,
  isPrimaryCustomerRole,
  isSubClientRole,
  getRoleDisplayName,
  getApprovalDenialReason,
  canViewPortfolioRollup,
  canAccessHostProjectManagement
}
