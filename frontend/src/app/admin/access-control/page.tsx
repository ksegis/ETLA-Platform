'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePermissions, FEATURES, PERMISSIONS } from '@/hooks/usePermissions'
import { RouteGuard } from '@/components/RouteGuard'
import { PermissionGuard } from '@/hooks/usePermissions'
import TenantScopeBar from '@/components/rbac/TenantScopeBar'
import EntitySwitcher, { EntityType } from '@/components/rbac/EntitySwitcher'
import RBACMatrixGrid from '@/components/rbac/RBACMatrixGrid'
import RBACContextDrawer from '@/components/rbac/RBACContextDrawer'
import RolesPermissionsTab from '@/components/rbac/RolesPermissionsTab'
import RBACAdminService from '@/services/rbac_admin_service'
import { 
  RBACMatrixRowUser, 
  RBACPermissionCatalog, 
  RBACUserDetail, 
  RBACPermissionCell,
  RBACChangeOperation,
  RBACApplyChangesRequest
} from '@/types'
import { Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react'
